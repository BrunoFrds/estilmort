// Stockage de l'élément "search_button" dans la variable "button".
const button = document.getElementsByClassName("search_button");
// Ajout d'un évènement "click" à l'élément "button". Chaque fois que l'utilisateur clique sur le bouton, la fonction qui suit sera éxécuté.
button.addEventListener("click", (Event) => {
  // Récupération de la valeur de l'input qu'on stocke dans la variable "name".
  const name = document.getElementsByClassName("search_input").value;
  // Déclaration de l'URL de l'endpoint SPARQL de Wikidata. Endpoint utilisé pour effectuer des requêtes à la base de données de Wikidata.
  const endpointurl = "https://query.wikidata.org/sparql";
  // Création de la variable "sparqlQuery" contenant la requête SPARQL pour récupérer les infos depuis Wikidata.
  const sparqlQuery = `
    SELECT ?person ?personLabel ?dateOfDeath WHERE {
      ?person wdt:P31 wd:Q5;  # Filtre pour des humains
              rdfs:label "${name}"@fr;  # Nom recherché (français, ajustable)
              wdt:P570 ?dateOfDeath.  # P570 correspond à la date de décès
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
    endpointurl + "?query" + encodeURIComponent(sparqlQuery) + "&format=json";
  try {
    // "fetch(url) envoie une requête HTTP à l'URL construite plus haut.
    const response = fetch(url);
    // "response.json()" transforme la réponse reçue en un objet JSON utilisable.
    const data = response.json();
    // Création de la variable "results" qui contient les résultats obtenus de la requête SPARQL.
    const results = data.results.bindings;
    // On vérifie si des résultats ont été trouvés.
    if (results.length > 0) {
      // Création de la variable "dateOfDeath" qui extrait la date de décès de la première correspondance trouvée.
      const dateOfDeath = results[0].dateOfDeath.value;
      // Mise à jour du texte du paragraphe "result" pour afficher que la personne est décédée, avec une date formatée.
      document.getElementById(
        "result"
      ).innerText = `${name} est décédé le ${new Date(
        dateOfDeath
      ).toLocaleDateString()}.`;
    }
    // Si le résultat est égal à 0, cette section affiche un message indiquant que la personne est vivante.
    else {
      document.getElementById(
        "result"
      ).innerText = `${name} est vivant ou non référencé comme décédé dans Wikidata.`;
    }
  } catch (error) {
    // "catch (error)" intercepte toute erreur qui pourrait survenir lors de la requête ou du traitement de la réponse, affiche un message d'erreur à l'utilisateur et écrit l'erreur dans la console pour faciliter le déboguage.
    document.getElementById("result").innerText =
      "Erreur lors de l'interrogation de Wikidata.";
    console.error("Erreur :", error);
  }
});
