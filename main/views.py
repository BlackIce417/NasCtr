from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import QuerySet
from django.urls import reverse

from itertools import chain

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
    if request.method == "POST":
        name = request.POST["name"]
        try:
            user.username = name
            user.save()
        except Exception as e:
            return HttpResponse(f"修改失败: {e}")
    context = {
        "user": user,
    }
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
    return redirect("main:login")


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
    if request.method == "POST":
        pic_upload_form = PictureForm(request.POST, request.FILES)
        # print(request.FILES)
        if True:
            images = request.FILES.getlist("image[]")
            print(f"images={images}")
            for file in images:
                mime = file.content_type
                if mime.startswith("image"):
                    picture = Picture(
                        name=file.name,
                        description="",
                        image=file,
                        album=album,
                    )
                    picture.save()
                elif mime.startswith("video"):
                    video = Video(
                        name=file.name,
                        description="",
                        video=file,
                        album=album,
                    )
                    video.save()
            return JsonResponse(
                {
                    "success": True,
                    "redirect_url": reverse("main:albums", args=[album.id]),
                }
            )
        else:
            print(f"invalid form")
            return HttpResponse("Upload fail: invalid form")
    search = request.GET.get("search")
    if search:
        pictures = (
            Picture.objects.filter(album=album, tag=search)
            .exclude(picture_type="default_cover")
            .order_by("-uploaded_at")
        )
    else:
        pictures = (
            Picture.objects.filter(album=album)
            .exclude(picture_type="default_cover")
            .order_by("-uploaded_at")
        )
        videos = Video.objects.filter(album=album, tag=search).order_by("-uploaded_at")
    for p in pictures:
        p.media_type = "image"
        p.created_at = p.uploaded_at
    for v in videos:
        v.media_type = "video"
        v.created_at = v.uploaded_at
    media = sorted(
        chain(pictures, videos),
        key=lambda x: x.created_at,
        reverse=True,
    )
    print(f"media={media}")
    context = {"album": album, "media": media}
    return render(request, "main/album.html", context)


@login_required(login_url="/login/")
def delete_picture(request):
    picture_id = request.GET.get("picture")
    # print(f"{picture_id}")
    try:
        picture = Picture.objects.get(id=picture_id)
    except Exception as e:
        return HttpResponse(f"Error: {e}")
    picture.delete()
    referer_url = request.META.get("HTTP_REFERER", "/")
    return HttpResponseRedirect(referer_url)


@login_required(login_url="/login/")
def edit_album(request):
    if request.method == "POST":
        name = request.POST["name"]
        description = request.POST["description"]
        print(f"{request}")
        try:
            album = Album.objects.get(id=request.GET.get("album"))
        except Exception as e:
            return HttpResponse(f"Error: {e}")
        album.name = name
        album.description = description
        album.save()
    return redirect("main:albums", album_id=album.id)


@login_required(login_url="/login/")
def delete_album(request):
    album = Album.objects.get(id=request.GET.get("album"))
    album.delete()
    return JsonResponse({"success": True})


@login_required(login_url="/login/")
def load_pictures(request):
    album = Album.objects.filter(
        host=request.user,
    )
    pictures = Picture.objects.filter(
        album__in=album, picture_type="user_upload"
    ).order_by("-uploaded_at")
    context = {"pictures": pictures, "pictures_count": len(pictures)}
    # print(f"{pictures}")
    return render(request, "main/images_list.html", context)


@login_required(login_url="/login/")
def load_albums(request):
    album_list = Album.objects.filter(host=request.user)
    album = []
    if album_list is not None:
        for a in album_list:
            pictures = Picture.objects.filter(
                album=a, picture_type="user_upload"
            ).order_by("-uploaded_at")
            videos_count = Video.objects.filter(album=a).count()
            album.append(
                {
                    "album": a,
                    "album_cover": a.cover,
                    # "pictures": pictures,
                    "count": len(pictures) + videos_count if len(pictures) > 0 else 0,
                }
            )

    context = {"albums": album, "albums_count": len(album_list)}
    return render(request, "main/album_list.html", context)


@login_required(login_url="/login/")
def load_videos(request):
    album = Album.objects.filter(
        host=request.user,
    )
    videos = Video.objects.filter(album__in=album).order_by("-uploaded_at")
    context = {"videos": videos, "videos_count": len(videos)}
    return render(request, "main/video_list.html", context)


@login_required(login_url="/login/")
def view_picture_modal(reqeust):
    picture_id = reqeust.GET.get("picture_id")
    try:
        picture = Picture.objects.get(id=picture_id)
        return JsonResponse(
            {
                "picture": {
                    "image_url": picture.image.url,
                    "belongs_to": picture.album.name,
                    "description": picture.description,
                    "uploaded_at": picture.uploaded_at,
                    "tags": list(picture.tag.values_list("name", flat=True)),
                }
            }
        )
    except Exception as e:
        return JsonResponse({"error": f"{e}"})


@login_required(login_url="/login/")
def view_picture_detail(request):
    picture_id = request.GET.get("picture_id")
    try:
        picture = Picture.objects.get(id=picture_id)
    except Exception as e:
        return JsonResponse({"error": f"{e}"})
    if request.method == "POST":
        description = request.POST["description"]
        picture.description = description
        tags = [name.strip() for name in request.POST["tag"].split(",") if name.strip()]
        # print(f"tag={tag}")
        for tag in tags:
            t, created = Tag.objects.get_or_create(name=tag)
            picture.tag.add(t)
        picture.save()
        return redirect("main:albums", album_id=picture.album.id)
    return JsonResponse(
        {
            "picture": {
                "belongs_to": picture.album.name,
                "description": picture.description,
                "uploaded_at": picture.uploaded_at,
                "tags": list(picture.tag.values_list("name", flat=True)),
            }
        }
    )


@login_required(login_url="/login/")
def search(request):
    q = request.GET.get("q")
    print(f"{request.GET}")
    if q is None:
        return HttpResponse("No query")
    if q[0] == "#":
        tag = q[1:]
        pictures = Picture.objects.filter(tag__name=tag)
        context = {"pictures": pictures}
        return render(request, "main/images_list.html", context)
    return HttpResponse(f"Not found: {q}")


@login_required(login_url="/login/")
def delete_video(request):
    video_id = request.GET.get("video_id")
    video = Video.objects.get(id=video_id)
    video.delete()
    return HttpResponseRedirect(request.META.get("HTTP_REFERER", "/"))
