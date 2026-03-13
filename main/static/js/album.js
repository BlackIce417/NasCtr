$(document).ready(function () {
    let csrftoken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    var searchUrl = "/search";

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
        $(".modal-c").show()
        var pictureId = $(this).data("picture-id");
        // console.log(pictureId);
        $.ajax({
            url: viewPictureModalUrl + "?picture_id=" + pictureId,
            method: "GET",
            success: function (data) {
                // console.log(data);
                if (data.picture) {
                    $(".modal-content").attr("src", data.picture.image_url);
                    var uploadDate = new Date(data.picture.uploaded_at);
                    $("#modal-upload-date").text((uploadDate.toLocaleString()));
                    $("#modal-album").text(data.picture.belongs_to);
                    if (data.picture.description) {
                        $("#modal-description").text(data.picture.description);
                    } else {
                        $("#modal-description").text("无");
                    }

                    let htmlTag = data.picture.tags.map(tag => {
                        return $("<a></a>")
                            .attr("href", "#")
                            .addClass("tag-link")
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

    $(document).on("click", ".tag-link", function (e) {
        e.preventDefault();
        let tag = $(this).text();
        window.location.href = "/?q=" + encodeURIComponent(tag);
    });

    $(document).on("click", ".btn-close-picture-modal", function (e) {
        $(".modal-c").hide();
    })

    $(document).on("click", ".modal-c", function (e) {
        if (!$(e.target).closest(".picture-content").length) {
            $(".btn-close-picture-modal").click();
        }
    });

    $(document).on("click", ".btn-viewdetails", function (e) {
        e.stopPropagation();
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
                    $("#overlay-view-detail").show();
                    renderEditableTags(data.picture.tags || []);
                    $("#input-add-tag").val("").hide();
                } else {
                    console.log("No image found");
                }
            },
        })
    });

    $(document).on("click", "#hide-details", function (e) {
        $("#overlay-view-detail").hide();
        $("#overlay-tag-manager").hide();
        const $tagInput = $("#input-add-tag");
        $tagInput.val("");
        $tagInput.hide();
        $("#input-tag-values").val("");
    });

    $(document).on("click", ".btn-add-tag", function (e) {
        e.stopPropagation();
        const $btn = $(this);
        const $tagInput = ensureTagInputExists();
        const $tagArea = $("#picture-tag");

        if ($tagArea.length > 0) {
            $tagInput.appendTo($tagArea);
            $tagInput.insertBefore($btn);
        }

        $tagInput.show().focus();
    });

    $(document).on("keydown", "#input-add-tag", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            commitPendingTags();
        }
    });

    $(document).on("blur", "#input-add-tag", function () {
        commitPendingTags();
    });

    $(document).on("click", function (e) {
        if (!$("#overlay-view-detail").is(":visible")) {
            return;
        }
        const isInTagEditor = $(e.target).closest("#picture-tag, #input-add-tag, .btn-add-tag").length > 0;
        if (!isInTagEditor) {
            commitPendingTags();
        }
    });

    $(document).on("submit", "#form-picture-detail", function (e) {
        commitPendingTags();
    });

    $(document).on("click", ".btn-edit-tag", function (e) {
        e.preventDefault();
        e.stopPropagation();
        commitPendingTags();
        renderTagManager(getCurrentTags());
        $("#overlay-tag-manager").show();
    });

    $(document).on("click", "#btn-close-tag-manager", function () {
        $("#overlay-tag-manager").hide();
    });

    $(document).on("click", "#overlay-tag-manager", function (e) {
        if (!$(e.target).closest(".popup").length) {
            $("#overlay-tag-manager").hide();
        }
    });

    $(document).on("click", ".btn-remove-tag-item", function (e) {
        e.preventDefault();
        const tagName = ($(this).attr("data-tag-name") || "").trim();
        if (!tagName) {
            return;
        }

        const remained = getCurrentTags().filter(function (name) {
            return name !== tagName;
        });
        renderEditableTags(remained);
        renderTagManager(remained);
    });

    $("#btn-upload-single-img").click(function (e) {
        $("#upload-single-image").click();
    });

    let mediaFiles = [];
    $("#upload-single-image").change(function () {
        let files = this.files;
        if (files.length === 0) return;
        for (let i = 0; i < files.length; i++) {
            let fileIndex = mediaFiles.length;
            let file = files[i];
            if (file) {
                mediaFiles.push(file);
                let $mediaItemWrapper = createMediaItemWrapper(fileIndex, file);
                $(".upload-box").before($mediaItemWrapper);

                if (isImageFile(file)) {
                    let reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = function () {
                        $mediaItemWrapper.find("img").attr("src", this.result);
                    }
                } else {
                    let objectUrl = URL.createObjectURL(file);
                    let $video = $mediaItemWrapper.find("video");
                    $video.attr("src", objectUrl);
                    $video.on("loadeddata", function () {
                        URL.revokeObjectURL(objectUrl);
                    });
                }

                $mediaItemWrapper.show();
            }
        }
        $(this).val("");
    })


    $(document).on("click", ".video-thumb", function (e) {
        console.log("Video thumbnail clicked");
        const wrapper = $(this).closest(".video-wrapper");
        const overlay = wrapper.find(".overlay");
        overlay.show();
    });

    $(document).on("click", ".btn-close-video-overlay", function (e) {
        const wrapper = $(this).closest(".video-wrapper");
        const overlay = wrapper.find(".overlay");
        const videoContainer = wrapper.find(".video-container");
        overlay.hide();
        videoContainer.find("video")[0].pause();
    });


    $(document).on("click", ".video-overlay", function (e) {
        if (!$(e.target).closest(".video-container").length) {
            $(".btn-close-video-overlay").click();
        }
    });

    $(document).on("click", ".btn-delete-img-item", function (e) {
        let wrapperId = $(this).attr("id").split("-").pop();
        let index = $("#img-wrapper-" + wrapperId).data("index");
        mediaFiles.splice(index, 1);
        $(".img-item").each(function (i) {
            $(this).attr("data-index", i);
        });
        $("#img-wrapper-" + wrapperId).remove();
    });

    $("#btn-upload-image").click(function (e) {
        if (mediaFiles.length === 0) {
            alert("请选择文件");
            return;
        }
        let formData = new FormData();
        mediaFiles.forEach(file => {
            formData.append("media[]", file);
        });
        $.ajax({
            url: "",
            method: "POST",
            data: formData,
            headers: { "X-CSRFToken": csrftoken },
            contentType: false,
            processData: false,
            success: function (data) {
                console.log(data);
                if (data.success) {
                    if (data.ignored_files && data.ignored_files.length > 0) {
                        alert("以下文件类型不支持，已忽略: " + data.ignored_files.join(", "));
                    }
                    window.location.href = data.redirect_url;
                } else {
                    alert(data.message || "上传失败");
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });


    $("#search-in-album").click(function (e) {
        e.preventDefault();
        var q = $("#search").val();
        var albumId = $(this).data("album-id");
        console.log(albumId);
        $.ajax({
            url: "/search",
            method: "GET",
            data: {
                q: q,
                album_id: albumId,
            },
            success: function (data) {
                console.log(data);
                $(".pictures-gallery").replaceWith(data);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

});
function hidePopup(params) {
    $("#overlay").hide();
}

function getCurrentTags() {
    let tags = [];
    $("#picture-tag .tag-link").each(function () {
        const raw = ($(this).text() || "").trim();
        if (!raw) return;
        const tagName = raw.startsWith("#") ? raw.slice(1) : raw;
        if (tagName) {
            tags.push(tagName);
        }
    });
    return tags;
}

function renderEditableTags(tags) {
    const uniqTags = [];
    const seen = new Set();
    tags.forEach(function (tag) {
        const t = (tag || "").trim();
        if (!t) return;
        if (!seen.has(t)) {
            seen.add(t);
            uniqTags.push(t);
        }
    });

    const $tagArea = $("#picture-tag");
    const $tagInput = ensureTagInputExists().detach();
    $tagArea.empty();
    const $tagScrollArea = $('<div class="tag-scroll-area"></div>');

    uniqTags.forEach(function (tag) {
        const $tagChip = $("<a></a>")
            .attr("href", "#")
            .addClass("tag-link")
            .text(`#${tag}`);
        $tagScrollArea.append($tagChip);
    });

    const $addBtn = $('<button class="btn-add-tag" type="button">添加</button>');
    const $editBtn = $('<button class="btn-add-tag btn-edit-tag" type="button">编辑</button>');
    $tagScrollArea.append($tagInput.hide());
    $tagArea.append($tagScrollArea);
    $tagArea.append($addBtn);
    $tagArea.append($editBtn);

    $("#input-tag-values").val(uniqTags.join(","));
}

function ensureTagInputExists() {
    let $tagInput = $("#input-add-tag");
    if ($tagInput.length === 0) {
        $tagInput = $('<input class="add-tag" id="input-add-tag" type="text" />');
        $("#picture-tag").append($tagInput);
    }
    return $tagInput;
}

function commitPendingTags() {
    const $tagInput = $("#input-add-tag");
    const pending = ($tagInput.val() || "").trim();
    if (!pending) {
        $tagInput.hide();
        return;
    }

    const currentTags = getCurrentTags();
    const pendingTags = pending.split(",").map(function (v) {
        return v.trim();
    }).filter(Boolean);
    renderEditableTags(currentTags.concat(pendingTags));

    $tagInput.val("").hide();
}

function renderTagManager(tags) {
    const $list = $("#tag-manager-list");
    if ($list.length === 0) {
        return;
    }

    $list.empty();
    if (!tags || tags.length === 0) {
        $list.append('<div class="tag-manager-empty">暂无标签</div>');
        return;
    }

    tags.forEach(function (tag) {
        const $item = $('<div class="list-group-item tag-manager-item d-flex justify-content-between align-items-center"></div>');
        const $text = $('<span class="tag-manager-text"></span>').text(tag);
        const $remove = $('<button type="button" class="btn btn-outline-danger btn-sm btn-remove-tag-item">删除</button>').attr("data-tag-name", tag);
        $item.append($text, $remove);
        $list.append($item);
    });
}

function isImageFile(file) {
    return file.type && file.type.startsWith("image/");
}

function createMediaItemWrapper(index, file) {
    let uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    let $wrapper = $("<div>").addClass("img-item").attr("id", "img-wrapper-" + uniqueId).attr("data-index", index).css({
        "position": "relative",
        "margin-bottom": "10px"
    });
    let $previewNode;
    if (isImageFile(file)) {
        $previewNode = $("<img>").attr("src", "#").css({
            "width": "100%",
            "height": "125px",
            "object-fit": "contain"
        });
    } else {
        $previewNode = $("<video>").prop("muted", true).attr("preload", "metadata").attr("playsinline", true).attr("controls", true).css({
            "width": "100%",
            "height": "125px",
            "object-fit": "contain",
            "background-color": "#111"
        });
    }

    let $filename = $("<div>").text(file.name).css({
        "font-size": "12px",
        "color": "#666",
        "padding": "0 6px",
        "overflow": "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap"
    });

    let $button = $("<button>", {
        class: 'd-flex align-items-center justify-content-center btn-delete-img-item',
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
    $wrapper.append($previewNode, $filename, $button);
    return $wrapper;
}