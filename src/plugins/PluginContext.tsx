import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useWindowStore } from "@/store/windowStore";

import ApiExplorerPlugin from "./apps/api-explorer";
import ApiFlowEditorPlugin from "./apps/api-flow-editor";
import AudioPlayerPlugin from "./apps/audioplayer";
import BrowserPlugin from "./apps/browser";
import CalculatorPlugin from "./apps/calculator";
import WorkerCalculatorPlugin from "./apps/calculator/workerCalculator";
import ChatPlugin from "./apps/chat";
import FileBrowserPlugin from "./apps/filebrowser";
// Import plugins directly for reliable loading
import NotepadPlugin from "./apps/notepad";
import SessionPlugin from "./apps/session";
import SettingsPlugin from "./apps/settings";
import WebampPlugin from "./apps/webamp";
import WebLLMChatPlugin from "./apps/webllm-chat";
import WordEditorPlugin from "./apps/wordeditor";
import { eventBus } from "./EventBus";
import { PluginManager } from "./PluginManager";
import {
  getAllManifests,
  installPlugin,
  uninstallPlugin as removePluginFromRegistry,
} from "./registry";
import { Plugin, PluginManifest } from "./types";

// Map of plugin modules for direct access
const pluginModules: Record<string, Plugin> = {
  "api-explorer": ApiExplorerPlugin,
  "api-flow-editor": ApiFlowEditorPlugin,
  notepad: NotepadPlugin,
  calculator: CalculatorPlugin,
  "worker-calculator": WorkerCalculatorPlugin,
  browser: BrowserPlugin,
  settings: SettingsPlugin,
  WordEditor: WordEditorPlugin,
  audioplayer: AudioPlayerPlugin,
  webamp: WebampPlugin,
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
  openWindow: (pluginId: string) => void;
  closeWindow: (pluginId: string) => void;
  minimizeWindow: (pluginId: string) => void;
  maximizeWindow: (pluginId: string) => void;
  focusWindow: (pluginId: string) => void;
  installRemoteApp: (url: string) => Promise<PluginManifest | undefined>;
  uninstallPlugin: (pluginId: string) => Promise<boolean>;
  getDynamicPlugins: () => Plugin[];
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pluginManager] = useState(() => new PluginManager());
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [dynamicPluginIds, setDynamicPluginIds] = useState<string[]>([]);

  // Get window store actions with selectors to avoid re-renders on store changes
  const registerWindow = useWindowStore((state) => state.registerWindow);
  const setOpen = useWindowStore((state) => state.setOpen);
  const focus = useWindowStore((state) => state.focus);

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
              const plugin = pluginModules[manifest.id];
              pluginManager.registerPlugin(plugin);

              // Register window in the store immediately after plugin registration
              const defaultSize = { width: 400, height: 300 };
              const size = plugin.manifest.preferredSize || defaultSize;

              registerWindow({
                id: plugin.id,
                title: plugin.manifest.name,
                content: plugin.render ? (
                  plugin.render()
                ) : (
                  <div>No content</div>
                ),
                isOpen: false,
                isMinimized: false,
                zIndex: 1,
                position: {
                  x: 100 + Math.random() * 100,
                  y: 100 + Math.random() * 100,
                },
                size,
                isMaximized: false,
              });
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

                // Register window for dynamic plugin too
                const plugin = module.default;
                const defaultSize = { width: 400, height: 300 };
                const size = plugin.manifest.preferredSize || defaultSize;

                registerWindow({
                  id: plugin.id,
                  title: plugin.manifest.name,
                  content: plugin.render ? (
                    plugin.render()
                  ) : (
                    <div>No content</div>
                  ),
                  isOpen: false,
                  isMinimized: false,
                  zIndex: 1,
                  position: {
                    x: 100 + Math.random() * 100,
                    y: 100 + Math.random() * 100,
                  },
                  size,
                  isMaximized: false,
                });
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
  }, [pluginManager, registerWindow]);

  // Wrap callbacks in useCallback to prevent unnecessary re-renders
  const openWindow = useCallback(
    (pluginId: string) => {
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

        // Just use the store directly
        setOpen(pluginId, true);
        focus(pluginId);
      }
    },
    [pluginManager, setOpen, focus]
  );

  const closeWindow = useCallback(
    (pluginId: string) => {
      const plugin = pluginManager.getPlugin(pluginId);
      if (plugin) {
        plugin.onClose?.();

        // Just use the store directly
        setOpen(pluginId, false);
      }
    },
    [pluginManager, setOpen]
  );

  const minimizeWindow = useCallback(
    (pluginId: string) => {
      const plugin = pluginManager.getPlugin(pluginId);
      if (plugin) {
        plugin.onMinimize?.();

        // Use store directly with selector
        useWindowStore.getState().minimize(pluginId, true);
      }
    },
    [pluginManager]
  );

  const maximizeWindow = useCallback(
    (pluginId: string) => {
      const plugin = pluginManager.getPlugin(pluginId);
      if (plugin) {
        plugin.onMaximize?.();

        // Use store directly with selector
        useWindowStore.getState().maximize(pluginId);
      }
    },
    [pluginManager]
  );

  const focusWindow = useCallback(
    (pluginId: string) => {
      const plugin = pluginManager.getPlugin(pluginId);
      if (plugin) {
        // Plugin doesn't have onFocus method
        focus(pluginId);
        // Also un-minimize the window
        useWindowStore.getState().minimize(pluginId, false);
      }
    },
    [pluginManager, focus]
  );

  const installRemoteApp = useCallback(async (url: string) => {
    try {
      const pluginInfo = await installPlugin(url);
      if (pluginInfo) {
        console.log("Plugin installed:", pluginInfo);
        // We let the event handler add this to our loaded plugins
        // The event is triggered from the registry
      }
      return pluginInfo;
    } catch (error) {
      console.error("Failed to install remote app:", error);
      throw error; // Re-throw to let UI handle it
    }
  }, []);

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      try {
        // Only allow uninstalling dynamic plugins
        if (!dynamicPluginIds.includes(pluginId)) {
          throw new Error("Cannot uninstall built-in plugins");
        }

        // Close window if open
        closeWindow(pluginId);

        // Deactivate and unregister the plugin
        pluginManager.deactivatePlugin(pluginId);
        pluginManager.unregisterPlugin(pluginId);

        // Remove from registry
        await removePluginFromRegistry(pluginId);

        // Update our dynamic plugins list
        setDynamicPluginIds((prevIds) =>
          prevIds.filter((id) => id !== pluginId)
        );

        return true;
      } catch (error) {
        console.error("Failed to uninstall plugin:", error);
        throw error;
      }
    },
    [dynamicPluginIds, closeWindow, pluginManager]
  );

  const getDynamicPlugins = useCallback(() => {
    return loadedPlugins.filter((plugin) =>
      dynamicPluginIds.includes(plugin.id)
    );
  }, [loadedPlugins, dynamicPluginIds]);

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      pluginManager,
      loadedPlugins,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      installRemoteApp,
      uninstallPlugin,
      getDynamicPlugins,
    }),
    [
      pluginManager,
      loadedPlugins,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      installRemoteApp,
      uninstallPlugin,
      getDynamicPlugins,
    ]
  );

  return (
    <PluginContext.Provider value={contextValue}>
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
