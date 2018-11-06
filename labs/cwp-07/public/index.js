

let maxPages = 0;

function readall(pageNumber) {
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
            $("#pageNumber").text(pageNumber.toString());
            for (let i = 0; i < data.items.length; i++) {
                $("#dataArticles").append("<div class='article-header'><b>"
                    + data.items[i].title + "</b><p>"
                    + data.items[i].date + "</p></div><p class='article'>"
                    + data.items[i].text + "</p><p class='author'>"
                    + data.items[i].author + "</p><hr>");
            }
        }
    });
}

function update(pageNumber) {

    $("#dataArticles").empty();

    refreshButtons();
    readall(pageNumber);

    if (pageNumber == 1) {
        $("#prevbtn").prop("disabled", true);
    }
    if (pageNumber == maxPages) {
        $("#nextbtn").prop("disabled", true);
    }
}

function refreshButtons() {
    $("#nextbtn").prop("disabled", false);
    $("#prevbtn").prop("disabled", false);
}

$(function () {
    let pageNumber = 1;
    update(pageNumber);

    $("#prevbtn").click(function () {
        update(--pageNumber);
        return false;
    });

    $("#nextbtn").click(function () {
        update(++pageNumber);
        return false;
    });

    $("#sortOrder").change(function () {
        update(pageNumber = 1);
        return false;
    });

    $("#sortField").change(function () {
        update(pageNumber = 1);
        return false;
    });

    $("#limit").change(function () {
        update(pageNumber = 1);
        return false;
    });
});