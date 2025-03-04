$(document).ready(function () {

    loadAlbums();

    $("#load-albums").click(function (e) {
        e.preventDefault();
        loadAlbums();
        $("#picture-list").hide();
        $("#album-list").show();
    })

    $("#load-pictures").click(function (e) {
        e.preventDefault();
        $("#album-list").hide();
        $.ajax({
            url: loadPicturesUrl,
            method: "GET",
            success: function (data) {
                $("#picture-list").html(data);
                // console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
        $("#picture-list").show();
    })

    $(document).on("click", "#btn-pictruedetail", function (e) {
        $("#overlay").show()
        console.log("clicked");
    });
});

function loadAlbums() {
    $.ajax({
        url: loadAlbumsUrl,
        method: "GET",
        success: function (data) {
            $("#album-list").html(data);
            // console.log(data);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

