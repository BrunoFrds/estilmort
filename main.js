// Récupération de l'élément "search_input" qu'on stocke dans la variable "input".
const input = document.querySelector(".search_input");
// Stockage de l'élément "search_button" dans la variable "button".
const button = document.querySelector(".search_button");
const suggestionsList = document.querySelector(".suggestions_list");
const container = input.parentElement;
// Fonction pour interroger Wikidata à chaque frappe
const fetchSuggestions = (query) => {
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }

  const endpointurl = "https://query.wikidata.org/sparql";
  const sparqlQuery = `
    SELECT ?person ?personLabel ?dateOfDeath WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "${query}";
                        mwapi:language "fr".
        ?person wikibase:apiOutputItem mwapi:item.
      }
      ?person wdt:P31 wd:Q5.
      OPTIONAL { ?person wdt:P570 ?dateOfDeath. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }
    LIMIT 5
  `;

  const url = endpointurl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur réseau : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const results = data.results.bindings;
      suggestionsList.innerHTML = "";

      if (results.length === 0) {
        suggestionsList.innerHTML = `<li class="noResult">Aucun résultat trouvé pour "${query}".</li>`;
        return;
      }

      results.forEach((result) => {
        const personLabel = result.personLabel.value;
        const dateOfDeath = result.dateOfDeath?.value;

        const listItem = document.createElement("li");
        listItem.className = "suggestion_item";
        listItem.textContent = personLabel;

        listItem.addEventListener("click", () => {
          suggestionsList.innerHTML = "";
          displayResult(personLabel, dateOfDeath);
        });

        suggestionsList.appendChild(listItem);
      });
      suggestionsList.classList.remove("hidden");
    })
    .catch((error) => {
      console.error("Erreur de requête :", error);
    });
};
// Fonction pour afficher le résultat (mort ou vivant)
const displayResult = (personLabel, dateOfDeath) => {
  container.className = "search_result";
  container.innerHTML = "";

  const yesText = document.createElement("p");
  yesText.className = "yesNo";
  yesText.textContent = dateOfDeath ? "OUI" : "NON";
  container.appendChild(yesText);

  const icon = document.createElement("i");
  icon.className = dateOfDeath ? "fa-solid fa-cross" : "fa-solid fa-hourglass";
  container.appendChild(icon);

  const deathInfo = document.createElement("p");
  deathInfo.className = "infoDeath";
  deathInfo.textContent = dateOfDeath
    ? `${personLabel} est décédé(e) le ${new Date(dateOfDeath).toLocaleDateString()}.`
    : `${personLabel} est toujours vivant(e).`;
  container.appendChild(deathInfo);

  const backButton = document.createElement("button");
  backButton.className = "backToSearch";
  backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
  backButton.addEventListener("click", resetSearch);
  container.appendChild(backButton);

  suggestionsList.classList.add("hidden");
};

const resetSearch = () => {
  container.className = "search_bar_button";
  container.innerHTML = `
    <input type="search" class="search_input" autocomplete="off" name="query" placeholder="Tapez un nom">
    <button class="search_button"><i class="fa-solid fa-magnifying-glass"></i></button>
  `;

  // Re-sélection des nouveaux éléments (car les anciens ont été supprimés)
  const input = container.querySelector(".search_input");
  const button = container.querySelector(".search_button");
  const suggestionsList = container.querySelector(".suggestions_list");

  // Réattacher les listeners
  button.addEventListener("click", () => {
    const name = input.value;
    fetchSuggestions(name);
  });

  input.addEventListener("input", (e) => {
    fetchSuggestions(e.target.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (suggestionsList.firstChild) {
        suggestionsList.firstChild.click();
      }
    }
  });
};

// Clique sur le bouton
button.addEventListener("click", () => {
  const name = input.value;
  fetchSuggestions(name);
});
// Suggestions dynamiques
input.addEventListener("input", (e) => {
  fetchSuggestions(e.target.value);
});

// Entrée clavier = sélection automatique
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (suggestionsList.firstChild) {
      suggestionsList.firstChild.click();
    }
  }
});
