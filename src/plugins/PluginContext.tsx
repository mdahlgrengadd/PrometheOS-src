import React, { createContext, useContext, useEffect, useState } from "react";

import ApiExplorerPlugin from "./apps/api-explorer";
import ApiFlowEditorPlugin from "./apps/api-flow-editor";
import AudioPlayerPlugin from "./apps/audioplayer";
import BrowserPlugin from "./apps/browser";
import CalculatorPlugin from "./apps/calculator";
import FileBrowserPlugin from "./apps/filebrowser";
// Import plugins directly for reliable loading
import NotepadPlugin from "./apps/notepad";
import SettingsPlugin from "./apps/settings";
import WebLLMChatPlugin from "./apps/webllm-chat";
import WordEditorPlugin from "./apps/WordEditor";
import { eventBus } from "./EventBus";
import { PluginManager } from "./PluginManager";
import { availablePlugins, getAllManifests, installPlugin } from "./registry";
import { Plugin } from "./types";

// Map of plugin modules for direct access
const pluginModules: Record<string, Plugin> = {
  "api-explorer": ApiExplorerPlugin,
  "api-flow-editor": ApiFlowEditorPlugin,
  notepad: NotepadPlugin,
  calculator: CalculatorPlugin,
  browser: BrowserPlugin,
  settings: SettingsPlugin,
  WordEditor: WordEditorPlugin,
  audioplayer: AudioPlayerPlugin,
  "webllm-chat": WebLLMChatPlugin,
  filebrowser: FileBrowserPlugin,
};

// Debug: Log available plugins
console.log("Available plugin modules:", Object.keys(pluginModules));
console.log("AudioPlayerPlugin:", AudioPlayerPlugin);
console.log("FileBrowserPlugin:", FileBrowserPlugin);

type PluginContextType = {
  pluginManager: PluginManager;
  loadedPlugins: Plugin[];
  activeWindows: string[];
  openWindow: (pluginId: string) => void;
  closeWindow: (pluginId: string) => void;
  minimizeWindow: (pluginId: string) => void;
  maximizeWindow: (pluginId: string) => void;
  focusWindow: (pluginId: string) => void;
  installRemoteApp: (url: string) => Promise<void>;
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pluginManager] = useState(() => new PluginManager());
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);

  useEffect(() => {
    // Initialize plugin manager and load plugins
    const loadPlugins = async () => {
      try {
        // Register event handler for plugin registration
        const unsubscribe = eventBus.subscribe(
          "plugin:registered",
          (pluginId: string) => {
            setLoadedPlugins(pluginManager.getAllPlugins());
          }
        );

        // Load all manifests (static + dynamic)
        const manifests = getAllManifests();

        for (const manifest of manifests) {
          try {
            if (pluginModules[manifest.id]) {
              // Static plugin - load from direct import
              pluginManager.registerPlugin(pluginModules[manifest.id]);
            } else if (manifest.entrypoint) {
              // Dynamic plugin - load from entrypoint URL
              try {
                const module = await import(
                  /* @vite-ignore */ manifest.entrypoint
                );
                pluginManager.registerPlugin(module.default);
              } catch (error) {
                console.error(
                  `Failed to load dynamic plugin ${manifest.id}:`,
                  error
                );
              }
            } else {
              console.error(
                `Plugin module for ${manifest.id} not found and no entrypoint provided`
              );
            }
          } catch (error) {
            console.error(`Failed to load plugin ${manifest.id}:`, error);
          }
        }

        return () => {
          unsubscribe();
          // Clean up all plugins when unmounting
          pluginManager.getAllPlugins().forEach((plugin) => {
            plugin.onDestroy?.();
          });
        };
      } catch (error) {
        console.error("Failed to initialize plugins:", error);
      }
    };

    loadPlugins();
  }, [pluginManager]);

  const openWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      // If opening API Explorer, make sure notepad is activated first
      if (pluginId === "api-explorer") {
        const notepadPlugin = pluginManager.getPlugin("notepad");
        if (notepadPlugin && !pluginManager.isPluginActive("notepad")) {
          console.log("Activating notepad plugin for API Explorer");
          pluginManager.activatePlugin("notepad");
        }
      }

      if (!pluginManager.isPluginActive(pluginId)) {
        pluginManager.activatePlugin(pluginId);
      }
      plugin.onOpen?.();
      setActiveWindows((prev) =>
        prev.includes(pluginId) ? prev : [...prev, pluginId]
      );
      eventBus.emit("window:opened", pluginId);
      // Ensure the window is focused and brought to the front when opened
      eventBus.emit("window:focused", pluginId);
    }
  };

  const closeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onClose?.();
      setActiveWindows((prev) => prev.filter((id) => id !== pluginId));
      eventBus.emit("window:closed", pluginId);
    }
  };

  const minimizeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onMinimize?.();
      eventBus.emit("window:minimized", pluginId);
    }
  };

  const maximizeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onMaximize?.();
      eventBus.emit("window:maximized", pluginId);
    }
  };

  const focusWindow = (pluginId: string) => {
    eventBus.emit("window:focused", pluginId);
  };

  // Expose an "install" helper for the UI
  const installRemoteApp = async (url: string) => {
    try {
      const manifest = await installPlugin(url);

      // Load & register immediately
      if (manifest.entrypoint) {
        const module = await import(/* @vite-ignore */ manifest.entrypoint);
        if (module.default) {
          pluginManager.registerPlugin(module.default);
          openWindow(manifest.id);
          return;
        }
      }
      throw new Error(`Invalid plugin module at ${url}`);
    } catch (error) {
      console.error("Failed to install remote app:", error);
      throw error;
    }
  };

  return (
    <PluginContext.Provider
      value={{
        pluginManager,
        loadedPlugins,
        activeWindows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        installRemoteApp,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error("usePlugins must be used within a PluginProvider");
  }
  return context;
};
