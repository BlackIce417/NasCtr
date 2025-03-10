$(document).ready(function () {

    loadAlbums();

    $("#load-albums").click(function (e) {
        e.preventDefault();
        loadAlbums();
        $("#picture-area").hide();
        $("#album-area").show();
    })

    $("#load-pictures").click(function (e) {
        e.preventDefault();
        $("#album-area").hide();
        $.ajax({
            url: loadPicturesUrl,
            method: "GET",
            success: function (data) {
                $("#picture-area").html(data);
                // console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
        $("#picture-area").show();
    })

    $(document).on("click", "#btn-pictruedetail", function (e) {
        let pictureId = $(this).data("picture-id");
        let overlayId = $("#overlay-"+pictureId);
        overlayId.show()
    });

    $(document).on("click", ".confirmBtn, .cancelBtn", function (e) {
        let pictureId = $(this).data("picture-id");
        let overlayId = $("#overlay-"+pictureId);
        overlayId.hide()
    })

    $("#btn-search").click(function (e) {
        e.preventDefault();
        var q = $("#search").val();
        console.log(q);
        $.ajax({
            url: "/search/",
            method: "GET",
            data: { q: q },
            success: function (data) {
                // $("#picture-area").html(data);
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });
});

function loadAlbums() {
    $.ajax({
        url: loadAlbumsUrl,
        method: "GET",
        success: function (data) {
            $("#album-area").html(data);
            // console.log(data);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

function hidePopup(params) {
    $("#overlay").hide();
}



