import React from 'react';
import { SystemApiProvider } from '@shared/system-api';
import { useWindowStore } from '../store/windowStore';
import { toast } from 'sonner';
import { useApi } from './ApiProvider';
import { eventBus } from '../plugins/EventBus';
import type {
  IApiClient,
  IApiComponent,
  IActionResult,
  MCPRequest,
  MCPResponse,
} from '@shared/api-client';
import type { IApiComponent as HostApiComponent } from '../types/api';

interface SystemApiIntegrationProps {
  children: React.ReactNode;
}

export const SystemApiIntegration: React.FC<SystemApiIntegrationProps> = ({ children }) => {
  // Get window store for app launcher integration
  const windowStore = useWindowStore();
  const api = useApi();

  // Real host API client adapter that forwards to the host ApiProvider and shared event bus
  const hostApiClient: IApiClient = {
    async executeAction(
      componentId: string,
      actionId: string,
      parameters?: Record<string, unknown>
    ): Promise<IActionResult> {
      return api.executeAction(componentId, actionId, parameters);
    },
    async registerComponent(component: IApiComponent): Promise<void> {
      api.registerComponent(component as unknown as HostApiComponent);
    },
    async unregisterComponent(componentId: string): Promise<void> {
      api.unregisterComponent(componentId);
    },
    async getComponents(): Promise<IApiComponent[]> {
      return api.getComponents() as unknown as IApiComponent[];
    },
    async subscribeEvent(
      eventName: string,
      callback: (data: unknown) => void
    ): Promise<() => void> {
      return eventBus.subscribe(eventName, callback);
    },
    async emitEvent(eventName: string, data?: unknown): Promise<void> {
      eventBus.emit(eventName, data);
    },
    async getEventNames(): Promise<string[]> {
      return [];
    },
    async sendMCPMessage(message: MCPRequest): Promise<MCPResponse> {
      return { jsonrpc: '2.0', id: message?.id ?? null, result: {} };
    },
  };

  // Create event bus placeholder - in a real implementation this would connect to the actual event bus
  // Use the shared event bus imported above

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
  type ToastConfig = {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  };
  const toastProvider = {
    toast: (config: ToastConfig) => {
      const { title, description, variant = 'default', duration = 5000 } = config;

      if (variant === 'destructive') {
        toast.error(title, { description, duration });
      } else {
        toast.success(title, { description, duration });
      }
    }
  };

  // Create dialog provider placeholder - this would integrate with the actual dialog system
  type BasicDialogConfig = { title: string; message: string; type?: 'confirm' | 'alert' | 'prompt' };
  const dialogProvider = {
    showDialog: async (config: BasicDialogConfig) => {
      const { title, message, type = 'confirm' } = config;

      switch (type) {
        case 'alert': {
          alert(`${title}\n\n${message}`);
          return true;
        }
        case 'confirm': {
          return confirm(`${title}\n\n${message}`);
        }
        case 'prompt': {
          const result = prompt(`${title}\n\n${message}`);
          return result !== null ? result : '';
        }
        default: {
          return confirm(`${title}\n\n${message}`);
        }
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