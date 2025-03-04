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

});
function hidePopup(params) {
    $("#overlay").hide();
}
