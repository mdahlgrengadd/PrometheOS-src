import React from "react";

/**
 * Plugin manifest definition that describes a plugin in the system
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: React.ReactNode;
  // URL to icon image for remote plugins (used instead of icon for dynamic plugins)
  iconUrl?: string;
  entry: string;
  // Optional entrypoint URL for dynamically loaded plugins
  entrypoint?: string;
  preferredSize?: {
    width: number;
    height: number;
  };
  /**
   * If true, the window manager should not render window chrome (titlebar, controls, etc)
   * and should let the app render its own UI edge-to-edge.
   */
  hideWindowChrome?: boolean;
}

/**
 * Standard interface for plugins with lifecycle methods
 */
export interface Plugin {
  id: string;
  manifest: PluginManifest;
  init: () => Promise<void> | void;
  render: () => React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onDestroy?: () => void;
}
