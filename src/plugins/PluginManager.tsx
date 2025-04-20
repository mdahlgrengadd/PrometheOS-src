import React, { useState } from "react";

import { eventBus } from "./EventBus";
import { Plugin, PluginManifest } from "./types";

/**
 * Manages the lifecycle of plugins
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();

  /**
   * Register a plugin with the manager
   * @param plugin Plugin instance to register
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID ${plugin.id} already exists. Overwriting.`);
    }

    this.plugins.set(plugin.id, plugin);
    eventBus.emit("plugin:registered", plugin.id);
  }

  /**
   * Activate a plugin
   * @param pluginId ID of the plugin to activate
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`No plugin found with ID ${pluginId}`);
      return;
    }

    if (this.activePlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is already active`);
      return;
    }

    try {
      await plugin.init();
      this.activePlugins.add(pluginId);
      eventBus.emit("plugin:activated", pluginId);
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
    }
  }

  /**
   * Deactivate a plugin
   * @param pluginId ID of the plugin to deactivate
   */
  deactivatePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`No plugin found with ID ${pluginId}`);
      return;
    }

    if (!this.activePlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is not active`);
      return;
    }

    try {
      plugin.onDestroy?.();
      this.activePlugins.delete(pluginId);
      eventBus.emit("plugin:deactivated", pluginId);
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
    }
  }

  /**
   * Completely unregister a plugin from the system
   * @param pluginId ID of the plugin to unregister
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`No plugin found with ID ${pluginId}`);
      return;
    }

    try {
      // Deactivate first if needed
      if (this.activePlugins.has(pluginId)) {
        this.deactivatePlugin(pluginId);
      }

      // Call destroy if it wasn't called during deactivation
      plugin.onDestroy?.();

      // Remove from plugins map
      this.plugins.delete(pluginId);
      eventBus.emit("plugin:unregistered", pluginId);
      console.log(`Plugin ${pluginId} has been unregistered`);
    } catch (error) {
      console.error(`Failed to unregister plugin ${pluginId}:`, error);
    }
  }

  /**
   * Get a plugin by ID
   * @param pluginId ID of the plugin to get
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all active plugins
   */
  getActivePlugins(): Plugin[] {
    return Array.from(this.activePlugins).map((id) => this.plugins.get(id)!);
  }

  /**
   * Check if a plugin is active
   * @param pluginId ID of the plugin to check
   */
  isPluginActive(pluginId: string): boolean {
    return this.activePlugins.has(pluginId);
  }

  /**
   * Load plugins from a list of manifests
   * @param manifests List of plugin manifests to load
   */
  async loadPlugins(manifests: PluginManifest[]): Promise<void> {
    for (const manifest of manifests) {
      try {
        // In a real implementation, this would dynamically import the plugin module
        // For this example, we're simulating that with a dummy plugin
        const plugin: Plugin = {
          id: manifest.id,
          manifest,
          init: async () => {
            console.log(`Initializing plugin: ${manifest.name}`);
          },
          render: () => {
            // This would be replaced with the actual plugin's render function
            return <div>Plugin: {manifest.name}</div>;
          },
        };

        this.registerPlugin(plugin);
      } catch (error) {
        console.error(`Failed to load plugin ${manifest.name}:`, error);
      }
    }
  }
}

// Hook to use PluginManager in React components
export function usePluginManager() {
  const [pluginManager] = useState(() => new PluginManager());
  return pluginManager;
}
