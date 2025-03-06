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
    path('delete_album/', views.delete_album, name='delete-album'),
    path('albums/<int:album_id>', views.album, name='albums'),
    path('deletep', views.delete_picture, name="delete-picture"),
    path('editalbum', views.edit_album, name="edit-album"),
    path('usercenter/load-pictures/', views.load_pictures, name="load-pictures"),
    path('usercenter/load-albums/', views.load_albums, name="load-albums"),
    path('view-picture-modal', views.view_picture_modal, name="view-picture-modal"),
    path('view-picture-detail', views.view_picture_detail, name="view-picture-detail"),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

