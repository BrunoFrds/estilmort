// Récupération de l'élément "search_input" qu'on stocke dans la variable "input".
const input = document.querySelector(".search_input");
// Stockage de l'élément "search_button" dans la variable "button".
const button = document.querySelector(".search_button");

// Définition de la fonction "performSearch" qui sera appelée lors du clic sur le bouton ou l'appui sur la touche "Entrée".
const performSearch = async () => {
  // Récupération de la valeur de l'input qu'on stocke dans la variable "name".
  const name = input.value;
  // Déclaration de l'URL de l'endpoint SPARQL de Wikidata. C'est l'adresse qui permet d'interroger la base de données Wikidata.
  const endpointurl = "https://query.wikidata.org/sparql";
  // Création de la variable "sparqlQuery" contenant la requête SPARQL pour récupérer les infos depuis Wikidata.
  const sparqlQuery = `
  SELECT ?person ?personLabel ?dateOfDeath WHERE {
    SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "www.wikidata.org";
                      wikibase:api "EntitySearch";
                      mwapi:search "${name}";
                      mwapi:language "fr".
      ?person wikibase:apiOutputItem mwapi:item.
    }
    ?person wdt:P31 wd:Q5.  # On ne garde que les éléments de type "humain"
    OPTIONAL { ?person wdt:P570 ?dateOfDeath. }  # On récupère la date de décès si elle existe
    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". } # On demande les labels (noms) en français
  }
  LIMIT 5
  `;
  // SELECT ?person ?personLabel ?dateOfDeath : séléctionne les données qu'on souhaite obtenir.
  // SERVICE wikibase:label : permet d'afficher les labels dans la langue spécifiée.
  // LIMIT 5 : limite le résultat à une seule correspondance.

  // Construction de l'URL complète pour envoyer la requête SPARQL, encodée pour être utilisable dans l'URL.
  // "encodeURIComponent" transforme la requête en un format utilisable dans une URL.
  // Le paramètre "&format=json" spécifie qu'on souhaite les résultats au format JSON.
  const url =
    endpointurl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
  // Envoi de la requête HTTP avec "fetch" vers Wikidata
  fetch(url)
    .then((response) => {
      // Vérification que la réponse est correcte (code 200 OK)
      if (!response.ok) {
        throw new Error(`Erreur de réseau : ${response.status}`);
      }
      // Conversion de la réponse en JSON
      return response.json();
    })
    .then((data) => {
      // Accès aux résultats de la requête SPARQL
      const results = data.results.bindings;
      // On récupère le parent de l'input (div .search_container) et on le transforme en conteneur de résultat
      const container = input.parentElement;
      container.className = "search_result";
      // On vide le contenu existant
      container.innerHTML = "";

      // Si des résultats sont trouvés :
      if (results.length > 0) {
        // On prend le premier résultat retourné
        const personLabel = results[0].personLabel.value;
        // On utilise l'opérateur ?. car la date peut être absente
        const dateOfDeath = results[0].dateOfDeath?.value;

        // Création d'un paragraphe qui affiche "OUI" si mort, "NON" sinon
        const yesText = document.createElement("p");
        yesText.className = "yesNo";
        yesText.textContent = dateOfDeath ? "OUI" : "NON";
        container.appendChild(yesText);

        // Création d'une icône (croix si mort, sablier si vivant)
        const icon = document.createElement("i");
        icon.className = dateOfDeath
          ? "fa-solid fa-cross"
          : "fa-solid fa-hourglass";
        container.appendChild(icon);

        // Création d'un paragraphe d'information indiquant la date de décès ou qu'il/elle est encore vivant(e)
        const deathInfo = document.createElement("p");
        deathInfo.className = "infoDeath";
        deathInfo.textContent = dateOfDeath
          ? `${personLabel} est décédé(e) le ${new Date(
              dateOfDeath
            ).toLocaleDateString()}.`
          : `${personLabel} est toujours vivant(e).`;
        container.appendChild(deathInfo);

        // Affichage du résultat dans la console pour déboguer
        console.log(
          dateOfDeath
            ? `${personLabel} est décédée le ${new Date(
                dateOfDeath
              ).toLocaleDateString()}.`
            : `${personLabel} est toujours vivant(e).`
        );
      } else {
        // Aucun résultat trouvé pour la recherche : on affiche un message d'erreur
        const noResult = document.createElement("p");
        noResult.className = "noResult";
        noResult.textContent = `Aucun résultat trouvé pour "${name}".`;
        // On s'assure que le conteneur est vide
        container.innerHTML = "";
        container.appendChild(noResult);
      }

      // Création d'un bouton pour revenir à la recherche initiale (recharge la page)
      const backButton = document.createElement("button");
      backButton.className = "backToSearch";
      backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
      backButton.addEventListener("click", () => {
        // Recharge la page pour revenir à l'état initial
        location.reload();
      });
      container.appendChild(backButton);
    })
    .catch((error) => {
      // En cas d'erreur (connexion ou autre), on affiche l'erreur dans la console
      console.error("Erreur lors de la requête :", error);
    });
};

// On exécute "performSearch" quand on clique sur le bouton
button.addEventListener("click", performSearch);

// On exécute aussi "performSearch" si on appuie sur "Entrée" dans l'input
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});
