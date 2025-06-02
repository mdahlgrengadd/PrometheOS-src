import "swagger-ui-dist/swagger-ui.css";

import { RefreshCw } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import SwaggerUI from "swagger-ui-react";

import { useApi } from "@/api/hooks/useApi";
import { Button } from "@/components/ui/button";

import { useOpenApiSpec } from "../openapi-service";
import {
  preventSwaggerUIHashNavigation,
  stabilizeSwaggerUIForms,
} from "../swagger-utils";

// Add custom styles to fix SwaggerUI issues
const swaggerUIStyles = `
  /* Make ALL Swagger UI response preview text terminal green for JSON */
  .swagger-ui .microlight,
  .swagger-ui .microlight *,
  .swagger-ui pre.microlight,
  .swagger-ui pre.microlight *,
  .swagger-ui .response .microlight,
  .swagger-ui .response .microlight *,
  .swagger-ui .response .microlight code,
  .swagger-ui .response .microlight code *,
  .swagger-ui .highlight-code pre,
  .swagger-ui .highlight-code pre *,
  .swagger-ui .highlight-code code,
  .swagger-ui .highlight-code code * {
    color: #00ff00 !important; /* Terminal green */
    background: #222 !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 14px;
  }
  
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

  /* WORD WRAPPING AND OVERFLOW PREVENTION */
  
  /* Prevent horizontal overflow on the main container */
  .swagger-ui {
    overflow-x: hidden !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
  }

  /* Ensure all text content wraps properly */
  .swagger-ui .opblock-description,
  .swagger-ui .opblock-summary-description,
  .swagger-ui .parameter__name,
  .swagger-ui .parameter__type,
  .swagger-ui .parameter__deprecated,
  .swagger-ui .parameter__in,
  .swagger-ui .renderedMarkdown,
  .swagger-ui .markdown p,
  .swagger-ui .markdown div,
  .swagger-ui .markdown span,
  .swagger-ui .info .description,
  .swagger-ui .info .title {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
    max-width: 100% !important;
  }

  /* Handle long URLs and code snippets */
  .swagger-ui .markdown code,
  .swagger-ui .parameter__name code,
  .swagger-ui .response-col_description code,
  .swagger-ui pre,
  .swagger-ui code {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  /* Fix markdown content in descriptions */
  .swagger-ui .renderedMarkdown h1,
  .swagger-ui .renderedMarkdown h2,
  .swagger-ui .renderedMarkdown h3,
  .swagger-ui .renderedMarkdown h4,
  .swagger-ui .renderedMarkdown h5,
  .swagger-ui .renderedMarkdown h6 {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
  }

  .swagger-ui .renderedMarkdown p,
  .swagger-ui .renderedMarkdown li,
  .swagger-ui .renderedMarkdown div {
    word-wrap: break-word !important;
    overflow-wrap: anywhere !important;
    hyphens: auto !important;
    max-width: 100% !important;
  }

  /* Handle JSON examples and responses */
  .swagger-ui .response-col_description pre,
  .swagger-ui .highlight-code,
  .swagger-ui .model-example pre,
  .swagger-ui .example pre {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    word-break: break-all !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  /* Fix parameter tables */
  .swagger-ui .parameters-col_description,
  .swagger-ui .parameters-col_name {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 300px !important;
    min-width: 0 !important;
  }

  /* Container overflow control */
  .swagger-ui .opblock-section,
  .swagger-ui .opblock-section-header,
  .swagger-ui .opblock-description-wrapper,
  .swagger-ui .parameters-container,
  .swagger-ui .responses-wrapper {
    overflow: hidden !important;
    min-width: 0 !important;
  }

  /* Ensure operation blocks don't overflow */
  .swagger-ui .opblock {
    overflow: hidden !important;
    word-wrap: break-word !important;
    max-width: 100% !important;
  }

  /* Fix schema descriptions */
  .swagger-ui .model-box .model-description,
  .swagger-ui .prop-type,
  .swagger-ui .prop-format {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
  }

  /* Responsive table handling */
  .swagger-ui table {
    table-layout: fixed !important;
    width: 100% !important;
  }

  .swagger-ui table td,
  .swagger-ui table th {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 0 !important;
    overflow: hidden !important;
  }
`;

/**
 * FastAPI-style SwaggerUI component that displays the OpenAPI specification
 */

// --- GLOBAL INTERCEPTOR SETUP (idempotent, safe for StrictMode) ---
let interceptorsRegistered = false;
function setupGlobalInterceptors(getExecuteAction: () => any) {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  const originalFetch = window.fetch;
  const OriginalXHR = window.XMLHttpRequest;

  // Intercept fetch calls
  window.fetch = async function (input, init) {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("/api/")) {
      return handleApiCall(url, init, getExecuteAction());
    }
    return originalFetch.apply(window, [input, init]);
  };

  // Intercept XMLHttpRequest
  class InterceptedXHR extends OriginalXHR {
    private _url = "";
    private _method = "";
    open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ): void {
      this._url = url.toString();
      this._method = method;
      return super.open(method, url, async, username, password);
    }
    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      if (this._url.includes("/api/")) {
        handleApiCall(
          this._url,
          { method: this._method, body: body as BodyInit },
          getExecuteAction()
        )
          .then((response) => response.text())
          .then((text) => {
            Object.defineProperty(this, "status", {
              value: 200,
              writable: false,
            });
            Object.defineProperty(this, "statusText", {
              value: "OK",
              writable: false,
            });
            Object.defineProperty(this, "responseText", {
              value: text,
              writable: false,
            });
            Object.defineProperty(this, "response", {
              value: text,
              writable: false,
            });
            Object.defineProperty(this, "readyState", {
              value: 4,
              writable: false,
            });
            const loadEvent = new ProgressEvent("load", {
              lengthComputable: true,
              loaded: text.length,
              total: text.length,
            });
            if (this.onload) this.onload.call(this, loadEvent);
            if (this.onreadystatechange)
              this.onreadystatechange.call(this, loadEvent);
          })
          .catch((error) => {
            const errorResponse = JSON.stringify({ error: error.message });
            Object.defineProperty(this, "status", {
              value: 400,
              writable: false,
            });
            Object.defineProperty(this, "statusText", {
              value: "Bad Request",
              writable: false,
            });
            Object.defineProperty(this, "responseText", {
              value: errorResponse,
              writable: false,
            });
            Object.defineProperty(this, "response", {
              value: errorResponse,
              writable: false,
            });
            Object.defineProperty(this, "readyState", {
              value: 4,
              writable: false,
            });
            const errorEvent = new ProgressEvent("error", {
              lengthComputable: true,
              loaded: 0,
              total: 0,
            });
            if (this.onerror) this.onerror.call(this, errorEvent);
            if (this.onreadystatechange)
              this.onreadystatechange.call(this, errorEvent);
          });
        return;
      }
      return super.send(body);
    }
  }
  window.XMLHttpRequest = InterceptedXHR;
}

// Helper function to handle API calls
async function handleApiCall(
  url: string,
  init: RequestInit | undefined,
  executeAction: any
) {
  // Extract the path part after /api regardless of base path
  let apiPath;
  const apiIndex = url.indexOf("/api/");
  if (apiIndex !== -1) {
    apiPath = url.substring(apiIndex + 4); // Remove "/api" prefix
  } else {
    return fetch(url, init);
  }
  const segments = apiPath.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const componentId = segments[0];
    const actionId = segments[1];
    let params = {};
    if (init && init.body) {
      try {
        params = JSON.parse(init.body.toString());
      } catch {}
    }
    try {
      const result = await executeAction(componentId, actionId, params);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return fetch(url, init);
}

const SwaggerExplorer: React.FC = () => {
  const { spec, refreshSpec } = useOpenApiSpec();
  const { executeAction } = useApi();

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
  const swaggerContainerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!swaggerContainerRef.current) return;
    const observer = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some(
        (mutation) => mutation.addedNodes.length > 0
      );
      if (hasAddedNodes) {
        stabilizeSwaggerUIForms();
        preventSwaggerUIHashNavigation();
      }
    });
    observer.observe(swaggerContainerRef.current, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);
  // Set up global interceptors ONCE (safe for StrictMode)
  useEffect(() => {
    setupGlobalInterceptors(() => executeAction);
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
        {" "}
        <SwaggerUI
          spec={memoizedSpec}
          {...SwaggerUIOptions}
          supportedSubmitMethods={["get", "post", "put", "delete"]}
          requestInterceptor={(req) => {
            console.log("🔍 SWAGGER UI REQUEST INTERCEPTOR:", req);
            console.log("  - URL:", req.url);
            console.log("  - Method:", req.method);
            console.log("  - Body:", req.body);
            console.log("  - Headers:", req.headers);
            return req;
          }}
          responseInterceptor={(res) => {
            console.log("📨 SWAGGER UI RESPONSE INTERCEPTOR:", res);
            console.log("  - Status:", res.status);
            console.log("  - URL:", res.url);
            console.log("  - Body:", res.body);
            return res;
          }}
        />
      </div>
    </div>
  );
};

export default SwaggerExplorer;
