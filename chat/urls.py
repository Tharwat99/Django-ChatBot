from . views import chat_view, remote_feedback_view, remote_data_view
from django.urls import path

app_name = 'chat-app'
urlpatterns = [
    path('home/', chat_view, name = 'home'),
    path('remote_data_view', remote_data_view, name= 'remote_data_view'),
    path('remote_feedback_view', remote_feedback_view, name = 'remote_feedback_view')
   
]