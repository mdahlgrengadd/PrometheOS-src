import React from "react";

import { IApiComponent } from "../api/core/types";

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
  // Optional worker entrypoint (relative to src/worker/plugins or as URL for remote plugins)
  workerEntrypoint?: string;
  preferredSize?: {
    width: number;
    height: number;
  };
  /**
   * If true, the window manager should not render window chrome (titlebar, controls, etc)
   * and should let the app render its own UI edge-to-edge.
   */
  hideWindowChrome?: boolean;
  /** If true, the window manager should not render any window container (frameless) and let the app render its own UI:**/
  frameless?: boolean;
  apiDoc?: Omit<IApiComponent, "id">;
}

/**
 * Initialization data for plugins with URL scheme support
 */
export interface PluginInitData {
  initFromUrl?: string;
  scheme?: "http" | "https" | "vfs" | "app" | "data" | "plain" | "none" | "error";
  content?: string;
  error?: string;
}

/**
 * Standard interface for plugins with lifecycle methods
 */
export interface Plugin {
  id: string;
  manifest: PluginManifest;
  init: (initData?: PluginInitData) => Promise<void> | void;
  render: () => React.ReactNode;
  onOpen?: (initData?: PluginInitData) => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onDestroy?: () => void;
}

/**
 * Worker plugin interface for compute-intensive tasks
 */
export interface WorkerPlugin {
  id: string;
  handle?: (method: string, params?: Record<string, unknown>) => unknown;
  [key: string]: unknown;
}
