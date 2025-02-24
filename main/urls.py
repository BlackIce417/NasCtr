from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

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
    path('deletep', views.delete_picture, name="delete-picture")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

