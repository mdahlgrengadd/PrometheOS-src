
type EventCallback = (...args: any[]) => void;

/**
 * Simple event bus implementation for decoupled communication
 * between plugins and the core system
 */
class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  
  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Emit an event with optional arguments
   * @param event Event name
   * @param args Arguments to pass to event handlers
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Clear all event listeners
   */
  clear(): void {
    this.events.clear();
  }
}

// Export singleton instance
export const eventBus = new EventBus();
