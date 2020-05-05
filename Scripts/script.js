$(function () {
    $(".dropdown-menu a").click(function () {
        let dropdown = $("#dropdown-options");
        dropdown.html($(this).html());
        dropdown.attr("value", $(this).attr("value"));
    })

    $("#search-submit").click(function (e) {
        e.preventDefault();
        OnSearch();
    })
    DisplayFavorites()
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
                $("#search-result").append(`
                    <div class="track">
                        <div class="infos-track">
                            <img src=${result.data[i].album.cover_small} alt="cover album">
                            <div>
                                <p class="title ellipsis">${result.data[i].title}</p>
                                <p class="artist-album ellipsis">${result.data[i].artist.name} / ${result.data[i].album.title}</p>
                            </div>
                        </div>
                        <audio
                            controls
                            src="${result.data[i].preview}">
                            Your browser does not support the
                            <code>audio</code> element.
                        </audio>
                        <button class="btn btn-secondary add-favorites">Ajouter aux favoris</button>
                    </div>
                `);

                let favorites = JSON.parse(localStorage.getItem("favoris"));
                if (favorites) {
                    for (let j = 0; j < favorites.length; j++) {
                        if (favorites[j].id === result.data[i].id) {
                            $(".add-favorites:last").addClass("favorite-added");
                            $(".add-favorites:last").html("Retirer un favoris");
                        }
                    }
                }

                $(".add-favorites:last").click(function () {
                    let el = $(this);
                    if (el.hasClass("favorite-added")) {
                        RemoveFavorites(result.data[i]);
                        el.removeClass("favorite-added");
                        el.html("Ajouter un favoris");
                    }
                    else {
                        AddFavorites(result.data[i]);
                        el.addClass("favorite-added");
                        el.html("Retirer un favoris");
                    }
                });
            }
        }
    });
}

function AddFavorites(data) {
    let listFavorites = [];
    let favorites = localStorage.getItem("favoris");
    if (favorites) {
        let parsedFavorites = JSON.parse(favorites);
        for (let i = 0; i < parsedFavorites.length; i++) {
            if (data.id === parsedFavorites[i].id) continue;
            listFavorites.push(parsedFavorites[i]);
        }
    }
    listFavorites.push(data)
    let json = JSON.stringify(listFavorites);
    localStorage.setItem("favoris", json);
    DisplayFavorites();
}

function RemoveFavorites(data) {
    let favorites = localStorage.getItem("favoris");
    let parsedFavorites = JSON.parse(favorites);
    for (let i = 0; i < parsedFavorites.length; i++) {
        if (data.id === parsedFavorites[i].id) {
            parsedFavorites.splice(i, 1);
        }
    }
    let json = JSON.stringify(parsedFavorites);
    localStorage.setItem("favoris", json);
    DisplayFavorites();
}

function DisplayFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favoris"));
    $(".favoris-list").empty();

    if (!favorites) {
        $("#no-favoris").show();
    } else {
        for (let i = 0; i < favorites.length; i++) {
            $(".favoris-list").append(`
                <div class="track">
                    <div class="infos-track">
                        <img src=${favorites[i].album.cover_small} alt="cover album">
                        <div>
                            <p class="title ellipsis">${favorites[i].title}</p>
                            <p class="artist-album ellipsis">${favorites[i].artist.name} / ${favorites[i].album.title}</p>
                        </div>
                    </div>
                    <audio
                        controls
                        src="${favorites[i].preview}">
                        Your browser does not support the
                        <code>audio</code> element.
                    </audio>
                    <button class="btn btn-secondary add-favorites favorite-added">Retirer des favoris</button>
            </div>`);

            $(".add-favorites:last").click(function() {
                RemoveFavorites(favorites[i]);
            });
        }
    }
}