import React, { useEffect, useRef, useState } from 'react';

import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "browser",
  name: "Browser",
  version: "1.0.0",
  description: "A simple web browser",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34686_acrobat_beos_acrobat_beos.png"
      className="h-8 w-8"
      alt="Browser"
    />
  ),
  entry: "apps/browser",
  preferredSize: {
    width: 800,
    height: 600,
  },
};

const BrowserContent = () => {
  const [url, setUrl] = useState("https://en.wikipedia.org");
  const [currentUrl, setCurrentUrl] = useState("https://en.wikipedia.org");
  const [history, setHistory] = useState<string[]>([
    "https://en.wikipedia.org",
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // // Handle X-Frame-Options errors
  // useEffect(() => {
  //   const handleFrameError = () => {
  //     if (iframeRef.current) {
  //       try {
  //         // Try to access iframe content to see if it loaded
  //         const testAccess = iframeRef.current.contentWindow?.location.href;
  //       } catch (error) {
  //         // If we can't access the content, it's likely due to X-Frame-Options
  //         setFrameError(
  //           `This website (${currentUrl}) cannot be displayed in the browser due to security restrictions set by the website owner. This occurs when websites use X-Frame-Options to prevent embedding.`
  //         );
  //       }
  //     }
  //   };

  //   // Set a timeout to check for frame access after load attempt
  //   const timer = setTimeout(handleFrameError, 1500);
  //   return () => clearTimeout(timer);
  // }, [currentUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigateToUrl();
    }
  };

  const navigateToUrl = () => {
    // Add protocol if missing
    let formattedUrl = url;
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
      setUrl(formattedUrl);
    }

    setIsLoading(true);
    setFrameError(null);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(formattedUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(history[historyIndex - 1]);
      setUrl(history[historyIndex - 1]);
      setFrameError(null);
      setIsLoading(true);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(history[historyIndex + 1]);
      setUrl(history[historyIndex + 1]);
      setFrameError(null);
      setIsLoading(true);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    setFrameError(null);
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Try to update URL from iframe if possible
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeUrl = iframeRef.current.contentWindow.location.href;
        if (iframeUrl !== "about:blank" && iframeUrl !== currentUrl) {
          setUrl(iframeUrl);
          setCurrentUrl(iframeUrl);

          // Update history if navigated within iframe
          if (history[historyIndex] !== iframeUrl) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(iframeUrl);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
          }
        }
      }
    } catch (error) {
      // Could be a security error from cross-origin frames
      console.log("Couldn't access iframe URL due to security restrictions");
    }
  };

  // Suggest alternative sites that typically allow embedding
  const suggestedSites = [
    { name: "Example.com", url: "https://example.com" },
    { name: "Wikipedia", url: "https://en.wikipedia.org" },
    { name: "HTML5 Rocks", url: "https://www.html5rocks.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" },
  ];

  return (
    <div className="p-0 flex flex-col h-full">
      <div className="flex items-center mb-2 space-x-2">
        <div className="flex space-x-1">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={`px-2 py-1 rounded ${
              historyIndex <= 0
                ? "bg-muted text-muted-foreground"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            aria-label="Go back"
            title="Go back"
          >
            ←
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className={`px-2 py-1 rounded ${
              historyIndex >= history.length - 1
                ? "bg-muted text-muted-foreground"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            aria-label="Go forward"
            title="Go forward"
          >
            →
          </button>
          <button
            onClick={refresh}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Refresh"
            title="Refresh page"
          >
            ⟳
          </button>
        </div>
        <input
          type="text"
          className="flex-1 px-2 py-1 border border-border rounded-l bg-background text-foreground"
          placeholder="Enter URL..."
          value={url}
          onChange={handleUrlChange}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={navigateToUrl}
          className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
        >
          Go
        </button>
      </div>

      <div className="relative flex-1 bg-background border border-border">
        {isLoading && !frameError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-70 z-10">
            <div className="text-blue-500 font-semibold">Loading...</div>
          </div>
        )}

        {frameError ? (
          <div className="absolute inset-0 flex flex-col p-6 overflow-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{frameError}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">
              Try these sites instead:
            </h3>
            <ul className="space-y-2">
              {suggestedSites.map((site) => (
                <li key={site.url}>
                  <button
                    onClick={() => {
                      setUrl(site.url);
                      setCurrentUrl(site.url);
                      setFrameError(null);
                      setIsLoading(true);
                      // Update history
                      const newHistory = history.slice(0, historyIndex + 1);
                      newHistory.push(site.url);
                      setHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {site.name} - {site.url}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 bg-card p-4 rounded-md">
              <h4 className="font-medium mb-2">What is X-Frame-Options?</h4>
              <p className="text-sm text-muted-foreground">
                X-Frame-Options is a security header that websites use to
                prevent "clickjacking" attacks by controlling whether their
                pages can be embedded in iframes on other domains. When set to
                "SAMEORIGIN" (as in this case), the page can only be displayed
                in a frame on the same origin as the page itself.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full"
            onLoad={handleIframeLoad}
            title="Browser content"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  );
};

const BrowserPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Browser plugin initialized");
  },
  render: () => {
    return <BrowserContent />;
  },
};

export default BrowserPlugin;
