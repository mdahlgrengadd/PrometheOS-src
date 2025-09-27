import React, { createContext, useContext } from 'react';
import { SystemApiProvider } from '@shared/system-api';
import { useWindowStore } from '../store/windowStore';
import { toast } from 'sonner';

// Create a mock API client context for the host
const HostApiClientContext = createContext<any>(null);

const HostApiClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock API client that just provides the interface the SystemApiProvider expects
  const mockApiClient = {
    registerComponent: (component: any) => {
      console.log('[Host] Registering component:', component.id);
      return Promise.resolve();
    },
    unregisterComponent: (componentId: string) => {
      console.log('[Host] Unregistering component:', componentId);
      return Promise.resolve();
    },
    executeAction: (componentId: string, actionId: string, parameters: any) => {
      console.log('[Host] Execute action:', componentId, actionId, parameters);
      return Promise.resolve({ success: true, data: parameters });
    },
    subscribeEvent: (eventName: string, callback: (data: unknown) => void) => {
      console.log('[Host] Subscribe to event:', eventName);
      return Promise.resolve(() => console.log('[Host] Unsubscribe from event:', eventName));
    },
    emitEvent: (eventName: string, data?: unknown) => {
      console.log('[Host] Emit event:', eventName, data);
      return Promise.resolve();
    },
    getComponents: () => {
      return Promise.resolve([]);
    },
    getEventNames: () => {
      return Promise.resolve([]);
    },
    sendMCPMessage: (message: any) => {
      console.log('[Host] Send MCP message:', message);
      return Promise.resolve({ jsonrpc: '2.0', id: message.id, result: {} });
    }
  };

  return (
    <HostApiClientContext.Provider value={mockApiClient}>
      {children}
    </HostApiClientContext.Provider>
  );
};

// Mock hook for the host context
const useHostApiClient = () => {
  const context = useContext(HostApiClientContext);
  if (!context) {
    throw new Error('useHostApiClient must be used within HostApiClientProvider');
  }
  return context;
};

interface SystemApiIntegrationProps {
  children: React.ReactNode;
}

export const SystemApiIntegration: React.FC<SystemApiIntegrationProps> = ({ children }) => {
  // Get window store for app launcher integration
  const windowStore = useWindowStore();

  // Create host API client
  const hostApiClient = {
    registerComponent: (component: any) => {
      console.log('[Host] Registering component:', component.id);
      return Promise.resolve();
    },
    unregisterComponent: (componentId: string) => {
      console.log('[Host] Unregistering component:', componentId);
      return Promise.resolve();
    },
    executeAction: (componentId: string, actionId: string, parameters: any) => {
      console.log('[Host] Execute action:', componentId, actionId, parameters);
      return Promise.resolve({ success: true, data: parameters });
    },
    subscribeEvent: (eventName: string, callback: (data: unknown) => void) => {
      console.log('[Host] Subscribe to event:', eventName);
      return Promise.resolve(() => console.log('[Host] Unsubscribe from event:', eventName));
    },
    emitEvent: (eventName: string, data?: unknown) => {
      console.log('[Host] Emit event:', eventName, data);
      return Promise.resolve();
    },
    getComponents: () => {
      return Promise.resolve([]);
    },
    getEventNames: () => {
      return Promise.resolve([]);
    },
    sendMCPMessage: (message: any) => {
      console.log('[Host] Send MCP message:', message);
      return Promise.resolve({ jsonrpc: '2.0', id: message.id, result: {} });
    }
  };

  // Create event bus placeholder - in a real implementation this would connect to the actual event bus
  const eventBus = {
    emit: (eventName: string, data: any) => {
      console.log(`[EventBus] Emit: ${eventName}`, data);
      // In the real implementation, this would integrate with the actual event system
    },
    subscribe: (eventName: string, callback: (data: any) => void) => {
      console.log(`[EventBus] Subscribe: ${eventName}`);
      // In the real implementation, this would integrate with the actual event system
      return () => console.log(`[EventBus] Unsubscribe: ${eventName}`);
    },
    unsubscribe: (eventName: string, callback: (data: any) => void) => {
      console.log(`[EventBus] Unsubscribe: ${eventName}`);
      // In the real implementation, this would integrate with the actual event system
    }
  };

  // Create plugin registry placeholder - this would connect to the actual registry
  const pluginRegistry = {
    has: (appId: string) => {
      // For now, support basic apps that we know exist
      const knownApps = ['notepad', 'calculator', 'browser', 'file-explorer'];
      return knownApps.includes(appId);
    },
    get: (appId: string) => {
      const appNames: Record<string, string> = {
        notepad: 'Notepad',
        calculator: 'Calculator',
        browser: 'Browser',
        'file-explorer': 'File Explorer'
      };
      return {
        name: appNames[appId] || appId,
        manifest: { name: appNames[appId] || appId }
      };
    }
  };

  // Create toast provider using sonner
  const toastProvider = {
    toast: (config: any) => {
      const { title, description, variant = 'default', duration = 5000 } = config;

      if (variant === 'destructive') {
        toast.error(title, { description, duration });
      } else {
        toast.success(title, { description, duration });
      }
    }
  };

  // Create dialog provider placeholder - this would integrate with the actual dialog system
  const dialogProvider = {
    showDialog: async (config: any) => {
      const { title, message, type = 'confirm' } = config;

      switch (type) {
        case 'alert':
          alert(`${title}\n\n${message}`);
          return true;
        case 'confirm':
          return confirm(`${title}\n\n${message}`);
        case 'prompt':
          const result = prompt(`${title}\n\n${message}`);
          return result !== null ? result : '';
        default:
          return confirm(`${title}\n\n${message}`);
      }
    }
  };

  return (
    <SystemApiProvider
      apiClient={hostApiClient}
      eventBus={eventBus}
      windowStore={windowStore}
      pluginRegistry={pluginRegistry}
      toastProvider={toastProvider}
      dialogProvider={dialogProvider}
    >
      {children}
    </SystemApiProvider>
  );
};