$(function () {
    $("#addbtn").click(function () {
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:3000/api/articles/create",
            data: JSON.stringify({
                title: $("#title").val(),
                text: $("#text").val(),
                date: (new Date()).toISOString(),
                author: $("#author").val()
            }),
            success: function (response) {
                $("#title").val("");
                $("#text").val("");
                $("#author").val("");
            }
        });
        return false;
    });
});