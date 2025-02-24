from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import QuerySet

from .models import *
from .forms import *


# Create your views here.


def _login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("main:usercenter")
    return render(request, "main/login.html")


def _logout(request):
    logout(request)
    return redirect("main:usercenter")


@login_required(login_url="/login/")
def index(request):
    user = request.user
    album_list = Album.objects.filter(host=user)
    album = []
    for a in album_list:
        album.append({"album": a, "pictures": Picture.objects.filter(album=a).order_by("-uploaded_at")})
    context = {"user": user, "albums": album, }
    return render(request, "main/index.html", context)


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
            )
            if not user.check_password(password):
                return HttpResponse(f"Fail to register: {e}")
        except Exception as e:
            return HttpResponse(f"Fail to register: {e}")
    return render(request, "main/register.html")


@login_required(login_url="/login/")
def create_album(request):
    if request.method == "POST":
        try:
            new_album = Album(
                host=request.user,
                name=request.POST["album-name"],
                description=request.POST["album-description"],
            )
            new_album.save()
        except Exception as e:
            return HttpResponse(f"Fail to create album: {e}")
        return redirect("main:usercenter")
    return render(request, "main/new_album.html")


@login_required(login_url="/login/")
def album(request, album_id):
    album = Album.objects.get(host=request.user, id=album_id)
    if request.method == 'POST':
        pic_upload_form = PictureForm(request.POST, request.FILES)
        print(request.POST)
        if pic_upload_form.is_valid():
            picture = Picture(
                name = pic_upload_form.cleaned_data["image"].name,
                description = pic_upload_form.cleaned_data["description"],
                image = pic_upload_form.cleaned_data["image"],
                album=album,
            )
            picture.save()
            return redirect("main:albums", album_id=album_id)
        else:
            return HttpResponse("Upload fail")
    form = PictureForm()
    pictures = Picture.objects.filter(album=album)
    context = {"album": album, "pic_form": form, "pictures": pictures}
    return render(request, "main/album.html", context)


def delete_picture(request):
    pass
