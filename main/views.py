import mimetypes
import os

from django.http import FileResponse, Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import QuerySet
from django.urls import reverse

from itertools import chain

from .models import *
from .forms import *


# Create your views here.


def _is_image_file(uploaded_file):
    mime = (uploaded_file.content_type or "").lower()
    if mime.startswith("image/"):
        return True
    _, ext = os.path.splitext(uploaded_file.name.lower())
    return ext in {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"}


def _is_video_file(uploaded_file):
    mime = (uploaded_file.content_type or "").lower()
    if mime.startswith("video/"):
        return True
    _, ext = os.path.splitext(uploaded_file.name.lower())
    return ext in {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


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
    album = get_object_or_404(Album, host=request.user, id=album_id)
    if request.method == "POST":
        media_files = request.FILES.getlist("media[]") or request.FILES.getlist("image[]")
        if not media_files:
            return JsonResponse({"success": False, "message": "未选择文件"}, status=400)

        uploaded_images = 0
        uploaded_videos = 0
        ignored_files = []

        for media_file in media_files:
            if _is_image_file(media_file):
                Picture.objects.create(
                    name=media_file.name,
                    description="",
                    image=media_file,
                    album=album,
                )
                uploaded_images += 1
            elif _is_video_file(media_file):
                Video.objects.create(
                    name=media_file.name,
                    description="",
                    video=media_file,
                    album=album,
                )
                uploaded_videos += 1
            else:
                ignored_files.append(media_file.name)

        return JsonResponse(
            {
                "success": uploaded_images + uploaded_videos > 0,
                "uploaded_images": uploaded_images,
                "uploaded_videos": uploaded_videos,
                "ignored_files": ignored_files,
                "redirect_url": reverse("main:albums", args=[album.id]),
            }
        )

    search = request.GET.get("search")
    if search:
        pictures = (
            Picture.objects.filter(album=album, tag__name=search)
            .exclude(picture_type="default_cover")
            .order_by("-uploaded_at")
        )
        videos = Video.objects.filter(album=album, tag__name=search).order_by("-uploaded_at")
    else:
        pictures = (
            Picture.objects.filter(album=album)
            .exclude(picture_type="default_cover")
            .order_by("-uploaded_at")
        )
        videos = Video.objects.filter(album=album).order_by("-uploaded_at")
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
    context = {"album": album, "media": media, "media_count": len(media)}
    return render(request, "main/album.html", context)


@login_required(login_url="/login/")
def delete_picture(request):
    picture_id = request.GET.get("picture")
    picture = get_object_or_404(Picture, id=picture_id, album__host=request.user)
    picture.delete()
    referer_url = request.META.get("HTTP_REFERER", "/")
    return HttpResponseRedirect(referer_url)


@login_required(login_url="/login/")
def edit_album(request):
    if request.method == "POST":
        name = request.POST["name"]
        description = request.POST["description"]
        album = get_object_or_404(Album, id=request.GET.get("album"), host=request.user)
        album.name = name
        album.description = description
        album.save()
    return redirect("main:albums", album_id=album.id)


@login_required(login_url="/login/")
def delete_album(request):
    album = get_object_or_404(Album, id=request.GET.get("album"), host=request.user)
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
        picture = Picture.objects.get(id=picture_id, album__host=reqeust.user)
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
        picture = Picture.objects.get(id=picture_id, album__host=request.user)
    except Exception as e:
        return JsonResponse({"error": f"{e}"})
    if request.method == "POST":
        description = request.POST["description"]
        picture.description = description
        tags = [name.strip() for name in request.POST.get("tag", "").split(",") if name.strip()]

        picture.tag.clear()
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
    album_id = request.GET.get("album_id")
    album = Album.objects.filter(id=album_id, host=request.user).first()
    if q is None:
        return HttpResponse("No query")
    if q[0] == "#":
        tag = q[1:]
        if album is not None:
            pictures = Picture.objects.filter(album=album, tag__name=tag)
        else:
            pictures = Picture.objects.filter(tag__name=tag, album__host=request.user)
        context = {"pictures": pictures, "pictures_count": len(pictures), }
        return render(request, "main/images_list.html", context)
    return HttpResponse(f"Not found: {q}")


@login_required(login_url="/login/")
def delete_video(request):
    video_id = request.GET.get("video_id")
    video = get_object_or_404(Video, id=video_id, album__host=request.user)
    video.delete()
    return HttpResponseRedirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="/login/")
def download_picture(request, picture_id):
    picture = get_object_or_404(Picture, id=picture_id, album__host=request.user)
    if not picture.image:
        raise Http404("图片不存在")
    content_type, _ = mimetypes.guess_type(picture.image.name)
    response = FileResponse(
        picture.image.open("rb"),
        as_attachment=True,
        filename=picture.name or os.path.basename(picture.image.name),
        content_type=content_type or "application/octet-stream",
    )
    return response


@login_required(login_url="/login/")
def download_video(request, video_id):
    video = get_object_or_404(Video, id=video_id, album__host=request.user)
    if not video.video:
        raise Http404("视频不存在")
    content_type, _ = mimetypes.guess_type(video.video.name)
    response = FileResponse(
        video.video.open("rb"),
        as_attachment=True,
        filename=video.name or os.path.basename(video.video.name),
        content_type=content_type or "application/octet-stream",
    )
    return response
