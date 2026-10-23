// BOHOK Phase 9 — Real-Time Server-Sent Events (SSE) Bus
// Manages real-time lifecycle event dispatching for active bookings, trips, and parcels

export type RealtimeEventType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'PAYMENT_HELD'
  | 'JOURNEY_STARTED'
  | 'PARCEL_PICKED_UP'
  | 'IN_TRANSIT'
  | 'APPROACHING_DESTINATION'
  | 'DELIVERY_COMPLETED'
  | 'PAYMENT_RELEASED'
  | 'RATING_SUBMITTED'
  | 'DISPUTE_RAISED';

export interface RealtimeBookingEvent {
  id: string;
  type: RealtimeEventType;
  bookingId: string;
  userId?: string;
  timestamp: string;
  titleBn: string;
  messageBn: string;
  data: Record<string, unknown>;
}

export type RealtimeListener = (event: RealtimeBookingEvent) => void;

export class RealtimeEventBus {
  private listeners = new Set<RealtimeListener>();
  private bookingListeners = new Map<string, Set<RealtimeListener>>();
  private recentEvents: RealtimeBookingEvent[] = [];

  /**
   * Subscribe to real-time events
   */
  public subscribe(bookingId: string | undefined, listener: RealtimeListener): () => void {
    if (bookingId) {
      if (!this.bookingListeners.has(bookingId)) {
        this.bookingListeners.set(bookingId, new Set());
      }
      this.bookingListeners.get(bookingId)!.add(listener);

      return () => {
        this.bookingListeners.get(bookingId)?.delete(listener);
        if (this.bookingListeners.get(bookingId)?.size === 0) {
          this.bookingListeners.delete(bookingId);
        }
      };
    }

    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Publish an event to active subscribers
   */
  public publish(event: Omit<RealtimeBookingEvent, 'id' | 'timestamp'>): RealtimeBookingEvent {
    const fullEvent: RealtimeBookingEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    // Store recent history for fast catch-up (capped at 50 events)
    this.recentEvents.push(fullEvent);
    if (this.recentEvents.length > 50) {
      this.recentEvents.shift();
    }

    // Notify general listeners
    for (const listener of this.listeners) {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    }

    // Notify booking-specific listeners
    const specific = this.bookingListeners.get(event.bookingId);
    if (specific) {
      for (const listener of specific) {
        try {
          listener(fullEvent);
        } catch (err) {
          console.error('Error in booking realtime listener:', err);
        }
      }
    }

    return fullEvent;
  }

  public getRecentEvents(bookingId?: string): RealtimeBookingEvent[] {
    if (bookingId) {
      return this.recentEvents.filter((e) => e.bookingId === bookingId);
    }
    return [...this.recentEvents];
  }

  public clear(): void {
    this.listeners.clear();
    this.bookingListeners.clear();
    this.recentEvents = [];
  }
}

export const serverRealtimeBus = new RealtimeEventBus();
