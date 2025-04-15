import React from 'react';

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
  entry: string;
  preferredSize?: {
    width: number;
    height: number;
  };
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
