$(function () {
    // Gestion de la dropdown d'options
    $(".dropdown-menu a").click(function () {
        let dropdown = $("#dropdown-options");
        dropdown.html($(this).html());
        dropdown.attr("value", $(this).attr("value"));
    })

    // Recherche clic
    $("#search-submit").click(function (e) {
        e.preventDefault();
        $("#search-result").empty();
        if ($("#search").val().length === 0) {
            $("#minimum-carac").show();
            $("#display-next-results").hide();
            return;
        }
        OnSearch($("#search").val(), $("#dropdown-options").attr("value"));
    })
    DisplayFavorites();
    DisplayOneFav();
})

// Affiche la dernière recherche éffectuée lorsqu'on reviens sur la page 
function DisplayLastSearch() {
    let htmlSearch = sessionStorage.getItem("searchInput");
    let htmlOptions = sessionStorage.getItem("triOptions");
    if (htmlSearch && htmlOptions) {
        $("#search").val(htmlSearch);
        OnSearch(htmlSearch, htmlOptions);
    }
}

// Retourne un entier compris entre les valeurs min et max
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Ajout du contenu html pour afficher une musique
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
            <button class="btn btn-secondary add-favorites favorite-added"><i class="fas fa-heart-broken"></i> Retirer des favoris</button>
        </div>
    `;

    return htmlString;
}

// Lorsqu'on effectue une recherche, cette fonction est appellée
function OnSearch(searchValue, triOptions) {
    let url = `https://api.deezer.com/search?q=${searchValue}&order=${triOptions}&output=jsonp`;
    $.ajax({
        url: url,
        dataType: "jsonp",
    }).then((result) => {
        console.log("Résultat :", result);
        DisplaySearch(result, searchValue, triOptions);
    }).catch((error) => {
        CatchAjaxError(error);
    });
}

// Affiche les résultats de la recherche
function DisplaySearch(result, searchValue, triOptions) {
    $("#next-results-cnt").remove();
    if (result.data.length == 0) {
        $("#no-result").html('Aucun résultats concernant la recherche "' + $("#search").val() + '"');
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
                    <button class="btn btn-secondary add-favorites"><i class="far fa-heart"></i> Ajouter aux favoris</button>
                </div>
            `);

            let favorites = JSON.parse(localStorage.getItem("favoris"));
            if (favorites) {
                for (let j = 0; j < favorites.length; j++) {
                    if (favorites[j].id === result.data[i].id) {
                        $(".add-favorites:last").addClass("favorite-added");
                        $(".add-favorites:last").html('<i class="fas fa-heart-broken"></i> Retirer un favoris');
                    }
                }
            }

            $(".add-favorites:last").click(function () {
                let el = $(this);
                if (el.hasClass("favorite-added")) {
                    RemoveFavorites(result.data[i]);
                    el.removeClass("favorite-added");
                    el.html('<i class="far fa-heart"></i> Ajouter un favoris');
                }
                else {
                    AddFavorites(result.data[i]);
                    el.addClass("favorite-added");
                    el.html('<i class="fas fa-heart-broken"></i> Retirer un favoris');
                }
            });
        }

        // Gérer l'affichage des résultats de recherche suivants
        if (result.next) {
            $("#search-result").after(`<div id="next-results-cnt"><button class="btn btn-primary" id="display-next-results">Afficher plus de résultats</button></div>`);
            $("#display-next-results").click(function () {
                $.ajax({
                    url: result.next,
                    dataType: "jsonp",
                }).then((resultNext) => {
                    DisplaySearch(resultNext, searchValue, triOptions);
                }).catch((error) => {
                    CatchAjaxError(error);
                });
            });
        }

        // Stockage pour afficher au onload de la page la dernière recherche
        sessionStorage.removeItem("searchInput");
        sessionStorage.removeItem("triOptions");
        sessionStorage.setItem("searchInput", searchValue);
        sessionStorage.setItem("triOptions", triOptions);
    }
}

// Appelée en cas de .catch dans notre requête ajax
function CatchAjaxError(error) {
    console.log(error);
    if (error.status === 404) {
        alert("Erreur 404. Veuillez vérifier l'url de requête");
    } else {
        alert("Une erreur est survenue : Code d'erreur " + error.status);
    }
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