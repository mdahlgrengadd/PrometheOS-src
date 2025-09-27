import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

// Flexible API client hook that works in both host and remote contexts
const useFlexibleApiClient = () => {
  try {
    // Try to import and use the remote API client
    const { useApiClient } = require('@shared/api-client');
    return useApiClient();
  } catch (error) {
    // Fallback: try to get the host API client from context
    const HostApiClientContext = React.createContext<any>(null);
    const context = useContext(HostApiClientContext);

    if (context) {
      return context;
    }

    // Final fallback: check if we're in a host context with a different pattern
    if (typeof window !== 'undefined' && (window as any).__HOST_API_CLIENT__) {
      return (window as any).__HOST_API_CLIENT__;
    }

    throw new Error('No API client available in current context');
  }
};
import { systemApiComponent } from './systemActions';
import { AppLauncher } from './services/AppLauncher';
import { NotificationEngine } from './services/NotificationEngine';
import { DialogManager } from './services/DialogManager';
import { EventWaiter } from './services/EventWaiter';
import {
  SystemApiContextType,
  AppLaunchConfig,
  NotificationConfig,
  DialogConfig,
  EventWaitConfig,
  OpenAppParams,
  KillAppParams,
  NotifyParams,
  DialogParams,
  WaitForEventParams
} from './types';

const SystemApiContext = createContext<SystemApiContextType | null>(null);

interface SystemApiProviderProps {
  children: React.ReactNode;

  // Optional injection of host services
  eventBus?: any;
  windowStore?: any;
  pluginRegistry?: any;
  toastProvider?: any;
  dialogProvider?: any;
  // Optional API client override for host context
  apiClient?: any;
}

export const SystemApiProvider: React.FC<SystemApiProviderProps> = ({
  children,
  eventBus,
  windowStore,
  pluginRegistry,
  toastProvider,
  dialogProvider,
  apiClient: providedApiClient
}) => {
  // Use provided API client or try to get one from context
  let apiClient;
  try {
    const contextApiClient = providedApiClient ? null : useFlexibleApiClient();
    apiClient = providedApiClient || contextApiClient;
  } catch (error) {
    if (!providedApiClient) {
      console.error('[SystemApiProvider] No API client available:', error);
      throw error;
    }
    apiClient = providedApiClient;
  }

  const [isRegistered, setIsRegistered] = useState(false);

  // Initialize services
  const services = useMemo(() => {
    const appLauncher = new AppLauncher(eventBus, windowStore, pluginRegistry);
    const notificationEngine = new NotificationEngine(eventBus, toastProvider);
    const dialogManager = new DialogManager(eventBus, dialogProvider);
    const eventWaiter = new EventWaiter(eventBus);

    return {
      appLauncher,
      notificationEngine,
      dialogManager,
      eventWaiter
    };
  }, [eventBus, windowStore, pluginRegistry, toastProvider, dialogProvider]);

  // Action handlers
  const actionHandlers = useMemo(() => ({
    'sys.open': async (params: OpenAppParams) => {
      const config: AppLaunchConfig = typeof params.appId === 'string'
        ? { appId: params.appId, initFromUrl: params.initFromUrl }
        : params as any;

      return await services.appLauncher.launch(config);
    },

    'sys.kill': async (params: KillAppParams) => {
      await services.appLauncher.terminate(params.windowId);
      return { success: true };
    },

    'sys.notify': async (params: NotifyParams) => {
      const config: NotificationConfig = typeof params.message === 'string'
        ? { message: params.message, engine: params.engine }
        : params as any;

      await services.notificationEngine.send(config);
      return { success: true };
    },

    'sys.dialog': async (params: DialogParams) => {
      const config: DialogConfig = {
        title: params.title,
        message: params.message,
        type: params.type as any || 'confirm'
      };

      return await services.dialogManager.show(config);
    },

    'sys.events.waitFor': async (params: WaitForEventParams) => {
      const config: EventWaitConfig = typeof params.eventName === 'string'
        ? { eventName: params.eventName, timeout: params.timeout }
        : params as any;

      return await services.eventWaiter.waitFor(config);
    },

    'sys.events.list': async () => {
      return services.eventWaiter.listAvailable();
    }
  }), [services]);

  // Register component and action handlers with API client
  useEffect(() => {
    if (!apiClient || isRegistered) return;

    // Register the system API component
    apiClient.registerComponent(systemApiComponent);

    // Register action handlers via event bus
    Object.entries(actionHandlers).forEach(([handlerName, handler]) => {
      eventBus?.emit('api:registerActionHandler', {
        componentId: 'system',
        actionId: handlerName.replace('sys.', ''),
        handler
      });
    });

    setIsRegistered(true);

    // Emit system ready event
    eventBus?.emit('system.api.ready', {
      component: systemApiComponent.id,
      actions: systemApiComponent.actions.length,
      timestamp: Date.now()
    });

    // Cleanup on unmount
    return () => {
      if (apiClient && isRegistered) {
        apiClient.unregisterComponent(systemApiComponent.id);
        // Note: Action handlers will be cleaned up when component is unregistered
      }
    };
  }, [apiClient, actionHandlers, isRegistered, eventBus]);

  // Context API methods
  const openApp = useCallback(async (
    config: AppLaunchConfig | string,
    initFromUrl?: string
  ): Promise<string> => {
    if (typeof config === 'string') {
      config = { appId: config, initFromUrl };
    }
    return await services.appLauncher.launch(config);
  }, [services.appLauncher]);

  const killApp = useCallback(async (windowId: string): Promise<void> => {
    await services.appLauncher.terminate(windowId);
  }, [services.appLauncher]);

  const notify = useCallback(async (
    config: NotificationConfig | string,
    engine?: string
  ): Promise<void> => {
    const finalConfig: NotificationConfig = typeof config === 'string'
      ? { message: config, engine: engine as any }
      : config;
    await services.notificationEngine.send(finalConfig);
  }, [services.notificationEngine]);

  const showDialog = useCallback(async (config: DialogConfig): Promise<boolean | string> => {
    return await services.dialogManager.show(config);
  }, [services.dialogManager]);

  const waitForEvent = useCallback(async (
    config: EventWaitConfig | string,
    timeout?: number
  ): Promise<any> => {
    if (typeof config === 'string') {
      config = { eventName: config, timeout };
    }
    return await services.eventWaiter.waitFor(config);
  }, [services.eventWaiter]);

  const listEvents = useCallback(async (): Promise<string[]> => {
    return services.eventWaiter.listAvailable();
  }, [services.eventWaiter]);

  const contextValue: SystemApiContextType = useMemo(() => ({
    openApp,
    killApp,
    notify,
    showDialog,
    waitForEvent,
    listEvents,
    services
  }), [openApp, killApp, notify, showDialog, waitForEvent, listEvents, services]);

  return (
    <SystemApiContext.Provider value={contextValue}>
      {children}
    </SystemApiContext.Provider>
  );
};

// Hook to use the System API context
export const useSystemApi = (): SystemApiContextType => {
  const context = useContext(SystemApiContext);
  if (!context) {
    throw new Error('useSystemApi must be used within a SystemApiProvider');
  }
  return context;
};

// Convenience hooks for individual services
export const useAppLauncher = () => {
  const { services } = useSystemApi();
  return services.appLauncher;
};

export const useNotificationEngine = () => {
  const { services } = useSystemApi();
  return services.notificationEngine;
};

export const useDialogManager = () => {
  const { services } = useSystemApi();
  return services.dialogManager;
};

export const useEventWaiter = () => {
  const { services } = useSystemApi();
  return services.eventWaiter;
};

export default SystemApiProvider;