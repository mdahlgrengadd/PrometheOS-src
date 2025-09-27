export interface DialogConfig {
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
}

export interface NotificationConfig {
  message: string;
  engine?: 'toast' | 'native' | 'system';
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  persistent?: boolean;
}

export interface EventWaitConfig {
  eventName: string;
  timeout?: number;
  once?: boolean;
}

export interface AppLaunchConfig {
  appId: string;
  initFromUrl?: string;
  windowConfig?: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    minimized?: boolean;
    maximized?: boolean;
  };
}

export interface SystemApiContextType {
  // App management
  openApp: (config: AppLaunchConfig | string, initFromUrl?: string) => Promise<string>;
  killApp: (windowId: string) => Promise<void>;

  // User notifications
  notify: (config: NotificationConfig | string, engine?: string) => Promise<void>;

  // System dialogs
  showDialog: (config: DialogConfig) => Promise<boolean | string>;

  // Event system
  waitForEvent: (config: EventWaitConfig | string, timeout?: number) => Promise<any>;
  listEvents: () => Promise<string[]>;

  // Service access (for advanced usage)
  services: {
    appLauncher: AppLauncher;
    notificationEngine: NotificationEngine;
    dialogManager: DialogManager;
    eventWaiter: EventWaiter;
  };
}

// Service interfaces
export interface AppLauncher {
  launch(config: AppLaunchConfig): Promise<string>;
  terminate(windowId: string): Promise<void>;
  isRunning(appId: string): boolean;
  listRunning(): string[];
}

export interface NotificationEngine {
  send(config: NotificationConfig): Promise<void>;
  getSupportedEngines(): string[];
  setDefaultEngine(engine: string): void;
}

export interface DialogManager {
  show(config: DialogConfig): Promise<boolean | string>;
  close(dialogId?: string): void;
  isOpen(): boolean;
}

export interface EventWaiter {
  waitFor(config: EventWaitConfig): Promise<any>;
  cancel(eventName: string): void;
  listWaiting(): string[];
  listAvailable(): string[];
}

// Action parameter types
export interface OpenAppParams {
  appId: string;
  initFromUrl?: string;
}

export interface KillAppParams {
  windowId: string;
}

export interface NotifyParams {
  message: string;
  engine?: string;
}

export interface DialogParams {
  title: string;
  message: string;
  type?: string;
}

export interface WaitForEventParams {
  eventName: string;
  timeout?: number;
}

export interface ListEventsParams {
  // No parameters needed
}

// Re-export types needed from api-client
export type { IApiComponent, IApiAction, IApiParameter } from '@shared/api-client';