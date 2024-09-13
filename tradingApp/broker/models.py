from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import json

class SimUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a regular user with a hashed password.
        """
        if not username:
            raise ValueError('The username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a superuser with a hashed password.
        """
        if not username:
            raise ValueError('The username field must be set')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)
    

class SimUser(AbstractUser):
    balance = models.DecimalField(max_digits=20, decimal_places=2, default=100000)
    app_points = models.IntegerField(default=0)
    objects = SimUserManager()
    level = models.CharField(max_length=255, default='Novice')
    profit = models.DecimalField(max_digits=20, decimal_places=2, default=0)

    def __str__(self):
        return self.username

class Orders(models.Model):
    user = models.ForeignKey(SimUser, on_delete=models.CASCADE)
    buy_price = models.DecimalField(max_digits=20, decimal_places=2)
    stock_name = models.CharField(max_length=255)
    order_type= models.CharField(max_length=255)
    number = models.IntegerField()
    datetime = models.DateTimeField(auto_now_add=True)
    sell_price = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    trade_profit = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    user_total_profit = models.DecimalField(max_digits=20, decimal_places=2, default=0)

class Forums(models.Model):
    created_by = models.ForeignKey(SimUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)

class Posts(models.Model):
    creator = models.ForeignKey(SimUser, on_delete=models.CASCADE)
    forum = models.ForeignKey(Forums, on_delete=models.CASCADE)
    message = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    users_liked_array_field = models.TextField(default='[]')
    users_disliked_array_field = models.TextField(default='[]')
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)

    def get_liked_array(self):
        return json.loads(self.users_liked_array_field)

    def set_liked_array(self, array):
        self.users_liked_array_field = json.dumps(array)
    
    def get_disliked_array(self):
        return json.loads(self.users_disliked_array_field)

    def set_disliked_array(self, array):
        self.users_disliked_array_field = json.dumps(array)

