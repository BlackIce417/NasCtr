$(document).ready(function () {
    $("#load-pictures").click(function() {
        event.preventDefault();
        $.ajax({
            url: "load-pictures",
            method: "GET",
            success: function (data) {
                $("#picture-list").html(data);
                
            },
            error: function (error) {
                console.log(error);
            }
        })
    })
});

