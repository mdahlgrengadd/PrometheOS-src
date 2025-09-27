import { EventWaiter as IEventWaiter, EventWaitConfig } from '../types';

interface PendingEvent {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
  once: boolean;
}

export class EventWaiter implements IEventWaiter {
  private pendingEvents: Map<string, PendingEvent[]> = new Map();
  private availableEvents: Set<string> = new Set();

  constructor(private eventBus: any) {
    this.initializeAvailableEvents();
  }

  async waitFor(config: EventWaitConfig): Promise<any> {
    const finalConfig = typeof config === 'string'
      ? { eventName: config }
      : config;

    const {
      eventName,
      timeout = 30000, // 30 second default timeout
      once = true
    } = finalConfig;

    return new Promise((resolve, reject) => {
      // Create pending event entry
      const pendingEvent: PendingEvent = {
        resolve,
        reject,
        once
      };

      // Set up timeout if specified
      if (timeout > 0) {
        pendingEvent.timeout = setTimeout(() => {
          this.cancelEventWait(eventName, pendingEvent);
          reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, timeout);
      }

      // Add to pending events
      if (!this.pendingEvents.has(eventName)) {
        this.pendingEvents.set(eventName, []);
      }
      this.pendingEvents.get(eventName)!.push(pendingEvent);

      // Subscribe to event if this is the first waiter
      if (this.pendingEvents.get(eventName)!.length === 1) {
        this.eventBus?.subscribe(eventName, this.createEventHandler(eventName));
      }

      // Add to available events
      this.availableEvents.add(eventName);

      // Emit event that someone is waiting
      this.eventBus?.emit('event.waiting', {
        eventName,
        waitersCount: this.pendingEvents.get(eventName)!.length,
        timeout,
        once
      });
    });
  }

  private createEventHandler(eventName: string) {
    return (data: any) => {
      const pendingList = this.pendingEvents.get(eventName);
      if (!pendingList || pendingList.length === 0) {
        return;
      }

      // Process all pending events for this event name
      const toRemove: PendingEvent[] = [];

      pendingList.forEach(pendingEvent => {
        // Clear timeout
        if (pendingEvent.timeout) {
          clearTimeout(pendingEvent.timeout);
        }

        // Resolve the promise
        pendingEvent.resolve(data);

        // Mark for removal if it's a one-time event
        if (pendingEvent.once) {
          toRemove.push(pendingEvent);
        }
      });

      // Remove one-time events
      toRemove.forEach(eventToRemove => {
        const index = pendingList.indexOf(eventToRemove);
        if (index > -1) {
          pendingList.splice(index, 1);
        }
      });

      // If no more waiters, unsubscribe
      if (pendingList.length === 0) {
        this.eventBus?.unsubscribe(eventName, this.createEventHandler(eventName));
        this.pendingEvents.delete(eventName);
      }

      // Emit event that waiting was resolved
      this.eventBus?.emit('event.waited', {
        eventName,
        data,
        resolvedCount: toRemove.length,
        remainingWaiters: pendingList.length
      });
    };
  }

  cancel(eventName: string): void {
    const pendingList = this.pendingEvents.get(eventName);
    if (!pendingList) {
      return;
    }

    // Cancel all pending events for this event name
    pendingList.forEach(pendingEvent => {
      this.cancelEventWait(eventName, pendingEvent);
      pendingEvent.reject(new Error(`Event wait cancelled: ${eventName}`));
    });

    // Clean up
    this.eventBus?.unsubscribe(eventName, this.createEventHandler(eventName));
    this.pendingEvents.delete(eventName);

    // Emit cancellation event
    this.eventBus?.emit('event.wait.cancelled', {
      eventName,
      cancelledCount: pendingList.length
    });
  }

  private cancelEventWait(eventName: string, pendingEvent: PendingEvent): void {
    if (pendingEvent.timeout) {
      clearTimeout(pendingEvent.timeout);
    }

    const pendingList = this.pendingEvents.get(eventName);
    if (pendingList) {
      const index = pendingList.indexOf(pendingEvent);
      if (index > -1) {
        pendingList.splice(index, 1);
      }
    }
  }

  listWaiting(): string[] {
    return Array.from(this.pendingEvents.keys());
  }

  listAvailable(): string[] {
    return Array.from(this.availableEvents);
  }

  // Get detailed waiting information
  getWaitingInfo(): Record<string, { count: number; events: any[] }> {
    const info: Record<string, { count: number; events: any[] }> = {};

    this.pendingEvents.forEach((pendingList, eventName) => {
      info[eventName] = {
        count: pendingList.length,
        events: pendingList.map(pe => ({
          once: pe.once,
          hasTimeout: !!pe.timeout
        }))
      };
    });

    return info;
  }

  private initializeAvailableEvents(): void {
    // Initialize with common system events
    const commonEvents = [
      'app.launched',
      'app.killed',
      'window.created',
      'window.closed',
      'window.focused',
      'window.minimized',
      'window.maximized',
      'notification.sent',
      'dialog.opened',
      'dialog.closed',
      'theme.changed',
      'user.action',
      'system.ready',
      'plugin.loaded',
      'plugin.unloaded'
    ];

    commonEvents.forEach(event => {
      this.availableEvents.add(event);
    });

    // Listen for new events being emitted to update available list
    if (this.eventBus?.onAnyEvent) {
      this.eventBus.onAnyEvent((eventName: string) => {
        this.availableEvents.add(eventName);
      });
    }
  }
}