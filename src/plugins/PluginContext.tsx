import React, {
    createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState
} from 'react';

import { useWindowStore } from '@/store/windowStore';
import { createInitDataFromUrl } from '@/utils/url';

import { manifest as aichatManifest } from './apps/aichat/manifest';
// Import manifests instead of full plugin implementations
import { manifest as apiExplorerManifest } from './apps/api-explorer/manifest';
import { manifest as audioPlayerManifest } from './apps/audioplayer/manifest';
import { manifest as apiFlowEditorManifest } from './apps/blueprints/manifest';
import { manifest as browserManifest } from './apps/browser/manifest';
import { manifest as builderManifest } from './apps/builder/manifest';
import { manifest as calculatorManifest } from './apps/calculator/manifest';
import { manifest as chatManifest } from './apps/chat/manifest';
import { manifest as desktop3dManifest } from './apps/desktop-3d/manifest';
import { manifest as fileExplorerManifest } from './apps/file-explorer/manifest';
import { manifest as notepadManifest } from './apps/notepad/manifest';
import { manifest as pyodideTestManifest } from './apps/pyodide-test/manifest';
import { manifest as pythonScribeManifest } from './apps/pyserve/manifest';
import { manifest as sessionManifest } from './apps/session/manifest';
import { manifest as settingsManifest } from './apps/settings/manifest';
import { manifest as webampManifest } from './apps/webamp/manifest';
import { manifest as wordEditorManifest } from './apps/wordeditor/manifest';
import { eventBus } from './EventBus';
import { PluginManager } from './PluginManager';
import {
    getAllManifests, installPlugin, uninstallPlugin as removePluginFromRegistry
} from './registry';
import { Plugin, PluginInitData, PluginManifest } from './types';
import { workerPluginManager } from './WorkerPluginManagerClient';

// Lazy loading factory for plugins
const createLazyPlugin = (pluginId: string) => {
  return lazy(() =>
    import(`./apps/${pluginId}/index.ts`).then((module) => ({
      default: module.default,
    }))
  );
};

// Map of plugin loaders - these don't load the actual plugin until needed
const pluginLoaders: Record<string, () => Promise<Plugin>> = {
  "api-explorer": () => import("./apps/api-explorer").then((m) => m.default),
  "app-preview": () => import("./apps/app-preview").then((m) => m.default),
  blueprints: () => import("./apps/blueprints").then((m) => m.default),
  notepad: () => import("./apps/notepad").then((m) => m.default),
  calculator: () => import("./apps/calculator").then((m) => m.default),
  browser: () => import("./apps/browser").then((m) => m.default),
  hybride: () => import("./apps/builder").then((m) => m.default),
  settings: () => import("./apps/settings").then((m) => m.default),
  wordeditor: () => import("./apps/wordeditor").then((m) => m.default),
  audioplayer: () => import("./apps/audioplayer").then((m) => m.default),
  webamp: () => import("./apps/webamp").then((m) => m.default),
  aichat: () => import("./apps/aichat/index.tsx").then((m) => m.default),
  session: () => import("./apps/session").then((m) => m.default),
  chat: () => import("./apps/chat").then((m) => m.default),
  "file-explorer": () => import("./apps/file-explorer").then((m) => m.default),
  "pyodide-test": () => import("./apps/pyodide-test").then((m) => m.default),
  pyserve: () => import("./apps/pyserve").then((m) => m.default),
  "desktop-3d": () =>
    import("./apps/desktop-3d/index.tsx").then((m) => m.default),
};

// Create a wrapper component that renders the plugin
const PluginWrapper = ({ pluginId }: { pluginId: string }) => {
  const [plugin, setPlugin] = useState<Plugin | null>(null);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        if (pluginLoaders[pluginId]) {
          const loadedPlugin = await pluginLoaders[pluginId]();
          setPlugin(loadedPlugin);
        }
      } catch (error) {
        console.error(`Error loading plugin ${pluginId}:`, error);
      }
    };

    loadPlugin();
  }, [pluginId]);

  if (!plugin) {
    return <LoadingFallback />;
  }

  return plugin.render ? plugin.render() : <div>No content for {pluginId}</div>;
};

type PluginWrapperProps = {
  pluginId: string;
};

// Map of plugin components
const lazyPluginComponents: Record<
  string,
  React.ComponentType<PluginWrapperProps>
> = Object.keys(pluginLoaders).reduce(
  (acc, pluginId) => ({
    ...acc,
    [pluginId]: (props: PluginWrapperProps) => (
      <PluginWrapper pluginId={pluginId} {...props} />
    ),
  }),
  {} as Record<string, React.ComponentType<PluginWrapperProps>>
);

// Map of manifests by plugin ID
const manifestMap: Record<string, PluginManifest> = {
  "api-explorer": apiExplorerManifest,
  blueprints: apiFlowEditorManifest,
  notepad: notepadManifest,
  calculator: calculatorManifest,
  browser: browserManifest,
  hybride: builderManifest,
  settings: settingsManifest,
  wordeditor: wordEditorManifest,
  audioplayer: audioPlayerManifest,
  webamp: webampManifest,
  aichat: aichatManifest,
  session: sessionManifest,
  chat: chatManifest,
  "file-explorer": fileExplorerManifest,
  "pyodide-test": pyodideTestManifest,
  pyserve: pythonScribeManifest,
  "desktop-3d": desktop3dManifest,
};

// Debug: Log available plugins
console.log("Available plugin loaders:", Object.keys(pluginLoaders));

type PluginContextType = {
  pluginManager: PluginManager;
  loadedPlugins: Plugin[];
  openWindow: (pluginId: string, initFromUrl?: string) => void;
  closeWindow: (pluginId: string) => void;
  minimizeWindow: (pluginId: string) => void;
  maximizeWindow: (pluginId: string) => void;
  focusWindow: (pluginId: string) => void;
  installRemoteApp: (url: string) => Promise<PluginManifest | undefined>;
  uninstallPlugin: (pluginId: string) => Promise<boolean>;
  getDynamicPlugins: () => Plugin[];
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
      <p>Loading plugin...</p>
    </div>
  </div>
);

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

    // Position windows at center with small random offset for CSS3D coordinate system
    const getSmartPosition = (windowSize: {
      width: number;
      height: number;
    }) => {
      // CSS3DObject positioning uses center-based coordinates where:
      // - position.x/y represents the CENTER of the window
      // - Orthographic camera: left=0, right=width, top=0, bottom=-height
      // - Y coordinates get negated when applied to CSS3DObject (handled in WindowLayer)

      const taskbarHeight = 48;
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - taskbarHeight;

      // Calculate center of available viewport space
      const viewportCenterX = availableWidth / 2;
      const viewportCenterY = availableHeight / 2;

      // Small random offset to prevent perfect stacking
      const randomOffset = 30;
      const offsetX = (Math.random() - 0.5) * randomOffset;
      const offsetY = (Math.random() - 0.5) * randomOffset;

      // The window center should be at the viewport center
      return {
        x: viewportCenterX + offsetX,
        y: viewportCenterY + offsetY,
      };
    };

    // Load plugins
    const loadPlugins = async () => {
      try {
        // Load all manifests (static + dynamic)
        const manifests = getAllManifests();
        const dynamicIds: string[] = [];

        for (const manifest of manifests) {
          try {
            if (pluginLoaders[manifest.id]) {
              // Register window in the store before loading the actual plugin
              const defaultSize = { width: 400, height: 300 };
              const size = manifest.preferredSize || defaultSize;

              registerWindow({
                id: manifest.id,
                title: manifest.name,
                content: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PluginWrapper pluginId={manifest.id} />
                  </Suspense>
                ),
                isOpen: false,
                isMinimized: false,
                zIndex: 1,
                position: getSmartPosition(size),
                size,
                isMaximized: false,
                hideWindowChrome: manifest.hideWindowChrome,
              });

              // We'll fully load the plugin only when it's first opened
            } else if (manifest.entrypoint) {
              // Dynamic plugin - load from entrypoint URL
              try {
                // Register window immediately but load content lazily
                const defaultSize = { width: 400, height: 300 };
                const size = manifest.preferredSize || defaultSize;

                registerWindow({
                  id: manifest.id,
                  title: manifest.name,
                  content: (
                    <Suspense fallback={<LoadingFallback />}>
                      <DynamicPlugin
                        manifest={manifest}
                        pluginManager={pluginManager}
                      />
                    </Suspense>
                  ),
                  isOpen: false,
                  isMinimized: false,
                  zIndex: 1,
                  position: getSmartPosition(size),
                  size,
                  isMaximized: false,
                  hideWindowChrome: manifest.hideWindowChrome,
                });

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

    return () => {
      unsubscribe();
      // Clean up all plugins when unmounting
      pluginManager.getAllPlugins().forEach((plugin) => {
        plugin.onDestroy?.();
      });
    };
  }, [pluginManager, registerWindow]);

  // Dynamic plugin component that loads remote plugins
  const DynamicPlugin = ({
    manifest,
    pluginManager,
  }: {
    manifest: PluginManifest;
    pluginManager: PluginManager;
  }) => {
    const [Component, setComponent] = useState<React.ReactNode>(null);

    useEffect(() => {
      const loadPlugin = async () => {
        try {
          const module = await import(/* @vite-ignore */ manifest.entrypoint!);

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

          // Register worker component if specified
          if (module.default.manifest.workerEntrypoint) {
            console.log(
              `Registering worker for dynamic plugin ${module.default.id}`
            );

            // Use the workerEntrypoint from the manifest
            const workerUrl = module.default.manifest.workerEntrypoint;

            try {
              const success = await workerPluginManager.registerPlugin(
                module.default.id,
                workerUrl
              );

              if (success) {
                console.log(
                  `Worker for ${module.default.id} registered successfully`
                );
              } else {
                console.error(
                  `Failed to register worker for ${module.default.id}`
                );
              }
            } catch (error) {
              console.error(
                `Error registering worker for ${module.default.id}:`,
                error
              );
            }
          }

          setComponent(module.default.render());
        } catch (error) {
          console.error(`Failed to load dynamic plugin ${manifest.id}:`, error);
          setComponent(<div>Failed to load plugin: {manifest.name}</div>);
        }
      };

      loadPlugin();
    }, [manifest, pluginManager]);

    return Component || <LoadingFallback />;
  }; // Load a plugin on demand when it's first opened
  const loadPlugin = useCallback(
    async (pluginId: string) => {
      // Check if the plugin is already loaded
      if (pluginManager.getPlugin(pluginId)) {
        return pluginManager.getPlugin(pluginId);
      }

      try {
        // Get the plugin loader
        const loader = pluginLoaders[pluginId];
        if (!loader) {
          console.error(`No loader found for plugin ${pluginId}`);
          return undefined;
        }

        // Load the plugin
        const plugin = await loader();

        // Register the plugin
        pluginManager.registerPlugin(plugin);

        // Register worker if needed
        if (plugin.manifest.workerEntrypoint) {
          console.log(`Registering worker for plugin ${plugin.id}`);

          // Use the workerEntrypoint from the manifest
          const workerUrl = plugin.manifest.workerEntrypoint;

          // Register the worker plugin
          workerPluginManager
            .registerPlugin(plugin.id, workerUrl)
            .then((success) => {
              if (success) {
                console.log(`Worker for ${plugin.id} registered successfully`);
              } else {
                console.error(`Failed to register worker for ${plugin.id}`);
              }
            })
            .catch((error) => {
              console.error(
                `Error registering worker for ${plugin.id}:`,
                error
              );
            });
        }

        return plugin;
      } catch (error) {
        console.error(`Failed to load plugin ${pluginId}:`, error);
        return undefined;
      }
    },
    [pluginManager]
  );
  // Wrap callbacks in useCallback to prevent unnecessary re-renders
  const openWindow = useCallback(
    async (pluginId: string, initFromUrl?: string) => {
      // Ensure the plugin is loaded
      let plugin = pluginManager.getPlugin(pluginId);

      if (!plugin) {
        plugin = await loadPlugin(pluginId);
        if (!plugin) {
          console.error(`Failed to load plugin ${pluginId}`);
          return;
        }
      }

      // Process initialization data if provided
      let initData: PluginInitData | undefined;
      if (initFromUrl) {
        try {
          initData = await createInitDataFromUrl(initFromUrl);
          console.log(`[PluginContext] Processing init URL for ${pluginId}:`, {
            url: initFromUrl,
            scheme: initData?.scheme,
            contentLength: initData?.content?.length || 0,
            error: initData?.error,
          });
        } catch (error) {
          console.error(`Failed to process init URL for ${pluginId}:`, error);
          initData = {
            initFromUrl,
            scheme: "plain",
            content: initFromUrl,
            error:
              error instanceof Error ? error.message : "Failed to process URL",
          };
        }
      }

      // If opening API Explorer, make sure notepad is activated first
      if (pluginId === "api-explorer") {
        const notepadPlugin = pluginManager.getPlugin("notepad");
        if (!notepadPlugin) {
          await loadPlugin("notepad");
        }
        if (!pluginManager.isPluginActive("notepad")) {
          console.log("Activating notepad plugin for API Explorer");
          pluginManager.activatePlugin("notepad");
        }
      }

      if (!pluginManager.isPluginActive(pluginId)) {
        pluginManager.activatePlugin(pluginId);
      }

      // Call onOpen with initialization data
      plugin.onOpen?.(initData);

      // Just use the registered position

      // Just use the store directly
      setOpen(pluginId, true);
      focus(pluginId);
    },
    [pluginManager, setOpen, focus, loadPlugin]
  );
  // Listen for plugin:openWindow event (used by the API system)
  useEffect(() => {
    const openWindowUnsubscribe = eventBus.subscribe(
      "plugin:openWindow",
      (data: string | { pluginId: string; initFromUrl?: string }) => {
        if (typeof data === "string") {
          console.log(`[PluginContext] Opening window ${data} from event`);
          openWindow(data);
        } else {
          console.log(
            `[PluginContext] Opening window ${data.pluginId} from event with init URL:`,
            data.initFromUrl
          );
          openWindow(data.pluginId, data.initFromUrl);
        }
      }
    );

    return () => {
      openWindowUnsubscribe();
    };
  }, [openWindow]);

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

  // Listen for plugin:closeWindow event (used by the API system)
  useEffect(() => {
    const closeWindowUnsubscribe = eventBus.subscribe(
      "plugin:closeWindow",
      (pluginId: string) => {
        console.log(`[PluginContext] Closing window ${pluginId} from event`);
        closeWindow(pluginId);
      }
    );
    return () => {
      closeWindowUnsubscribe();
    };
  }, [closeWindow]);

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
        const store = useWindowStore.getState();
        store.maximize(pluginId);
        // Bring to top after maximize
        store.focus(pluginId);
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
