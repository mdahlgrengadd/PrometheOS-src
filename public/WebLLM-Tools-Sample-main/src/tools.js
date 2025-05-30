// Tool definitions for the WebLLM application
export const tools = [
  {
    type: "function",
    function: {
      name: "fetch_wikipedia_content",
      description:
        "Search Wikipedia and fetch the introduction of the most relevant article. " +
        "Always use this if the user is asking for something that is likely on wikipedia. " +
        "If the user has a typo in their search query, correct it before searching.",
      parameters: {
        type: "object",
        properties: {
          search_query: {
            type: "string",
            description: "Search query for finding the Wikipedia article",
          },
        },
        required: ["search_query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sparql_exec",
      description:
        "Execute a SPARQL or SPARQL-FED select query and fetch results" +
        "Always use this if the user is asking for execute a SPARQL or SPARQL-FED select query. " +
        "If the user has a typo in their SPARQL select query, correct it before executing.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "SPARQL select query",
          },
        },
        required: ["query"],
      },
      return: {
        type: "object",
        description: "A data in application/sparql-results+json format",
      },
    },
  },
];
