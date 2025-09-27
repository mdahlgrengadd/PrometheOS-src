type EventCallback = (...args: unknown[]) => void;

/**
 * Simple event bus implementation for decoupled communication
 * between plugins and the core system
 */
class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  // Track all known event names (subscribed, emitted, or manually registered)
  private knownEvents: Set<string> = new Set();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe(event: string, callback: EventCallback): () => void {
    // Register the event name
    this.knownEvents.add(event);
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
  emit(event: string, ...args: unknown[]): void {
    // Register the event name
    this.knownEvents.add(event);
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
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
    this.knownEvents.clear();
  }

  /**
   * Manually register an event name (before subscription or emission)
   * @param event Event name to register
   */
  registerEvent(event: string): void {
    this.knownEvents.add(event);
  }

  /**
   * Unregister a previously registered event name
   * @param event Event name to remove
   */
  unregisterEvent(event: string): void {
    this.knownEvents.delete(event);
  }

  /**
   * Get a list of all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.knownEvents);
  }
}

// Export singleton instance
export const eventBus = new EventBus();
