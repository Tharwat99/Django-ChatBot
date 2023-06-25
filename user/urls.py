from django.urls import path
from . views import signup_view, signin_view, signout_view

app_name = 'user-app'

urlpatterns = [
    path('register/', signup_view, name='register'),
    path('login/', signin_view, name='login'),
    path('logout/', signout_view, name='logout'),
]
