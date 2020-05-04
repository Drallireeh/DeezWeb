$(function () {
    $(".dropdown-menu a").click(function () {
        let dropdown = $("#dropdown-options");
        dropdown.html($(this).html());
        dropdown.attr("value", $(this).attr("value"));
    })

    $("#search-submit").click(function () {
        OnSearch();
    })
})

function OnSearch() {
    let url = `https://api.deezer.com/search?q=${$("#search").val()}&order=${$("#dropdown-options").attr("value")}&output=jsonp`;
    $.ajax({
        url: url,
        dataType: "jsonp",
    }).then((result) => {
        console.log("Résultat :", result.data);
        $("#search-result").html("");
        if (result.data.length == 0) {
            $("#no-result").show();
        } else {
            for (let i = 0; i < result.data.length; i++) {
                console.log(result.data[i])
                $("#search-result").append(`
                    <div class="track">
                        <div>
                            <p class="title ellipsis">${result.data[i].title}</p>
                            <p class="artist-album ellipsis">${result.data[i].artist.name} / ${result.data[i].album.title}</p>
                        </div>
                        <audio
                            controls
                            src="${result.data[i].preview}">
                            Your browser does not support the
                            <code>audio</code> element.
                        </audio>
                        <button class="add-favorites">Ajouter aux favoris</button>
                    </div>
                `)
            }
        }
    });
}