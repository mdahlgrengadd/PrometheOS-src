
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PluginManager } from './PluginManager';
import { Plugin, PluginManifest } from './types';
import { availablePlugins } from './registry';
import { eventBus } from './EventBus';

type PluginContextType = {
  pluginManager: PluginManager;
  loadedPlugins: Plugin[];
  activeWindows: string[];
  openWindow: (pluginId: string) => void;
  closeWindow: (pluginId: string) => void;
  minimizeWindow: (pluginId: string) => void;
  maximizeWindow: (pluginId: string) => void;
  focusWindow: (pluginId: string) => void;
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pluginManager] = useState(() => new PluginManager());
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  
  useEffect(() => {
    // Initialize plugin manager and load plugins
    const loadPlugins = async () => {
      try {
        // In a real implementation, these would be loaded dynamically
        // For now, we're importing them directly in the registry
        
        // Register event handler for plugin registration
        const unsubscribe = eventBus.subscribe('plugin:registered', (pluginId: string) => {
          setLoadedPlugins(pluginManager.getAllPlugins());
        });
        
        // Load the plugins from manifests
        for (const manifest of availablePlugins) {
          // Dynamic import simulation
          const modulePromise = import(`./apps/${manifest.id}`);
          modulePromise.then(module => {
            const plugin = module.default;
            pluginManager.registerPlugin(plugin);
          }).catch(error => {
            console.error(`Failed to load plugin ${manifest.id}:`, error);
          });
        }
        
        return () => {
          unsubscribe();
          // Clean up all plugins when unmounting
          pluginManager.getAllPlugins().forEach(plugin => {
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
      if (!pluginManager.isPluginActive(pluginId)) {
        pluginManager.activatePlugin(pluginId);
      }
      plugin.onOpen?.();
      setActiveWindows(prev => 
        prev.includes(pluginId) ? prev : [...prev, pluginId]
      );
      eventBus.emit('window:opened', pluginId);
    }
  };
  
  const closeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onClose?.();
      setActiveWindows(prev => prev.filter(id => id !== pluginId));
      eventBus.emit('window:closed', pluginId);
    }
  };
  
  const minimizeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onMinimize?.();
      eventBus.emit('window:minimized', pluginId);
    }
  };
  
  const maximizeWindow = (pluginId: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (plugin) {
      plugin.onMaximize?.();
      eventBus.emit('window:maximized', pluginId);
    }
  };
  
  const focusWindow = (pluginId: string) => {
    eventBus.emit('window:focused', pluginId);
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
        focusWindow
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};
