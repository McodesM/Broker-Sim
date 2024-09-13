from django.urls import path
from .views import *

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('get_stock_data/<str:scale>/<str:ticker>', retrieve_stock_data, name='get-stock-data'),
    path('buy_order/', buy_order, name='buy-order'),
    path('retrieve_trades/', get_trades),
    path('sell_stock/', sell_stock, name='sell-stock'),
    path('retrieve_user_details/', retrieve_user_details),
    path('create_forum/', create_forum, name='create-forum'),
    path('retrieve_forums/', retrieve_forums),
    path('create_post/', create_forum_post, name='create-post'),
    path('retrieve_forum_posts/<int:forum_id>/', get_forum_posts),
    path('delete_post/<int:post_id>/', delete_post, name='delete-post'),
    path('like_post/<int:post_id>/', upvote, name='upvote'),
    path('dislike_post/<int:post_id>/', downvote, name='downvote'),
    path('retrieve_all_user_scores/', get_all_user_details),
    path('delete_forum/<int:forum_id>/', delete_forum, name='delete-forum')
]