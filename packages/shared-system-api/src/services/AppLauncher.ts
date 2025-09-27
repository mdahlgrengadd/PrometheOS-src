import { AppLauncher as IAppLauncher, AppLaunchConfig } from '../types';

export class AppLauncher implements IAppLauncher {
  private runningApps: Map<string, string> = new Map(); // appId -> windowId
  private windowStore: any; // Will be injected from host
  private pluginRegistry: any; // Will be injected from host

  constructor(
    private eventBus: any,
    windowStore?: any,
    pluginRegistry?: any
  ) {
    this.windowStore = windowStore;
    this.pluginRegistry = pluginRegistry;

    // Listen for window close events to update running apps
    this.eventBus?.subscribe('window.closed', (data: { windowId: string, appId: string }) => {
      this.runningApps.delete(data.appId);
    });
  }

  async launch(config: AppLaunchConfig): Promise<string> {
    const { appId, initFromUrl, windowConfig } = config;

    try {
      // Check if app exists in registry
      if (this.pluginRegistry && !this.pluginRegistry.has(appId)) {
        throw new Error(`Application '${appId}' not found in registry`);
      }

      // Generate unique window ID
      const windowId = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create window configuration
      const finalWindowConfig = {
        id: windowId,
        appId,
        title: this.getAppTitle(appId),
        width: windowConfig?.width || 800,
        height: windowConfig?.height || 600,
        x: windowConfig?.x,
        y: windowConfig?.y,
        minimized: windowConfig?.minimized || false,
        maximized: windowConfig?.maximized || false,
        initFromUrl,
        ...windowConfig
      };

      // Create window through window store
      if (this.windowStore?.createWindow) {
        await this.windowStore.createWindow(finalWindowConfig);
      } else {
        // Fallback: emit event for window creation
        this.eventBus?.emit('app.launch', {
          appId,
          windowId,
          initFromUrl,
          config: finalWindowConfig
        });
      }

      // Track running app
      this.runningApps.set(appId, windowId);

      // Emit success event
      this.eventBus?.emit('app.launched', {
        appId,
        windowId,
        config: finalWindowConfig
      });

      return windowId;
    } catch (error) {
      // Emit error event
      this.eventBus?.emit('app.launch.error', {
        appId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async terminate(windowId: string): Promise<void> {
    try {
      // Find app by window ID
      const appId = Array.from(this.runningApps.entries())
        .find(([_, wId]) => wId === windowId)?.[0];

      if (!appId) {
        throw new Error(`Window '${windowId}' not found`);
      }

      // Close window through window store
      if (this.windowStore?.closeWindow) {
        await this.windowStore.closeWindow(windowId);
      } else {
        // Fallback: emit event for window closure
        this.eventBus?.emit('app.kill', { windowId, appId });
      }

      // Remove from running apps
      this.runningApps.delete(appId);

      // Emit success event
      this.eventBus?.emit('app.killed', { windowId, appId });
    } catch (error) {
      // Emit error event
      this.eventBus?.emit('app.kill.error', {
        windowId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  isRunning(appId: string): boolean {
    return this.runningApps.has(appId);
  }

  listRunning(): string[] {
    return Array.from(this.runningApps.keys());
  }

  // Helper methods
  private getAppTitle(appId: string): string {
    if (this.pluginRegistry?.get) {
      const plugin = this.pluginRegistry.get(appId);
      return plugin?.manifest?.name || plugin?.name || appId;
    }

    // Fallback: capitalize and format app ID
    return appId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Injection methods for host integration
  setWindowStore(windowStore: any): void {
    this.windowStore = windowStore;
  }

  setPluginRegistry(pluginRegistry: any): void {
    this.pluginRegistry = pluginRegistry;
  }
}