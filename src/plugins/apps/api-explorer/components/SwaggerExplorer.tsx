import 'swagger-ui-dist/swagger-ui.css';

import { RefreshCw } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';

import { useApi } from '@/api/hooks/useApi';
import { Button } from '@/components/ui/button';

import { useOpenApiSpec } from '../openapi-service';
import { preventSwaggerUIHashNavigation, stabilizeSwaggerUIForms } from '../swagger-utils';

// Add custom styles to fix SwaggerUI issues
const swaggerUIStyles = `
  /* Prevent input field resets by fixing the id attributes */
  .swagger-ui input[id^="parameter"] {
    font-family: ui-monospace, monospace;
  }

  /* Better consistency in button styling */
  .swagger-ui .btn {
    font-family: inherit;
  }

  /* Improve readability */
  .swagger-ui .opblock .opblock-summary-description {
    text-align: right;
    padding-right: 10px;
  }

  /* Fix code block styling */
  .swagger-ui .highlight-code pre {
    font-size: 13px;
  }

  /* Fix response styling */
  .swagger-ui .responses-table .response-col_status {
    font-family: ui-monospace, monospace;
  }
  
  /* Preserve input values by preventing hidden inputs */
  .swagger-ui .parameters-container .parameters {
    display: block !important;
  }
`;

/**
 * FastAPI-style SwaggerUI component that displays the OpenAPI specification
 */
const SwaggerExplorer: React.FC = () => {
  const { spec, refreshSpec } = useOpenApiSpec();
  const { executeAction } = useApi();
  const hasMountedRef = useRef(false);
  const swaggerContainerRef = useRef<HTMLDivElement>(null);

  // Prevent rerendering unless the spec actually changes
  const memoizedSpec = useMemo(() => {
    return spec;
  }, [spec]);

  // Add custom CSS to the page
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = swaggerUIStyles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Set up a MutationObserver to stabilize form inputs when the DOM changes
  useEffect(() => {
    if (!swaggerContainerRef.current) return;

    // Create a mutation observer to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Only run stabilization if elements were added
      const hasAddedNodes = mutations.some(
        (mutation) => mutation.addedNodes.length > 0
      );

      if (hasAddedNodes) {
        // Fix input fields to prevent resets
        stabilizeSwaggerUIForms();

        // Prevent hash navigation
        preventSwaggerUIHashNavigation();
      }
    });

    // Start observing the container for DOM changes
    observer.observe(swaggerContainerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Customize Swagger UI to intercept HTTP calls and execute them via our API
  useEffect(() => {
    // Only set up once
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Intercept fetch/XHR to handle requests through our API instead
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      // Only intercept API calls from Swagger UI
      const url = input instanceof Request ? input.url : String(input);

      if (url.includes("/api/")) {
        // Extract the necessary information from the URL and body
        const path = url.split("/api")[1];
        const segments = path.split("/").filter(Boolean);

        if (segments.length >= 2) {
          const componentId = segments[0];
          const actionId = segments[1];

          // Get parameters from the request body if available
          let params = {};
          if (init && init.body) {
            try {
              params = JSON.parse(init.body.toString());
            } catch (e) {
              console.error("Failed to parse request body:", e);
            }
          }

          console.log(`Executing action: ${componentId}.${actionId}`, params);

          // Execute the action through our API system
          try {
            const result = await executeAction(componentId, actionId, params);

            // Return a mock Response object with our result
            return new Response(JSON.stringify(result), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.error("Error executing action:", error);
            // Handle errors gracefully
            return new Response(
              JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
      }

      // For non-API calls, use the original fetch
      return originalFetch.apply(window, [input, init]);
    };

    // Cleanup when unmounted
    return () => {
      window.fetch = originalFetch;
    };
  }, [executeAction]);

  // Prevent URL hash changes from affecting React Router
  useEffect(() => {
    // Helper to handle hash change events
    const handleHashChange = (e: HashChangeEvent) => {
      // If the hash change is from SwaggerUI, prevent it from affecting React Router
      if (e.newURL.includes("/#/")) {
        e.preventDefault();
        e.stopPropagation();

        // Restore the URL without the Swagger UI hash
        if (window.history.replaceState) {
          // Remove the hash without causing a navigation
          const url = window.location.href.split("#")[0];
          window.history.replaceState(null, "", url);
        }

        return false;
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Customize Swagger UI to match FastAPI style
  const SwaggerUIOptions = {
    docExpansion: "list",
    defaultModelsExpandDepth: 1,
    deepLinking: false, // Disable deep linking to prevent URL hash changes
    showExtensions: true,
    showCommonExtensions: true,
    displayRequestDuration: true,
    tryItOutEnabled: true, // Enable try it out by default
    persistAuthorization: true,
  };

  // Run the form stabilization after initial render
  useEffect(() => {
    if (spec) {
      // Apply fixes after a short delay to ensure SwaggerUI has rendered
      const timeoutId = setTimeout(() => {
        stabilizeSwaggerUIForms();
        preventSwaggerUIHashNavigation();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [spec]);

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading API documentation...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-2 mb-4">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSpec}
          title="Refresh API documentation"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div
        className="flex-1 overflow-auto"
        id="swagger-ui-container"
        ref={swaggerContainerRef}
      >
        <SwaggerUI
          spec={memoizedSpec}
          {...SwaggerUIOptions}
          supportedSubmitMethods={["get", "post", "put", "delete"]}
          requestInterceptor={(req) => {
            console.log("Swagger UI Request:", req);
            return req;
          }}
          responseInterceptor={(res) => {
            console.log("Swagger UI Response:", res);
            return res;
          }}
        />
      </div>
    </div>
  );
};

export default SwaggerExplorer;
