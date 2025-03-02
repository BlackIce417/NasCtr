$(document).ready(function () {
    $("#load-pictures").click(function(e) {
        e.preventDefault();
        $.ajax({
            url: loadPicturesUrl,
            method: "GET",
            success: function (data) {
                $("#picture-list").html(data);
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
    })
});

