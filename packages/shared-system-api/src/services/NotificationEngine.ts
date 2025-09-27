import { NotificationEngine as INotificationEngine, NotificationConfig } from '../types';

export class NotificationEngine implements INotificationEngine {
  private defaultEngine: string = 'toast';
  private supportedEngines: string[] = ['toast', 'native', 'system'];
  private toastProvider: any; // Will be injected from host

  constructor(
    private eventBus: any,
    toastProvider?: any
  ) {
    this.toastProvider = toastProvider;
  }

  async send(config: NotificationConfig): Promise<void> {
    // Normalize config
    const finalConfig = typeof config === 'string'
      ? { message: config }
      : config;

    const {
      message,
      engine = this.defaultEngine,
      type = 'info',
      duration = 5000,
      persistent = false
    } = finalConfig;

    try {
      switch (engine) {
        case 'toast':
          await this.sendToastNotification({ message, type, duration, persistent });
          break;

        case 'native':
          await this.sendNativeNotification({ message, type });
          break;

        case 'system':
          await this.sendSystemNotification({ message, type });
          break;

        default:
          throw new Error(`Unsupported notification engine: ${engine}`);
      }

      // Emit success event
      this.eventBus?.emit('notification.sent', {
        engine,
        message,
        type,
        timestamp: Date.now()
      });
    } catch (error) {
      // Emit error event
      this.eventBus?.emit('notification.error', {
        engine,
        message,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async sendToastNotification(config: {
    message: string;
    type: string;
    duration: number;
    persistent: boolean;
  }): Promise<void> {
    const { message, type, duration, persistent } = config;

    if (this.toastProvider?.toast) {
      // Use injected toast provider
      this.toastProvider.toast({
        title: this.getTypeTitle(type),
        description: message,
        duration: persistent ? Infinity : duration,
        variant: this.mapTypeToVariant(type)
      });
    } else {
      // Fallback: emit toast event
      this.eventBus?.emit('toast.show', {
        message,
        type,
        duration: persistent ? null : duration
      });
    }
  }

  private async sendNativeNotification(config: {
    message: string;
    type: string;
  }): Promise<void> {
    const { message, type } = config;

    // Check if native notifications are supported
    if (!('Notification' in window)) {
      throw new Error('Native notifications not supported');
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    if (Notification.permission === 'granted') {
      new Notification(`PrometheOS - ${this.getTypeTitle(type)}`, {
        body: message,
        icon: this.getTypeIcon(type),
        tag: 'prometheos-notification'
      });
    } else {
      throw new Error('Notification permission not granted');
    }
  }

  private async sendSystemNotification(config: {
    message: string;
    type: string;
  }): Promise<void> {
    const { message, type } = config;

    // Emit system notification event
    this.eventBus?.emit('system.notification', {
      message,
      type,
      timestamp: Date.now()
    });
  }

  getSupportedEngines(): string[] {
    return [...this.supportedEngines];
  }

  setDefaultEngine(engine: string): void {
    if (!this.supportedEngines.includes(engine)) {
      throw new Error(`Unsupported engine: ${engine}`);
    }
    this.defaultEngine = engine;
  }

  // Helper methods
  private getTypeTitle(type: string): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'info':
      default:
        return 'Information';
    }
  }

  private mapTypeToVariant(type: string): string {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'warning':
        return 'default';
      case 'info':
      default:
        return 'default';
    }
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  // Injection methods for host integration
  setToastProvider(toastProvider: any): void {
    this.toastProvider = toastProvider;
  }
}