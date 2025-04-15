
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PluginManager } from './PluginManager';
import { Plugin, PluginManifest } from './types';
import { availablePlugins } from './registry';
import { eventBus } from './EventBus';

// Import plugins directly for reliable loading
import NotepadPlugin from './apps/notepad';
import CalculatorPlugin from './apps/calculator';
import BrowserPlugin from './apps/browser';
import SettingsPlugin from './apps/settings';
import WordEditorPlugin from './apps/wordeditor';

// Map of plugin modules for direct access
const pluginModules: Record<string, Plugin> = {
  'notepad': NotepadPlugin,
  'calculator': CalculatorPlugin,
  'browser': BrowserPlugin,
  'settings': SettingsPlugin,
  'wordeditor': WordEditorPlugin,
};

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
        // Register event handler for plugin registration
        const unsubscribe = eventBus.subscribe('plugin:registered', (pluginId: string) => {
          setLoadedPlugins(pluginManager.getAllPlugins());
        });
        
        // Load the plugins directly from imported modules
        for (const manifest of availablePlugins) {
          try {
            // Get the plugin module from our direct imports
            const plugin = pluginModules[manifest.id];
            if (plugin) {
              pluginManager.registerPlugin(plugin);
            } else {
              console.error(`Plugin module for ${manifest.id} not found`);
            }
          } catch (error) {
            console.error(`Failed to load plugin ${manifest.id}:`, error);
          }
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
