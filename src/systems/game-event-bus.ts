/**
 * @file src/systems/game-event-bus.ts
 * @description Central event coordination system for unified cross-system communication
 */

export type GameEventType =
  // Deal events
  | 'deal_proposed'
  | 'deal_accepted'
  | 'deal_declined'
  | 'deal_fulfilled'
  | 'deal_broken'
  | 'deal_expired'
  // Relationship events
  | 'relationship_changed'
  | 'relationship_milestone'
  | 'trust_changed'
  // Alliance events
  | 'alliance_formed'
  | 'alliance_broken'
  | 'member_added'
  | 'member_removed'
  // Game action events
  | 'nomination_made'
  | 'veto_used'
  | 'vote_cast'
  | 'eviction'
  | 'hoh_won'
  | 'pov_won'
  // Social events
  | 'conversation'
  | 'promise_made'
  | 'promise_kept'
  | 'promise_broken';

export interface GameBusEvent {
  type: GameEventType;
  timestamp: number;
  week: number;
  involvedIds: string[];
  data: Record<string, any>;
}

type EventCallback = (event: GameBusEvent) => void;

/**
 * Central event bus for game-wide event coordination
 * Allows subsystems to communicate without direct dependencies
 */
export class GameEventBus {
  private listeners: Map<GameEventType, EventCallback[]> = new Map();
  private allListeners: EventCallback[] = [];
  private eventHistory: GameBusEvent[] = [];
  private maxHistorySize: number = 100;

  /**
   * Emit an event to all subscribers
   */
  emit(event: GameBusEvent): void {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify type-specific listeners
    const typeListeners = this.listeners.get(event.type) || [];
    typeListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Event bus error for ${event.type}:`, error);
      }
    });

    // Notify all-event listeners
    this.allListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Event bus error (global listener):', error);
      }
    });
  }

  /**
   * Subscribe to a specific event type
   * Returns unsubscribe function
   */
  subscribe(type: GameEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to multiple event types at once
   */
  subscribeMultiple(types: GameEventType[], callback: EventCallback): () => void {
    const unsubscribes = types.map(type => this.subscribe(type, callback));
    return () => unsubscribes.forEach(unsub => unsub());
  }

  /**
   * Subscribe to all events
   * Returns unsubscribe function
   */
  subscribeAll(callback: EventCallback): () => void {
    this.allListeners.push(callback);
    return () => {
      const index = this.allListeners.indexOf(callback);
      if (index > -1) {
        this.allListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get recent events of a specific type
   */
  getRecentEvents(type?: GameEventType, limit: number = 20): GameBusEvent[] {
    let events = type 
      ? this.eventHistory.filter(e => e.type === type)
      : this.eventHistory;
    
    return events.slice(-limit);
  }

  /**
   * Get events involving specific houseguests
   */
  getEventsInvolving(houseguestIds: string[], limit: number = 20): GameBusEvent[] {
    return this.eventHistory
      .filter(e => e.involvedIds.some(id => houseguestIds.includes(id)))
      .slice(-limit);
  }

  /**
   * Clear all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.allListeners = [];
    this.eventHistory = [];
  }

  /**
   * Helper to create a properly typed event
   */
  static createEvent(
    type: GameEventType,
    week: number,
    involvedIds: string[],
    data: Record<string, any> = {}
  ): GameBusEvent {
    return {
      type,
      timestamp: Date.now(),
      week,
      involvedIds,
      data
    };
  }
}

// Singleton instance for global access
export const gameEventBus = new GameEventBus();
