$(document).ready(function () {
    $(".btn-edit-albuminfo").click(function () {
        $("#overlay").show()
    })
    // $("#overlay").show()
    $("#btn-uplaodimg").click(function() {
        $(".upload-area").show();
        $("#btn-uplaodimg").hide();
    })

    $("#btn-cancelupload").click(function() {
        $(".upload-area").hide()
        $("#btn-uplaodimg").show();
    });

    $(document).on("click", ".picture-item", function (e) {
        $(".modal").show()
        var pictureId = $(this).data("picture-id");
        // console.log(pictureId);
        $.ajax({
            url: viewPictureModalUrl + "?picture_id=" + pictureId,
            method: "GET",
            success: function (data) {
                console.log(data);
                if (data.picture) {
                    $(".modal-content").attr("src", data.picture.image_url);
                    var uploadDate = new Date(data.picture.uploaded_at);
                    $("#modal-upload-date").text((uploadDate.toLocaleString()));
                    $("#modal-album").text(data.picture.belongs_to);
                    $("#modal-description").val(data.picture.description);
                    let htmlTag = data.picture.tags.map(tag => {
                        return $("<a></a>")
                            .attr("href", "#")
                            .text(`#${tag}`)
                            .prop("outerHTML");
                    }).join("");
                    // console.log("html tag: ", htmlTag);
                    $("#modal-tag-area").html(htmlTag);
                } else {
                    console.log("No image found");
                }
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

    $("#close-modal").click(function(e) {
        $(".modal").hide();
    })

    $(".btn-viewdetails").click(function(e) {
        var pictureId = $(this).data("picture-id");
        $("#overlay-view-detail").show();
        $("#form-picture-detail").attr("action", viewPictureDetail + "?picture_id=" + pictureId)
        $.ajax({
            url: viewPictureDetail + "?picture_id=" + pictureId,
            method: "GET",
            success: function (data) {
                console.log(data);
                if (data.picture) {
                    var uploadDate = new Date(data.picture.uploaded_at);
                    $("#upload-date").text((uploadDate.toLocaleString()));
                    $("#album").text(data.picture.belongs_to);
                    $("#detail-description").val(data.picture.description);
                    let htmlTag = data.picture.tags.map(tag => {
                        return $("<a></a>")
                            .attr("href", "#")
                            .text(`#${tag}`)
                            .prop("outerHTML");
                    }).join("");
                    // console.log("html tag: ", htmlTag);
                    $("#album-tag").html(htmlTag);
                    
                } else {
                    console.log("No image found");
                }
            },
        })
    });

    $("#hide-details").click(function(e) {
        $("#overlay-view-detail").hide();
    });
});
function hidePopup(params) {
    $("#overlay").hide();
}
