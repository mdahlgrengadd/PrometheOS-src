// Stub EventBus for Module Federation compatibility

export class EventBus {
  private listeners: Map<string, Function[]> = new Map();

  emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.warn('[EventBus] Error in event listener:', error);
        }
      });
    }
  }

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  subscribe(event: string, listener: Function) {
    this.on(event, listener);
    // Return unsubscribe function
    return () => this.off(event, listener);
  }
}

export const eventBus = new EventBus();