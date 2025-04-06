let indexContent = "home";
const indexContentDict = {
    "home": "#album-area",
    "albums": "#album-area",
    "pictures": "#picture-area",
    "videos": "#video-area",
}

$(document).ready(function () {
    let csrftoken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    searchTag();
    // loadAlbums();
    $("#load-albums").click(function (e) {
        e.preventDefault();
        loadAlbums();
        // $("#picture-area").hide();
        // $("#album-area").show();
    })

    $("#load-pictures").click(function (e) {
        e.preventDefault();
        // $("#album-area").hide();
        $.ajax({
            url: loadPicturesUrl,
            method: "GET",
            success: function (data) {
                // $("#picture-area").html(data);
                // showPictureArea(data);
                // console.log(data);
                showIndexContent("pictures", "#picture-area", data);
            },
            error: function (error) {
                console.log(error);
            }
        })
        // $("#picture-area").show();
    })

    $("#load-videos").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: loadVideosUrl,
            method: "GET",
            success: function (data) {
                // var id = indexContentDict[indexContent]
                // $(id).hide();
                // $("#video-area").html(data);
                // indexContent = "videos";
                showIndexContent("videos", "#video-area", data);
            },
            error: function (error) {
                console.log(error);
            }
        })
        // $("#picture-area").show();
    })

    $(document).on("click", ".btn-viewdetails", function (e) {
        console.log("View details clicked");
        let pictureId = $(this).data("picture-id");
        let overlayId = $("#overlay-" + pictureId);
        overlayId.show()
    });

    $(document).on("click", ".confirmBtn, .cancelBtn", function (e) {
        let pictureId = $(this).data("picture-id");
        let overlayId = $("#overlay-" + pictureId);
        overlayId.hide()
    })

    $("#btn-search").click(function (e) {
        e.preventDefault();
        var q = $("#search").val();
        console.log(q);
        $.ajax({
            url: "/search",
            method: "GET",
            data: { q: q },
            success: function (data) {
                showPictureArea(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

    $(document).on("show.bs.modal", function (e) {
        var btn = $(e.relatedTarget);
        var albumId = btn.data("album-id");
        var albumName = btn.data("album-name");
        $(this).find("#confirmDeleteModalLabel").text("确认删除相册 " + albumName + " 吗？");
        $("#btn-delete-album").off("click").on("click", function (e) {
            $.ajax({
                url: deleteAlbumUrl + albumId,
                method: "POST",
                data: { csrfmiddlewaretoken: csrftoken },
                success: function (data) {
                    if (data.success) {
                        location.reload();
                    }
                },
                error: function (error) {
                    alert("删除相册失败: " + error);
                }
            });
        });
    })

});

function loadAlbums() {
    $.ajax({
        url: loadAlbumsUrl,
        method: "GET",
        success: function (data) {
            // $("#album-area").html(data);
            // console.log(data);
            showIndexContent("albums", "#album-area", data);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

function hidePopup(params) {
    $("#overlay").hide();
}

function showPictureArea(data) {
    $("#album-area").hide();
    $("#picture-area").html(data);
    $("#picture-area").show();
}

function searchTag() {
    var searchKeyword = new URLSearchParams(window.location.search).get("q");
    if (searchKeyword) {
        $("#search").val(searchKeyword);
        setTimeout(() => {
            $("#btn-search").trigger("click");
        }, 50);
    } else {
        loadAlbums();
    }
}

function showIndexContent(content, areaId, data) {
    // var id = indexContentDict[indexContent]
    $(indexContentDict[indexContent]).hide();
    // console.log(data)
    $(areaId).html(data);
    $(areaId).show();
    indexContent = content;
}




