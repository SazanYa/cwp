
let pageNumber = 1;
let maxPages;

function readall() {
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:3000/api/articles/readall",
        data: JSON.stringify({
            sortOrder: $("#sortOrder").val(),
            sortField: $("#sortField").val(),
            includeDeps: $("#includeDeps").val(),
            limit: $("#limit").val(),
            page: pageNumber
        }),
        success: function (data) {
            console.log(data);
            maxPages = data.meta.pages;
            for (let i = 0; i < data.items.length; i++) {
                $("#dataArticles").append("<h1 style='background: #56e690'>"
                    + data.items[i].title + "</h1><h3>"
                    + data.items[i].text + "</h3><h2 >"
                    + data.items[i].author + "</h2><h1><hr></h1>");
            }
        }
    });
}

$(function () {
    readall();

    $("#updbtn").click(function () {
        $("#dataArticles").empty();
        pageNumber = 1;
        readall();
        return false;
    });

    $("#prevbtn").click(function () {
        if (pageNumber == 1) { return; }
        pageNumber--;
        $("#dataArticles").empty();
        readall();
        return false;
    });

    $("#nextbtn").click(function () {
        if (pageNumber == maxPages - 1) { return; }
        pageNumber++;
        $("#dataArticles").empty();
        readall();
        return false;
    });

});