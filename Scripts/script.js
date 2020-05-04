$(function () {
    $(".dropdown-menu a").click(function () {
        let dropdown = $("#dropdown-options");
        dropdown.html($(this).html());
        dropdown.attr("value", $(this).attr("value"));
    })

    $("#search-submit").click(function (e) {
        e.preventDefault();
        let url = `https://api.deezer.com/search?q=${$("#search").val()}&order=${$("#dropdown-options").attr("value")}&output=jsonp`;
        $.ajax({
            url: url,
            dataType: "jsonp",
        }).then((result) => {
            console.log("Résultat :", result.data);
        });
    })
})