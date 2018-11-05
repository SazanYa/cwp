$(function () {
    let d = new Date();

    $("#button").click(function () {
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:3000/api/articles/create",
            data: JSON.stringify({
                title: $("#title").val(),
                text: $("#text").val(),
                date: d.toISOString(),
                author: $("#author").val()
            }),
            success: function (response) {
                console.log("Create article...");
            }
        });
        return false;
    });

    $("#back").click(function () {
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:3000/index.html",
            success: function (response) {
                console.log("Create back...");
            }
        });
        return false;
    });
});