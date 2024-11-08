// Récupération de l'élément "search_input" qu'on stocke dans la variable "input".
const input = document.querySelector(".search_input");
// Stockage de l'élément "search_button" dans la variable "button".
const button = document.querySelector(".search_button");
// Ajout d'un évènement "click" à l'élément "button". Chaque fois que l'utilisateur clique sur le bouton, la fonction qui suit sera éxécuté.
const performSearch = async () => {
  // Récupération de la valeur de l'input qu'on stocke dans la variable "name".
  const name = input.value;
  console.log(name);
  // Déclaration de l'URL de l'endpoint SPARQL de Wikidata. Endpoint utilisé pour effectuer des requêtes à la base de données de Wikidata.
  const endpointurl = "https://query.wikidata.org/sparql";
  // Création de la variable "sparqlQuery" contenant la requête SPARQL pour récupérer les infos depuis Wikidata.
  const sparqlQuery = `
    SELECT ?person ?personLabel ?dateOfDeath WHERE {
      ?person wdt:P31 wd:Q5;  # Filtre pour des humains
              rdfs:label "${name}"@fr;  # Nom recherché (français, ajustable)
              wdt:P570 ?dateOfDeath.  # P570 correspond à la date de décès
              ?person wdt:P21 ?gender.   # P21 correspond au genre
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],fr". }
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
        const dateOfDeath = results[0].dateOfDeath.value;

        const yesText = document.createElement("p");
        yesText.className = "yesNo";
        yesText.textContent = "OUI";
        container.appendChild(yesText);

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-cross";
        container.appendChild(icon);

        const deathInfo = document.createElement("p");
        deathInfo.className = "infoDeath";
        deathInfo.textContent = `${name} est décédé(e) le ${new Date(
          dateOfDeath
        ).toLocaleDateString()}.`;
        container.appendChild(deathInfo);

        console.log(
          `La personne est décédée le ${new Date(
            dateOfDeath
          ).toLocaleDateString()}.`
        );
      } else {
        const noText = document.createElement("p");
        noText.className = "yesNo";
        noText.textContent = "NON";
        container.appendChild(noText);

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-hourglass";
        container.appendChild(icon);

        const deathInfo = document.createElement("p");
        deathInfo.className = "infoDeath";
        deathInfo.textContent = `${name} est toujours vivant(e) !`;
        container.appendChild(deathInfo);
        console.log(
          "La personne est toujours vivante ou alors elle n'éxiste pas!"
        );
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
      console.error("Errur lors de la requête :", error);
    });
};

button.addEventListener("click", performSearch);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});
