// Tool implementations for Wikipedia and SPARQL
const endpoint =
  "https://linkeddata.uriburner.com/sparql/?format=application%2Fsparql-results%2Bjson&timeout=30000&maxrows=15";

export async function fetch_wikipedia_content(searchQuery) {
  /** Fetches Wikipedia content for a given searchQuery */
  try {
    // Search for the most relevant article
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    let params = new URLSearchParams({
      action: "query",
      format: "json",
      list: "search",
      srsearch: searchQuery,
      srlimit: 1,
      origin: "*",
    });

    let rc = await fetch(`${wikiUrl}?${params.toString()}`);
    const searchData = await rc.json();

    if (!searchData.query.search) {
      return {
        status: "error",
        message: `No Wikipedia article found for '${searchQuery}'`,
      };
    }

    // Get the normalized title from search results
    const normalizedTitle = searchData.query.search[0].title;

    // Now fetch the actual content with the normalized title
    params = new URLSearchParams({
      action: "query",
      format: "json",
      titles: normalizedTitle,
      prop: "extracts",
      exintro: "true",
      explaintext: "true",
      redirects: 1,
      origin: "*",
    });

    rc = await fetch(`${wikiUrl}?${params.toString()}`);
    const data = await rc.json();

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      return {
        status: "error",
        message: `No Wikipedia article found for '${searchQuery}'`,
      };
    }

    const content = pages[pageId].extract.trim();
    return {
      status: "success",
      content: content,
      title: pages[pageId].title,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

export async function sparql_exec(query) {
  const url = new URL(endpoint);
  url.searchParams.append("query", query);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/sparql-results+json",
      },
    });

    if (!response.ok) {
      let res = "";
      try {
        res = await response.text();
      } catch (_) {}
      throw new Error(`HTTP error! Status: ${response.status}\n ${res}`);
    }

    const results = await response.json();
    return results;
  } catch (ex) {
    console.error("Error executing SPARQL query:", ex);
    return { error: ex.toString() };
  }
}
