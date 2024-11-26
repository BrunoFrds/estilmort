// Récupération de l'élément "search_input" qu'on stocke dans la variable "input".
const input = document.querySelector(".search_input");
// Stockage de l'élément "search_button" dans la variable "button".
const button = document.querySelector(".search_button");
// Ajout d'un évènement "click" à l'élément "button". Chaque fois que l'utilisateur clique sur le bouton, la fonction qui suit sera éxécuté.

const performSearch = async () => {
  // Récupération de la valeur de l'input qu'on stocke dans la variable "name".
  const name = input.value;
  console.log(`Recherche : ${name}`);
  // Déclaration de l'URL de l'endpoint SPARQL de Wikidata. Endpoint utilisé pour effectuer des requêtes à la base de données de Wikidata.
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
    ?person wdt:P31 wd:Q5.  # Filtre pour des humains
    OPTIONAL { ?person wdt:P570 ?dateOfDeath. }  # Date de décès optionnelle
    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
  }
  LIMIT 1
  `;
  // SELECT ?person ?personLabel ?dateOfDeath : séléctionne les données qu'on souhaite obtenir.
  // SERVICE wikibase:label : permet d'afficher les labels dans la langue spécifiée.
  // LIMIT 1 : limite le résultat à une seule correspondance.

  // Construction de l'URL complète pour la requête SPARQL.
  // "encodeURIComponent" transforme la requête en un format utilisable dans une URL.
  // Le paramètre "&format=json" spécifie qu'on souhaite les résultats au format JSON.
  const url =
    endpointurl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur de réseau : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const results = data.results.bindings;
      // Stockage dans la variable "result" de l'élément "search_result".
      const container = input.parentElement;
      container.className = "search_result";
      container.innerHTML = "";

      if (results.length > 0) {
        const personLabel = results[0].personLabel.value;
        const dateOfDeath = results[0].dateOfDeath?.value;

        const yesText = document.createElement("p");
        yesText.className = "yesNo";
        yesText.textContent = dateOfDeath ? "OUI" : "NON";
        container.appendChild(yesText);

        const icon = document.createElement("i");
        icon.className = dateOfDeath
          ? "fa-solid fa-cross"
          : "fa-solid fa-hourglass";
        container.appendChild(icon);

        const deathInfo = document.createElement("p");
        deathInfo.className = "infoDeath";
        deathInfo.textContent = dateOfDeath
          ? `${personLabel} est décédé(e) le ${new Date(
              dateOfDeath
            ).toLocaleDateString()}.`
          : `${personLabel} est toujours vivant(e).`;
        container.appendChild(deathInfo);

        console.log(
          dateOfDeath
            ? `${personLabel} est décédée le ${new Date(
                dateOfDeath
              ).toLocaleDateString()}.`
            : `${personLabel} est toujours vivant(e).`
        );
      } else {
        container.innerHTML = `<p>Aucun résultat trouvé pour "${name}".</p>`;
        console.log("Aucun résultat trouvé.");
      }

      const backButton = document.createElement("button");
      backButton.className = "backToSearch";
      backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
      backButton.addEventListener("click", () => {
        location.reload();
      });
      container.appendChild(backButton);
    })
    .catch((error) => {
      console.error("Erreur lors de la requête :", error);
    });
};

button.addEventListener("click", performSearch);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});
