from django.contrib import admin
from .models import SimUser, Orders, Forums, Posts

admin.site.register(SimUser)
admin.site.register(Orders)
admin.site.register(Forums)
admin.site.register(Posts)
# Register your models here.
