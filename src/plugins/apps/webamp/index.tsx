import React, { useCallback, useEffect, useRef, useState } from "react";

import { useWindowStore } from "@/store/windowStore";

import { eventBus } from "../../../api/core/EventBus";
import { Plugin } from "../../types";
// Define the plugin manifest
import { manifest } from "./manifest";
import {
  WebampInstance,
  WebampOptions,
  WebampState,
  WebampTrack,
} from "./types";

// CSS preload helper
const preloadWebampCSS = () => {
  if (!document.getElementById("webamp-css-preload")) {
    const link = document.createElement("link");
    link.id = "webamp-css-preload";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/webamp@1.5.0/built/webamp.css";
    document.head.appendChild(link);
  }
};

// Main component for our Webamp app
const WebampComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webampLoaded, setWebampLoaded] = useState(false);
  const [tracks, setTracks] = useState<WebampTrack[]>([]);
  const webampRef = useRef<WebampInstance | null>(null);
  const eventUnsubscribesRef = useRef<Array<() => void>>([]);

  // Access to the window store to handle window state
  const setOpen = useWindowStore((state) => state.setOpen);
  const minimize = useWindowStore((state) => state.minimize);

  // Load Webamp script and CSS
  useEffect(() => {
    // Preload CSS to avoid FOUC (Flash of Unstyled Content)
    preloadWebampCSS();

    if (!window.Webamp && !document.getElementById("webamp-script")) {
      const script = document.createElement("script");
      script.id = "webamp-script";
      script.src = "https://unpkg.com/webamp@1.5.0/built/webamp.bundle.min.js";
      script.async = true;
      script.onload = () => setWebampLoaded(true);
      document.body.appendChild(script);
    } else if (window.Webamp) {
      setWebampLoaded(true);
    }
  }, []);

  // Register and clean up event bus listeners
  useEffect(() => {
    // Clean up any existing event subscriptions
    return () => {
      eventUnsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      eventUnsubscribesRef.current = [];
    };
  }, []);

  // Initialize Webamp only once when loaded
  useEffect(() => {
    if (webampLoaded && containerRef.current && !webampRef.current) {
      try {
        // Initial tracks - fallback to default
        const initialTracks =
          tracks.length > 0
            ? tracks
            : [
                {
                  metaData: {
                    artist: "DJ Mike Llama",
                    title: "Llama Whippin' Intro",
                  },
                  url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82/mp3/llama-2.91.mp3",
                  duration: 5.322286,
                },
              ];

        // Create Webamp instance
        const options: WebampOptions = {
          zIndex: 1000,
          initialTracks,
        };

        const webamp = new window.Webamp(options);
        webampRef.current = webamp;

        // Set up bi-directional window state sync
        const closeUnsubscribe = webamp.onClose(() => {
          setOpen("webamp", false);
          return undefined; // Return type expected by Webamp
        });

        const minimizeUnsubscribe = webamp.onMinimize(() => {
          minimize("webamp", true);
          return undefined; // Return type expected by Webamp
        });

        // Track change events
        const trackChangeUnsubscribe = webamp.onTrackDidChange((track) => {
          if (track?.metaData) {
            const { artist, title } = track.metaData;
            eventBus.emit("webamp:trackChanged", track, artist, title);
          }
          return undefined; // Return type expected by Webamp
        });

        // Register cleanups
        eventUnsubscribesRef.current.push(
          closeUnsubscribe,
          minimizeUnsubscribe,
          trackChangeUnsubscribe
        );

        // Expose webamp globally for debugging
        window.WebampGlobal = webamp;

        // Render when ready
        webamp.renderWhenReady(containerRef.current);

        // Set up event bus for external control
        const playUnsubscribe = eventBus.subscribe("webamp:play", () =>
          webamp.play()
        );
        const pauseUnsubscribe = eventBus.subscribe("webamp:pause", () =>
          webamp.pause()
        );
        const stopUnsubscribe = eventBus.subscribe("webamp:stop", () =>
          webamp.stop()
        );
        const nextUnsubscribe = eventBus.subscribe("webamp:next", () => {
          // Emulate next track functionality
          const state: WebampState = webamp.store.getState();
          const playlist = state.playlist || {};
          const tracks = state.tracks || [];
          const currentIndex = playlist.currentTrack || 0;
          if (currentIndex < tracks.length - 1) {
            webamp.store.dispatch({
              type: "SET_CURRENT_TRACK",
              trackId: currentIndex + 1,
            });
          }
        });
        const prevUnsubscribe = eventBus.subscribe("webamp:prev", () => {
          // Emulate previous track functionality
          const state: WebampState = webamp.store.getState();
          const playlist = state.playlist || {};
          const currentIndex = playlist.currentTrack || 0;
          if (currentIndex > 0) {
            webamp.store.dispatch({
              type: "SET_CURRENT_TRACK",
              trackId: currentIndex - 1,
            });
          }
        });

        // Load a track from URL
        const loadTrackUnsubscribe = eventBus.subscribe(
          "webamp:loadTrack",
          (url: string, title?: string, artist?: string) => {
            webamp.setTracksToPlay([
              {
                url,
                metaData: { artist, title },
              },
            ]);
          }
        );

        // Add events to cleanup
        eventUnsubscribesRef.current.push(
          playUnsubscribe,
          pauseUnsubscribe,
          stopUnsubscribe,
          loadTrackUnsubscribe,
          nextUnsubscribe,
          prevUnsubscribe
        );

        // Cleanup on unmount
        return () => {
          try {
            // Clean up all event subscriptions
            eventUnsubscribesRef.current.forEach((unsubscribe) =>
              unsubscribe()
            );
            eventUnsubscribesRef.current = [];

            // Dispose of Webamp
            webamp.dispose();
            delete window.WebampGlobal;
            webampRef.current = null;
          } catch (err) {
            console.error("Error disposing Webamp:", err);
          }
        };
      } catch (err) {
        console.error("Error initializing Webamp:", err);
      }
    }
    // Only depend on webampLoaded, NOT tracks
  }, [webampLoaded, setOpen, minimize]);

  // Handle track updates without re-initializing Webamp
  useEffect(() => {
    // Only run if we have tracks and a webamp instance
    if (tracks.length > 0 && webampRef.current) {
      webampRef.current.setTracksToPlay(tracks);
    }
  }, [tracks]);

  // Handle file drops - simplified version
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // Handle audio files
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length > 0) {
      const newTracks = audioFiles.map((file) => ({
        blob: file,
        metaData: {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        },
      }));
      setTracks(newTracks);
    }
  }, []);

  // Determine frameless mode
  const isFrameless = manifest.frameless === true;
  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center ${
        isFrameless ? "" : "bg-gray-800 text-white overflow-hidden"
      }`}
      style={isFrameless ? { backgroundColor: "transparent" } : {}}
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {!webampLoaded ? (
        <div className="text-center p-4">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p>Loading Webamp...</p>
        </div>
      ) : (
        <div className="w-full h-full" ref={containerRef}></div>
      )}
    </div>
  );
};

// Create the plugin object
const WebampPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Webamp plugin initialized");
    // Add global styles needed for Webamp
    const style = document.createElement("style");
    style.id = "webamp-global-styles";
    style.innerHTML = `
      #webamp {
        position: relative;
        z-index: 50;
      }
      .webamp-context-menu {
        z-index: 1000;
      }
      /* Disable theme window pseudo-element in Webamp container */
      #webamp .window::before {
        display: none !important;
      }

      /* Fix equalizer-top sizing under Win7 theme */
      .theme-win7 #webamp .equalizer-top {
        height: 0px !important;
        width: 0px !important;
      }
    `;
    document.head.appendChild(style);

    // Preload CSS
    preloadWebampCSS();
  },
  onDestroy: () => {
    // Remove global styles when plugin is destroyed
    const style = document.getElementById("webamp-global-styles");
    if (style) style.remove();

    // Clean up CSS link
    const cssLink = document.getElementById("webamp-css-preload");
    if (cssLink) cssLink.remove();
  },
  render: () => {
    return <WebampComponent />;
  },
};

export default WebampPlugin;
