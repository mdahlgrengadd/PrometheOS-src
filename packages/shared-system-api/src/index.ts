// Main exports
export { default as SystemApiProvider } from './SystemApiProvider';
export {
  SystemApiProvider as SystemApiProviderNamed,
  useSystemApi,
  useAppLauncher,
  useNotificationEngine,
  useDialogManager,
  useEventWaiter
} from './SystemApiProvider';

// Component definition
export { systemApiComponent } from './systemActions';

// Service classes
export { AppLauncher } from './services/AppLauncher';
export { NotificationEngine } from './services/NotificationEngine';
export { DialogManager } from './services/DialogManager';
export { EventWaiter } from './services/EventWaiter';

// Type definitions
export type {
  SystemApiContextType,
  AppLauncher as IAppLauncher,
  NotificationEngine as INotificationEngine,
  DialogManager as IDialogManager,
  EventWaiter as IEventWaiter,
  DialogConfig,
  NotificationConfig,
  EventWaitConfig,
  AppLaunchConfig,
  OpenAppParams,
  KillAppParams,
  NotifyParams,
  DialogParams,
  WaitForEventParams,
  ListEventsParams
} from './types';

// Re-export shared types for convenience
export type { IApiComponent, IApiAction, IApiParameter } from '@shared/api-client';