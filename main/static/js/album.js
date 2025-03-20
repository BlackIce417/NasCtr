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

    $("#btn-upload-single-img").click(function (e) {
        $("#upload-single-image").click();
    });

    $("#upload-single-image").change(function () {
        let file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                // $("#img-item").attr("src", this.result);
                // $(".img-item").show();
                let $imgItemWrapper = createImageItemWrapper();
                $(".upload-box").before($imgItemWrapper);
                $imgItemWrapper.find("img").attr("src", this.result);
                console.log($imgItemWrapper);
                $imgItemWrapper.show();
            };
        }
    })

    $(document).on("click", ".btn-delete-img-item", function (e) {
        // alert("Delete image item");
        let wrapperId = $(this).attr("id").split("-").pop();
        $("#img-wrapper-" + wrapperId).remove();
    });

});
function hidePopup(params) {
    $("#overlay").hide();
}

function createImageItemWrapper() {
    let uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    let $wrapper = $("<div>").addClass("img-item").attr("id", "img-wrapper-" + uniqueId).css({
        "position": "relative",
        "margin-bottom": "10px"
    });
    let $img = $("<img>").attr("src", "#").css({
        "width": "100%",
        "height": "125px",
        "object-fit": "contain"
    });
    let $button = $("<button>", {
        class: 'd-flex align-items-center justify-content-center btn-delete-img-item',
        id: 'btn-deleteimg',
        type: 'button',
        id: "btn-deleteImgItem-" + uniqueId,
        css: {
            height: '25px',
            width: '100%',
            border: 'none',
            backgroundColor: 'transparent'
        }
    });
    let $svg = $(`
        <svg t="1742375343895" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2775" width="100%" height="80%">
            <path d="M1001.702178 133.586954H22.297822C9.999024 133.586954 0 143.685968 0 155.884777c0 12.298799 9.999024 22.297822 22.297822 22.297822h111.189142v779.023924c0 36.796407 29.997071 66.793477 66.793477 66.793477h623.339127c36.796407 0 66.693487-29.997071 66.693487-66.793477V178.182599h111.289132c12.298799 0 22.297822-9.999024 22.397813-22.297822 0-12.298799-10.099014-22.297822-22.297822-22.297823zM845.917391 957.206523c0 12.298799-9.999024 22.297822-22.297823 22.297822H200.380432c-12.298799 0-22.297822-9.999024-22.297823-22.297822V187.08173H845.917391v770.124793zM378.36305 44.595645h267.173909c12.198809 0 22.197832-9.999024 22.197833-22.297823S657.635778 0 645.436969 0H378.36305c-12.298799 0-22.297822 10.099014-22.297822 22.297822 0 12.298799 10.099014 22.297822 22.297822 22.297823z" fill="" p-id="2776"></path>
            <path d="M400.660873 667.834782c12.298799 0 22.297822-10.099014 22.297822-22.297823V378.463041c0-12.198809-10.099014-22.197832-22.297822-22.297823-12.298799 0-22.297822 10.099014-22.297823 22.297823v267.073918c0 12.298799 10.099014 22.297822 22.297823 22.297823zM623.239137 667.834782c12.298799 0 22.297822-10.099014 22.297822-22.297823V378.463041c0-12.198809-10.099014-22.197832-22.297822-22.297823-12.298799 0-22.297822 10.099014-22.297823 22.297823v267.073918c0 12.298799 10.099014 22.297822 22.297823 22.297823z" fill="" p-id="2777"></path>
        </svg>
        `);
    $button.append($svg);
    $wrapper.append($img, $button);
    return $wrapper;
}