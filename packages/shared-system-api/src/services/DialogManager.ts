import { DialogManager as IDialogManager, DialogConfig } from '../types';

export class DialogManager implements IDialogManager {
  private openDialogs: Map<string, any> = new Map();
  private dialogProvider: any; // Will be injected from host

  constructor(
    private eventBus: any,
    dialogProvider?: any
  ) {
    this.dialogProvider = dialogProvider;
  }

  async show(config: DialogConfig): Promise<boolean | string> {
    const {
      title,
      message,
      type = 'confirm',
      confirmText = 'OK',
      cancelText = 'Cancel',
      defaultValue = ''
    } = config;

    const dialogId = `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      let result: boolean | string;

      if (this.dialogProvider?.showDialog) {
        // Use injected dialog provider
        result = await this.dialogProvider.showDialog({
          id: dialogId,
          title,
          message,
          type,
          confirmText,
          cancelText,
          defaultValue
        });
      } else {
        // Fallback: use browser native dialogs or emit events
        result = await this.showFallbackDialog({
          dialogId,
          title,
          message,
          type,
          confirmText,
          cancelText,
          defaultValue
        });
      }

      // Emit success event
      this.eventBus?.emit('dialog.closed', {
        dialogId,
        type,
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      // Emit error event
      this.eventBus?.emit('dialog.error', {
        dialogId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      // Remove from open dialogs
      this.openDialogs.delete(dialogId);
    }
  }

  private async showFallbackDialog(config: {
    dialogId: string;
    title: string;
    message: string;
    type: string;
    confirmText: string;
    cancelText: string;
    defaultValue: string;
  }): Promise<boolean | string> {
    const { dialogId, title, message, type, defaultValue } = config;

    // Track open dialog
    this.openDialogs.set(dialogId, { ...config, timestamp: Date.now() });

    // Emit dialog show event
    this.eventBus?.emit('dialog.show', config);

    switch (type) {
      case 'alert':
        // Use browser alert
        alert(`${title}\n\n${message}`);
        return true;

      case 'confirm':
        // Use browser confirm
        return confirm(`${title}\n\n${message}`);

      case 'prompt':
        // Use browser prompt
        const result = prompt(`${title}\n\n${message}`, defaultValue);
        return result !== null ? result : '';

      default:
        // For custom types, emit event and wait for response
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Dialog timeout'));
          }, 30000); // 30 second timeout

          const handleResponse = (data: { dialogId: string; result: boolean | string }) => {
            if (data.dialogId === dialogId) {
              clearTimeout(timeout);
              this.eventBus?.unsubscribe('dialog.response', handleResponse);
              resolve(data.result);
            }
          };

          this.eventBus?.subscribe('dialog.response', handleResponse);
        });
    }
  }

  close(dialogId?: string): void {
    if (dialogId) {
      // Close specific dialog
      if (this.openDialogs.has(dialogId)) {
        this.openDialogs.delete(dialogId);
        this.eventBus?.emit('dialog.force_close', { dialogId });
      }
    } else {
      // Close all dialogs
      const dialogIds = Array.from(this.openDialogs.keys());
      this.openDialogs.clear();
      dialogIds.forEach(id => {
        this.eventBus?.emit('dialog.force_close', { dialogId: id });
      });
    }
  }

  isOpen(): boolean {
    return this.openDialogs.size > 0;
  }

  // Helper methods
  getOpenDialogs(): string[] {
    return Array.from(this.openDialogs.keys());
  }

  getDialogInfo(dialogId: string): any {
    return this.openDialogs.get(dialogId);
  }

  // Injection methods for host integration
  setDialogProvider(dialogProvider: any): void {
    this.dialogProvider = dialogProvider;
  }
}