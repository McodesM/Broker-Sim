from django.contrib.auth.backends import ModelBackend
from .models import SimUser

class SimUserBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = SimUser.objects.get(username=username)
        except SimUser.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        return None