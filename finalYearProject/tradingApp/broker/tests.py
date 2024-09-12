from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import SimUser, Orders, Forums,Posts
import json
from decimal import Decimal

User = get_user_model()

class ViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.retrieve_stock_url = reverse('get-stock-data', kwargs={'scale':'D','ticker': 'AAPL'})
        self.buy_order_url = reverse('buy-order')
        self.sell_stock_url = reverse('sell-stock')
        self.create_forum_url = reverse('create-forum')
        self.create_forum_post_url = reverse('create-post')
        self.delete_post_url = reverse('delete-post', args=[1])
        self.downvote_url = reverse('downvote', args=[1])
        self.upvote_url = reverse('upvote', args=[1])
        self.delete_forum_url = reverse('delete-forum', args=[1])
        self.user_data = {
            'email': 'test@example.com',
            'username': 'test_user',
            'password': 'test_password'
        }
        self.user = User.objects.create_user(username='existing_user', email='existing@example.com', password='existing_password')

    def test_signup(self):
        response = self.client.post(self.signup_url, json.dumps(self.user_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Signed up successfully'})
        self.assertTrue(User.objects.filter(username=self.user_data['username']).exists())

    def test_login_success(self):
        response = self.client.post(self.login_url, json.dumps({'username': 'existing_user', 'password': 'existing_password'}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Logged in successfully'})

    def test_login_failure(self):
        response = self.client.post(self.login_url, json.dumps({'username': 'non_existing_user', 'password': 'wrong_password'}), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {'error': 'Login Failed'})

    def test_logout(self):
        response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Logged out successfully'})

    def test_retrieve_stock_data(self):
        response = self.client.get(self.retrieve_stock_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertTrue(isinstance(data['data'], list))
        for item in data['data']:
            self.assertTrue(isinstance(item, list))
            self.assertEqual(len(item), 2)
            self.assertTrue(isinstance(item[0], str))
            self.assertTrue(isinstance(item[1], float))
    
    def test_buy_order(self):
        initial_balance = self.user.balance
        self.client.force_login(self.user)
        buy_data = {
            'buyPrice': 10.00,
            'stockName': 'AAPL',
            'number': '5'
        }
        response = self.client.post(self.buy_order_url, json.dumps(buy_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Placed Buy Order'})
        self.assertTrue(Orders.objects.filter(user=self.user, buy_price=10.00, stock_name='AAPL', number=5).exists())
        updated_user = User.objects.get(id=self.user.id)
        self.assertEqual(updated_user.balance, initial_balance - Decimal(10.00) * 5)
    
    def test_sell_stock(self):
        initial_balance = self.user.balance
        self.client.force_login(self.user)
        buy_order = Orders.objects.create(user=self.user, buy_price=10.00, stock_name='AAPL', order_type='open', number=10)
        sell_data = {
            'sell_order_id': buy_order.id,
            'num_sell': '10',
            'sell_price': 15.00,
            'stock_name': 'AAPL'
        }
        response = self.client.post(self.sell_stock_url, json.dumps(sell_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Sold AAPL Order'})
        updated_order = Orders.objects.get(id=buy_order.id)
        self.assertEqual(updated_order.order_type, 'closed')
        self.assertEqual(updated_order.sell_price, Decimal(15.00))
        updated_user = User.objects.get(id=self.user.id)
        self.assertEqual(updated_user.balance, initial_balance + Decimal(15.00) * 10)

    def test_create_forum(self):
        self.client.force_login(self.user)
        forum_data = {
            'title': 'Test Forum',
            'description': 'This is a test forum.'
        }
        response = self.client.post(self.create_forum_url, json.dumps(forum_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Successfully created forum'})
        self.assertTrue(Forums.objects.filter(created_by=self.user, title='Test Forum', description='This is a test forum.').exists())
    
    def test_create_forum_post(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        post_data = {
            'forum': forum.id,
            'msg': 'This is a test post.'
        }
        response = self.client.post(self.create_forum_post_url, json.dumps(post_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Successfully created post'})
        self.assertTrue(Posts.objects.filter(creator=self.user, forum=forum, message='This is a test post.').exists())
    
    def test_delete_post(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        parent_post = Posts.objects.create(creator=self.user, forum=forum, message='Parent post')
        post = Posts.objects.create(creator=self.user, forum=forum, message='Test post', parent=parent_post)
        response = self.client.post(reverse('delete-post', args=[post.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Post and its replies deleted'})
        self.assertFalse(Posts.objects.filter(id=post.id).exists())

    def test_delete_parent_post(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        parent_post = Posts.objects.create(creator=self.user, forum=forum, message='Parent post')
        post = Posts.objects.create(creator=self.user, forum=forum, message='Test post', parent=parent_post)
        response = self.client.post(reverse('delete-post', args=[parent_post.id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Post and its replies deleted'})
        self.assertFalse(Posts.objects.filter(id=parent_post.id).exists())
        self.assertFalse(Posts.objects.filter(id=post.id).exists())
    
    def test_downvote(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        post = Posts.objects.create(creator=self.user, forum=forum, message='Test post')
        self.assertEqual(post.likes, 0)
        self.assertEqual(len(post.get_liked_array()), 0)
        self.assertEqual(len(post.get_disliked_array()), 0)
        response = self.client.post(self.downvote_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Downvoted'})
        post.refresh_from_db()
        self.assertEqual(post.likes, -1)
        self.assertEqual(len(post.get_liked_array()), 0)
        self.assertEqual(len(post.get_disliked_array()), 1)
        self.assertIn(self.user.id, post.get_disliked_array())
    
    def test_upvote(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        post = Posts.objects.create(creator=self.user, forum=forum, message='Test post')
        self.assertEqual(post.likes, 0)
        self.assertEqual(len(post.get_liked_array()), 0)
        self.assertEqual(len(post.get_disliked_array()), 0)

        # Perform an upvote
        response = self.client.post(self.upvote_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Upvoted'})
        post.refresh_from_db()
        self.assertEqual(post.likes, 1)
        self.assertEqual(len(post.get_liked_array()), 1)
        self.assertEqual(len(post.get_disliked_array()), 0)
        self.assertIn(self.user.id, post.get_liked_array())

    def test_delete_forum(self):
        self.client.force_login(self.user)
        forum = Forums.objects.create(created_by=self.user, title='Test Forum', description='This is a test forum.')
        post = Posts.objects.create(creator=self.user, forum=forum, message='Test post')
        self.assertTrue(Forums.objects.filter(id=forum.id).exists())
        self.assertTrue(Posts.objects.filter(id=post.id).exists())
        response = self.client.post(self.delete_forum_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Forum and its Posts deleted'})
        self.assertFalse(Forums.objects.filter(id=forum.id).exists())
        self.assertFalse(Posts.objects.filter(id=post.id).exists())
