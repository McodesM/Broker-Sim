from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import SimUser, Orders, Forums,Posts
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
import json
from datetime import datetime, timezone
from decimal import Decimal, ROUND_DOWN
import yfinance as yf

@csrf_exempt
def signup(request):
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        data_dict = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    print(data_dict)
    if SimUser.objects.filter(username=data_dict['username']):
        return JsonResponse({'error': 'User already exists'}, status=400)
    newUser = SimUser.objects.create_user(email=data_dict['email'], username=data_dict['username'], password=data_dict['password'])
    return JsonResponse({'message': 'Signed up successfully'}, status=200)

@csrf_exempt
def login(request):
    auth_logout(request)
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        login_dict = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    username=login_dict['username']
    password=login_dict['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        auth_login(request, user)
        print("Logged in")
        return JsonResponse({'message': 'Logged in successfully'}, status=200)
    
    return JsonResponse({'error': 'Login Failed'}, status=400)

@csrf_exempt
def logout(request):
    auth_logout(request)
    print("Logged Out")
    return JsonResponse({'message': 'Logged out successfully'}, status=200)

def retrieve_stock_data(request, scale, ticker):
    stock = yf.Ticker(ticker)
    if scale == "D":
        data = stock.history(period='1d', interval='1m')
        formatted_dates = data.index.strftime('%H:%M').tolist()
    elif scale == "W":
        data = stock.history(period='1wk', interval='1h')
        formatted_dates = data.index.strftime('%dd:%Hh').tolist()
    elif scale == "M":
        data = stock.history(period='1mo', interval='1d')
        formatted_dates = data.index.strftime('%m/%d').tolist()
    elif scale == "Y":
        data = stock.history(period='1y', interval='1wk')
        formatted_dates = data.index.strftime('%m/%d').tolist()
    else:
        return JsonResponse({'error': 'Invalid scale'}, status=400)
    combined_data_tuples = list(zip(formatted_dates, data['Close']))
    return JsonResponse({'data': combined_data_tuples}, status=200)

@csrf_exempt
def buy_order(request):
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        buy_data_dict = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    try:
        print(buy_data_dict)
        user = request.user
        buy_price = round(buy_data_dict['buyPrice'], 2)
        numberOfStocks=int(buy_data_dict['number'])
        new_buy_order = Orders(user=user, buy_price=buy_price, stock_name=buy_data_dict['stockName'], order_type='open', number=numberOfStocks)
        new_buy_order.save()
        print("BUY ORDER FUNCTION working")
        calc = Decimal(buy_price)*Decimal(numberOfStocks)
        print(user.balance)
        new_balance = user.balance-calc
        print(new_balance)
        user.balance = new_balance
        user.save()
        return JsonResponse({'message': 'Placed Buy Order'}, status=200)
    except:
        return JsonResponse({'error': 'Error processing buy order'}, status=500)
    
def get_trades(request):
    user = request.user
    trades = Orders.objects.filter(user=user)
    serialized_data = []
    for trade in trades:
        serialized_data.append({
            'id': trade.id,
            'buy_price': trade.buy_price,
            'stock_name': trade.stock_name,
            'order_type': trade.order_type,
            'number': trade.number,
            'datetime': trade.datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'sell_price': trade.sell_price,
            'profit': trade.trade_profit,
            'user_total_profit': trade.user_total_profit
        })
    serialized_data.sort(key=lambda x: x['datetime'])
    return JsonResponse({'data': serialized_data})

@csrf_exempt
def sell_stock(request):
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        sell_data_dict = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    print(sell_data_dict)
    user = request.user
    sell_ID = sell_data_dict['sell_order_id']
    number_to_sell = sell_data_dict['num_sell']
    sell_price = sell_data_dict['sell_price']
    order = Orders.objects.filter(id=sell_ID)
    order = order[0]
    print(order.number)
    print(order)
    if order.number==int(number_to_sell):
        new_balance = user.balance + (Decimal(sell_price)*Decimal(number_to_sell))
        print(new_balance)
        user.balance = new_balance
        order.order_type = 'closed'
        new_sell_price = Decimal(round(sell_price, 2))
        profit = round(((new_sell_price-order.buy_price)*Decimal(number_to_sell)), 2)
        order.sell_price = new_sell_price
        order.trade_profit = profit
        user.profit = user.profit + profit
        order.user_total_profit = user.profit
        order.datetime = datetime.now(timezone.utc)
        order.save()
        user.save()
    else:
        order.number = order.number-int(number_to_sell)
        order.save()
        user.balance = user.balance + (Decimal(sell_price)*Decimal(number_to_sell))
        new_sell_price = Decimal(round(sell_price, 2))
        profit = round(((new_sell_price-order.buy_price)*Decimal(number_to_sell)), 2)
        print(profit) 
        user.profit = user.profit + profit
        new_closed_order = Orders(user=user, buy_price=order.buy_price, stock_name=order.stock_name, order_type='closed', number=number_to_sell, sell_price=new_sell_price, trade_profit=profit, user_total_profit=user.profit)
        new_closed_order.save()
        user.save()
    msg = 'Sold ' + sell_data_dict['stock_name'] + ' Order'
    return JsonResponse({'message': msg}, status=200)

def retrieve_user_details(request):
    user = request.user
    user_detail = {
        'id': user.id,
        'admin': user.is_staff,
        'username': user.username,
        'balance': user.balance,
        'points': user.app_points,
        'level': user.level
    }
    return JsonResponse({'data': user_detail}, status=200)

@csrf_exempt
def create_forum(request):
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        create_forum_data = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    print(create_forum_data)
    new_forum = Forums(created_by=request.user, title=create_forum_data['title'], description=create_forum_data['description'])
    new_forum.save()
    return JsonResponse({'message': 'Successfully created forum'}, status=200)

def retrieve_forums(request):
    forums = Forums.objects.all()
    print(forums)
    forum_array = []
    for forum in forums:
        forumData = {
            'id': forum.id,
            'title': forum.title,
            'description': forum.description,
            'datetime': forum.datetime
        }
        forum_array.append(forumData)
    return JsonResponse({'data': forum_array}, status=200)

def level_map(check):
    if check == "up":
        levels = {
            5: 'Apprentice',
            6: 'Apprentice',
            11: 'Investor',
            10: 'Investor',
            20: 'Expert',
            21: 'Expert',
            30: 'Master',
            31: 'Master',
            40: 'Grandmaster',
            41: 'Grandmaster',
            50: 'Market Master',
            50: 'Market Master'
        }
    else:
        levels = {
            3: 'Novice',
            4: 'Novice',
            8: 'Apprentice',
            9: 'Apprentice',
            18: 'Investor',
            19: 'Investor',
            28: 'Expert',
            29: 'Expert',
            38: 'Master',
            39: 'Master',
            48: 'Grandmaster',
            49: 'Grandmaster'
        }
    return levels
@csrf_exempt
def create_forum_post(request):
    levels = level_map("up")
    raw_data = request.body
    data_str = raw_data.decode('utf-8')
    try:
        post_data = json.loads(data_str)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    
    forum = Forums.objects.get(id=post_data['forum'])
    user = request.user
    user.app_points += 1
    if user.app_points in levels:
        user.level = levels.get(user.app_points)
    user.save()
    
    parent_post = None
    if 'parent' in post_data:
        parent_post = Posts.objects.get(id=post_data['parent'])
    
    post = Posts(creator=user, forum=forum, message=post_data['msg'], parent=parent_post)
    post.save()
    
    return JsonResponse({'message': 'Successfully created post'}, status=200)


def get_forum_posts(request, forum_id):
    forum = Forums.objects.get(id=forum_id)
    posts = Posts.objects.filter(forum=forum, parent=None)  

    post_array = []
    for post in posts:
        obj = {
            'id': post.id,
            'creator': post.creator.username,
            'message': post.message,
            'datetime': post.datetime,
            'likes': post.likes,
            'liked_array': post.get_liked_array(),
            'disliked_array': post.get_disliked_array(),
            'replies': get_replies(post)  
        }
        post_array.append(obj)
    
    return JsonResponse({'data': post_array}, status=200)

def get_replies(post):
    replies = []
    for reply in post.replies.all():
        obj = {
            'id': reply.id,
            'creator': reply.creator.username,
            'message': reply.message,
            'datetime': reply.datetime,
            'likes': reply.likes,
            'liked_array': reply.get_liked_array(),
            'disliked_array': reply.get_disliked_array(),
            'replies': get_replies(reply)  
        }
        replies.append(obj)
    return replies

@csrf_exempt
def delete_post(request, post_id):
    post = Posts.objects.get(id=post_id)
    post.delete()
    return JsonResponse({'message': 'Post and its replies deleted'}, status=200)

@csrf_exempt
def upvote(request, post_id):
    print(post_id)
    cur_user = request.user
    post = Posts.objects.filter(id=post_id)
    post = post[0]
    user = post.creator
    liked_users = post.get_liked_array()
    if cur_user.id in liked_users:
        liked_users.remove(cur_user.id)
        post.set_liked_array(liked_users)
        post.likes -=1
        user.app_points -=1
        level_check = "down"
    else:
        if cur_user.id in post.get_disliked_array():
            disliked_array = post.get_disliked_array()
            disliked_array.remove(cur_user.id)
            post.set_disliked_array(disliked_array)
            post.likes +=1
            user.app_points +=1
        post.likes +=1
        liked_users.append(cur_user.id)
        post.set_liked_array(liked_users)
        user.app_points +=1
        level_check = "up"
    levels = level_map(level_check)
    if user.app_points in levels:
        user.level = levels.get(user.app_points)
    user.save()
    post.save()
    return JsonResponse({'message': 'Upvoted'}, status=200)

@csrf_exempt
def downvote(request, post_id):
    cur_user = request.user
    post = Posts.objects.filter(id=post_id)
    post = post[0]
    user = post.creator
    disliked_users = post.get_disliked_array()
    if cur_user.id in disliked_users:
        disliked_users.remove(cur_user.id)
        post.set_disliked_array(disliked_users)
        post.likes +=1
        user.app_points +=1
        level_check = "up"

    else:
        if cur_user.id in post.get_liked_array():
            liked_array = post.get_liked_array()
            liked_array.remove(cur_user.id)
            post.set_liked_array(liked_array)
            post.likes -=1
            user.app_points -=1
        post.likes -=1
        disliked_users.append(cur_user.id)
        post.set_disliked_array(disliked_users)
        user.app_points -=1
        level_check = "down"
    levels = level_map(level_check)
    if user.app_points in levels:
        user.level = levels.get(user.app_points)
    user.save()
    post.save()
    return JsonResponse({'message': 'Downvoted'}, status=200)

def get_all_user_details(request):
    all_users = SimUser.objects.all()
    users_objects_array = []
    for user in all_users:
        rounded_balance = Decimal(user.balance).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        user_score_data = {
            'id': user.id,
            'username': user.username,
            'balance': rounded_balance,
            'points': user.app_points,
            'level': user.level,
            'profit': user.profit
        }
        users_objects_array.append(user_score_data)
    sorted_users = sorted(users_objects_array, key=lambda x: x['points'], reverse=True)
    return JsonResponse({'data': sorted_users}, status=200)

@csrf_exempt
def delete_forum(request, forum_id):
    forum= Forums.objects.get(id=forum_id)
    forum.delete()
    return JsonResponse({'message': 'Forum and its Posts deleted'}, status=200)
    



