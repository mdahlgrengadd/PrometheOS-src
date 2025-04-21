import React, { createContext, useContext, useEffect, useState } from "react";

import ApiExplorerPlugin from "./apps/api-explorer";
import ApiFlowEditorPlugin from "./apps/api-flow-editor";
import AudioPlayerPlugin from "./apps/audioplayer";
import BrowserPlugin from "./apps/browser";
import CalculatorPlugin from "./apps/calculator";
import ChatPlugin from "./apps/chat";
import FileBrowserPlugin from "./apps/filebrowser";
// Import plugins directly for reliable loading
import NotepadPlugin from "./apps/notepad";
import SessionPlugin from "./apps/session";
import SettingsPlugin from "./apps/settings";
import WebLLMChatPlugin from "./apps/webllm-chat";
import WordEditorPlugin from "./apps/WordEditor";
import { eventBus } from "./EventBus";
import { PluginManager } from "./PluginManager";
import {
  getAllManifests,
  installPlugin,
  uninstallPlugin as removePluginFromRegistry,
} from "./registry";
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
  session: SessionPlugin,
  chat: ChatPlugin,
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
  uninstallPlugin: (pluginId: string) => Promise<void>;
  getDynamicPlugins: () => Plugin[];
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pluginManager] = useState(() => new PluginManager());
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [dynamicPluginIds, setDynamicPluginIds] = useState<string[]>([]);

  useEffect(() => {
    // Register event handler for plugin registration
    const unsubscribe = eventBus.subscribe(
      "plugin:registered",
      (pluginId: string) => {
        setLoadedPlugins(pluginManager.getAllPlugins());
      }
    );

    // Load plugins
    const loadPlugins = async () => {
      try {
        // Load all manifests (static + dynamic)
        const manifests = getAllManifests();
        const dynamicIds: string[] = [];

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

                // If the plugin has iconUrl but not icon, create a React element for the icon
                if (manifest.iconUrl && !manifest.icon) {
                  module.default.manifest.icon = (
                    <img
                      src={manifest.iconUrl}
                      className="h-8 w-8"
                      alt={manifest.name}
                    />
                  );
                }

                pluginManager.registerPlugin(module.default);
                dynamicIds.push(manifest.id);
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

        setDynamicPluginIds(dynamicIds);
      } catch (error) {
        console.error("Failed to initialize plugins:", error);
      }
    };

    loadPlugins();

    // Return cleanup function
    return () => {
      unsubscribe();
      // Clean up all plugins when unmounting
      pluginManager.getAllPlugins().forEach((plugin) => {
        plugin.onDestroy?.();
      });
    };
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
          // Handle icon from URL if needed
          if (manifest.iconUrl && !module.default.manifest.icon) {
            module.default.manifest.icon = (
              <img
                src={manifest.iconUrl}
                className="h-8 w-8"
                alt={manifest.name}
              />
            );
          }

          pluginManager.registerPlugin(module.default);
          setDynamicPluginIds((prev) => [...prev, manifest.id]);
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

  // Function to uninstall a plugin
  const uninstallPlugin = async (pluginId: string) => {
    try {
      // First close the window if open
      if (activeWindows.includes(pluginId)) {
        closeWindow(pluginId);
      }

      // Unregister the plugin from the manager
      pluginManager.unregisterPlugin(pluginId);

      // Remove from localStorage (use the imported function)
      removePluginFromRegistry(pluginId);

      // Update UI state
      setDynamicPluginIds((prev) => prev.filter((id) => id !== pluginId));
      setLoadedPlugins(pluginManager.getAllPlugins());

      console.log(`Plugin ${pluginId} has been uninstalled`);
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      throw error;
    }
  };

  // Get only dynamic plugins
  const getDynamicPlugins = () => {
    return loadedPlugins.filter((plugin) =>
      dynamicPluginIds.includes(plugin.id)
    );
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
        uninstallPlugin,
        getDynamicPlugins,
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
