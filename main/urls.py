from django.urls import path
from . import views

app_name = "main"

urlpatterns = [
    path('', views.index,),
    path('login/', views._login, name='login'),
    path('logout/', views._logout, name='logout'),
    path('usercenter/', views.index, name='usercenter'),
    path('register/', views.register, name='register'),
    path('create_album/', views.create_album, name='create_album'),
    path('albums/<int:album_id>', views.album, name='albums'),
]

