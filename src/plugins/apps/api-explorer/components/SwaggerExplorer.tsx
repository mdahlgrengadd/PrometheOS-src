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
  }, []);  // Customize Swagger UI to intercept HTTP calls and execute them via our API
  useEffect(() => {
    // Only set up once
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    
    console.log("🔧 SETTING UP INTERCEPTORS");
    
    // Intercept fetch/XHR to handle requests through our API instead
    const originalFetch = window.fetch;
    const OriginalXHR = window.XMLHttpRequest;
    
    // Intercept fetch calls
    window.fetch = async function (input, init) {
      const url = input instanceof Request ? input.url : String(input);
      
      console.log("🔍 FETCH INTERCEPTOR - URL:", url, "Init:", init);

      // Check for API calls - handle both development and production base paths
      if (url.includes("/api/")) {
        return handleApiCall(url, init);
      } else {
        console.log("🔄 NON-API CALL - PASSING THROUGH:", url);
      }

      // For non-API calls, use the original fetch
      return originalFetch.apply(window, [input, init]);
    };
    
    // Also intercept XMLHttpRequest which SwaggerUI might use
    class InterceptedXHR extends OriginalXHR {
      private _url = '';
      private _method = '';
      
      open(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null): void {
        this._url = url.toString();
        this._method = method;
        console.log("🔍 XHR INTERCEPTOR - Opening:", method, url);
        
        if (url.toString().includes("/api/")) {
          console.log("🎯 XHR API CALL DETECTED");
          // Still call the original open but we'll intercept the send
        }
        
        return super.open(method, url, async, username, password);
      }
      
      send(body?: Document | XMLHttpRequestBodyInit | null): void {
        console.log("🔍 XHR INTERCEPTOR - Sending:", this._method, this._url, body);
        
        if (this._url.includes("/api/")) {
          console.log("🎯 XHR API CALL - INTERCEPTING");
          // Handle API call through our system
          handleApiCall(this._url, { method: this._method, body: body as BodyInit })
            .then(response => response.text())
            .then(text => {
              console.log("✅ XHR API RESPONSE:", text);
              // Simulate a successful XHR response
              Object.defineProperty(this, 'status', { value: 200, writable: false });
              Object.defineProperty(this, 'statusText', { value: 'OK', writable: false });
              Object.defineProperty(this, 'responseText', { value: text, writable: false });
              Object.defineProperty(this, 'response', { value: text, writable: false });
              Object.defineProperty(this, 'readyState', { value: 4, writable: false });
              
              // Trigger the load event with proper ProgressEvent
              const loadEvent = new ProgressEvent('load', {
                lengthComputable: true,
                loaded: text.length,
                total: text.length
              });
              if (this.onload) this.onload.call(this, loadEvent);
              if (this.onreadystatechange) this.onreadystatechange.call(this, loadEvent);
            })
            .catch(error => {
              console.error("❌ XHR API ERROR:", error);
              // Simulate an error response
              const errorResponse = JSON.stringify({ error: error.message });
              Object.defineProperty(this, 'status', { value: 400, writable: false });
              Object.defineProperty(this, 'statusText', { value: 'Bad Request', writable: false });
              Object.defineProperty(this, 'responseText', { value: errorResponse, writable: false });
              Object.defineProperty(this, 'response', { value: errorResponse, writable: false });
              Object.defineProperty(this, 'readyState', { value: 4, writable: false });
              
              // Trigger the error event with proper ProgressEvent
              const errorEvent = new ProgressEvent('error', {
                lengthComputable: true,
                loaded: 0,
                total: 0
              });
              if (this.onerror) this.onerror.call(this, errorEvent);
              if (this.onreadystatechange) this.onreadystatechange.call(this, errorEvent);
            });
          
          return;
        }
        
        return super.send(body);
      }
    }
    
    window.XMLHttpRequest = InterceptedXHR;
      // Helper function to handle API calls
    async function handleApiCall(url: string, init?: RequestInit) {
      console.log("🎯 API CALL DETECTED - URL:", url);
      
      // Extract the path part after /api regardless of base path
      let apiPath;
      const apiIndex = url.indexOf("/api/");
      if (apiIndex !== -1) {
        apiPath = url.substring(apiIndex + 4); // Remove "/api" prefix
        console.log("📍 EXTRACTED API PATH:", apiPath);
      } else {
        console.warn("❌ Failed to extract API path from URL:", url);
        return originalFetch.apply(window, [url, init]);
      }
      
      const segments = apiPath.split("/").filter(Boolean);
      console.log("🧩 PATH SEGMENTS:", segments);

      if (segments.length >= 2) {
        const componentId = segments[0];
        const actionId = segments[1];

        // Get parameters from the request body if available
        let params = {};
        if (init && init.body) {
          try {
            params = JSON.parse(init.body.toString());
            console.log("📦 REQUEST BODY PARAMS:", params);
          } catch (e) {
            console.error("❌ Failed to parse request body:", e);
          }
        }

        console.log(`🚀 EXECUTING ACTION: ${componentId}.${actionId}`, params);

        // Execute the action through our API system
        try {
          const result = await executeAction(componentId, actionId, params);
          console.log("✅ ACTION RESULT:", result);

          // Return a mock Response object with our result
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("❌ Error executing action:", error);
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
      } else {
        console.warn("⚠️ Not enough path segments for API call:", segments);
      }

      // For non-API calls, use the original fetch
      return originalFetch.apply(window, [url, init]);
    }

    // Cleanup when unmounted
    return () => {
      console.log("🧹 CLEANING UP INTERCEPTORS");
      window.fetch = originalFetch;
      window.XMLHttpRequest = OriginalXHR;
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
      >        <SwaggerUI
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
