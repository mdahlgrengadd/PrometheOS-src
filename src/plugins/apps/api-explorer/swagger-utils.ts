/**
 * Helper utilities for working with Swagger UI in our API Explorer
 */

/**
 * Generates a stable ID for Swagger UI parameter fields
 * to prevent them from being regenerated on each render
 *
 * @param componentId The ID of the component
 * @param actionId The ID of the action
 * @param paramName The name of the parameter
 * @returns A stable parameter ID
 */
export const generateStableParamId = (
  componentId: string,
  actionId: string,
  paramName: string
): string => {
  return `param-${componentId}-${actionId}-${paramName}`;
};

/**
 * Stabilizes Swagger UI form inputs after they're rendered
 * This prevents the input fields from being reset when the UI refreshes
 */
export const stabilizeSwaggerUIForms = (): void => {
  // Find all parameter inputs and give them stable IDs
  const parameterRows = document.querySelectorAll(
    ".swagger-ui .parameters-col_description"
  );

  parameterRows.forEach((row) => {
    const inputEl = row.querySelector("input, select, textarea");
    if (!inputEl) return;

    // Extract component and action IDs from the closest operation container
    const opblock = row.closest(".opblock");
    if (!opblock) return;

    // Get the operation ID from the data attribute or className
    const opId = opblock.getAttribute("data-tag") || "";
    const inputName = inputEl.getAttribute("name") || "";

    if (opId && inputName) {
      // Generate a stable ID based on the operation and parameter
      const stableId = `param-${opId}-${inputName}`;

      // Set the ID on the input element
      inputEl.setAttribute("id", stableId);

      // Find any label elements and update their 'for' attribute
      const labels = row.querySelectorAll("label");
      labels.forEach((label) => {
        label.setAttribute("for", stableId);
      });
    }
  });
};

/**
 * Prevents hash link navigation in Swagger UI
 * This keeps SwaggerUI from modifying the URL and breaking React Router
 */
export const preventSwaggerUIHashNavigation = (): void => {
  // Find all hash links in SwaggerUI
  const hashLinks = document.querySelectorAll('.swagger-ui a[href^="#"]');

  hashLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Get the target from the href
      const href = (link as HTMLAnchorElement).getAttribute("href");
      if (!href) return;

      // If it's a hash link, prevent default behavior and handle it manually
      if (href.startsWith("#")) {
        e.preventDefault();

        // Scroll to the element if it exists, without changing URL
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
};
