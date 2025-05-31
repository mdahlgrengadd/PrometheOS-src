// Quick test to verify URL parsing
console.log("Testing URL parsing...");

// Mock the URL params as they would appear
const testUrl =
  "http://localhost:8080/prometheos/?open=browser&initFromUrl=www.google.com";
const url = new URL(testUrl);
const params = new URLSearchParams(url.search);

console.log("URL search params:", url.search);
console.log("open param:", params.get("open"));
console.log("initFromUrl param:", params.get("initFromUrl"));
console.log(
  "decoded initFromUrl:",
  decodeURIComponent(params.get("initFromUrl") || "")
);

// Test the parsing logic
const openParam = params.get("open");
if (openParam) {
  const appIds = openParam.split(",").map((id) => id.trim());
  console.log("App IDs:", appIds);

  const results = appIds.map((appId) => {
    // Check for app-specific init parameter (appId_init)
    const appInitParam = params.get(`${appId}_init`);

    // If app-specific init param exists, use it
    if (appInitParam) {
      return {
        appId,
        initFromUrl: decodeURIComponent(appInitParam),
      };
    }

    // If this is the first/only app and there's a global initFromUrl param, use it
    if (appId === appIds[0] && params.get("initFromUrl")) {
      return {
        appId,
        initFromUrl: decodeURIComponent(params.get("initFromUrl") || ""),
      };
    }

    // Otherwise, return just the app ID without init data
    return { appId };
  });

  console.log("Parsed results:", results);
}
