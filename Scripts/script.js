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
    DisplayFavorites();
    DisplayOneFav();
})

function DisplayLastSearch() {
    let htmlSearch = sessionStorage.getItem("search");
    console.log(htmlSearch)
    if (htmlSearch) $("#search-result").html(htmlSearch);
}

// Retourne un entier compris entre les valeurs min et max
function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function AddTrackToHtml(album, trackTitle, artistName, previewUrl) {
    let htmlString = `
        <div class="track">
            <div class="infos-track">
                <img src=${album.cover_small} alt="cover album">
                <div>
                    <p class="title ellipsis" title="${trackTitle}">${trackTitle}</p>
                    <p class="artist-album ellipsis" title="${artistName} / ${album.title}">${artistName} / ${album.title}</p>
                </div>
            </div>
            <audio
                controls
                src="${previewUrl}">
                Your browser does not support the
                <code>audio</code> element.
            </audio>
            <button class="btn btn-secondary add-favorites favorite-added">Retirer des favoris</button>
        </div>
    `;

    return htmlString;
}

// Lorsqu'on effectue une recherche, cette fonction est appellée
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
                                <p class="title ellipsis" title="${result.data[i].title}">${result.data[i].title}</p>
                                <p class="artist-album ellipsis" title="${result.data[i].artist.name} / ${result.data[i].album.title}">${result.data[i].artist.name} / ${result.data[i].album.title}</p>
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

            sessionStorage.setItem("search", $("#search-result").html());
        }
    }).catch((error) => {
        if (error.status === 404) {
            alert("Erreur 404. Veuillez vérifier votre réseau");
        } else {
            alert("Une erreur est survenue.");
        }
    });
}

// Permet d'ajouter un favoris
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

// Permet de supprimer un favoris
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

// Affiche tous les favoris
function DisplayFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favoris"));
    $(".favoris-list").empty();

    if (!favorites) {
        $("#no-favoris").show();
    } else {
        for (let i = 0; i < favorites.length; i++) {
            let htmlString = AddTrackToHtml(favorites[i].album, favorites[i].title, favorites[i].artist.name, favorites[i].preview);
            $(".favoris-list").append(htmlString);

            $(".add-favorites:last").click(function () {
                RemoveFavorites(favorites[i]);
            });
        }
    }
}

// Affiche une des musiques parmis tous les favoris au hasard 
function DisplayOneFav(prevIndex = null) {
    let favorites = JSON.parse(localStorage.getItem("favoris"));
    let accueilFavoris = $(".accueil-fav");
    accueilFavoris.empty();

    if (!favorites) {
        $("#accueil-display-fav").hide();
    } else {
        let randomIdx = randomIntFromInterval(0, favorites.length - 1);
        // Pour éviter qu'on ait deux fois de suite la même musique dans l'accueil
        while (randomIdx === prevIndex) {
            randomIdx = randomIntFromInterval(0, favorites.length - 1);
        }
        let htmlString = AddTrackToHtml(favorites[randomIdx].album, favorites[randomIdx].title, favorites[randomIdx].artist.name, favorites[randomIdx].preview);
        accueilFavoris.append(htmlString);

        $("#another-track").off("click").click(function () {
            DisplayOneFav(randomIdx);
        })
    }
}