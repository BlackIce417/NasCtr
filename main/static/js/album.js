$(document).ready(function () {
    $(".btn-edit-albuminfo").click(function () {
        $("#overlay").show()
    })
    // $("#overlay").show()
    $("#btn-uploadimg").click(function () {
        $("#uploadimg").show();
    })

    $("#btn-cancelupload").click(function () {
        $("#uploadimg").hide();
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

    $("#close-modal").click(function (e) {
        $(".modal").hide();
    })

    $(".btn-viewdetails").click(function (e) {
        var pictureId = $(this).data("picture-id");

        $("#form-picture-detail").attr("action", viewPictureDetail + "?picture_id=" + pictureId)
        $.ajax({
            url: viewPictureDetail + "?picture_id=" + pictureId,
            method: "GET",
            success: function (data) {
                // console.log(data);
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
                    }).join("") + '<button class="btn-add-tag" type="button" >添加</button>';
                    // console.log("html tag: ", htmlTag);
                    $("#overlay-view-detail").show();
                    $("#picture-tag").html(htmlTag);

                } else {
                    console.log("No image found");
                }
            },
        })
    });

    $("#hide-details").click(function (e) {
        $("#overlay-view-detail").hide();
        $("#input-add-tag").val("");
        $("#input-add-tag").hide();
    });

    $(".picture-tag-wrapper").on("click", ".btn-add-tag", function (e) {
        $("#input-add-tag").show();
    });

    $("#btn-upload-single-img").click(function(e) {
        $("#upload-single-image").click(); 
    });
    
    $("#upload-single-image").change(function() {
        let file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function() {
                $("#img-item").attr("src", this.result);
                $(".img-item").show();
            };
        }
    })

    $(document).on("click", "#btn-deleteimg", function (e) {

    });

});
function hidePopup(params) {
    $("#overlay").hide();
}
