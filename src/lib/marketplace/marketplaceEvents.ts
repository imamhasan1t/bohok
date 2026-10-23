// BOHOK Phase 5.5 — Marketplace Event Log & Notification Model
// In-memory event stream ready for future WebSocket/SSE and push notification backends

import { MarketplaceEvent, MarketplaceEventType } from './marketplaceTypes';

export type EventSubscriber = (event: MarketplaceEvent) => void;

export class MarketplaceEventStream {
  private events: MarketplaceEvent[] = [];
  private subscribers: Set<EventSubscriber> = new Set();

  public emit(
    type: MarketplaceEventType,
    entityId: string,
    descriptionBn: string,
    payload: Record<string, unknown> = {}
  ): MarketplaceEvent {
    const event: MarketplaceEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      entityId,
      timestamp: new Date().toISOString(),
      payload,
      descriptionBn,
    };

    this.events.push(event);
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(event);
      } catch (err) {
        console.error('Subscriber error handling marketplace event:', err);
      }
    });

    return event;
  }

  public subscribe(subscriber: EventSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public getEvents(): readonly MarketplaceEvent[] {
    return [...this.events];
  }

  public getEventsForEntity(entityId: string): MarketplaceEvent[] {
    return this.events.filter((e) => e.entityId === entityId);
  }

  public clear(): void {
    this.events = [];
  }
}

// Global singleton event stream for mock/prototype session
export const marketplaceEvents = new MarketplaceEventStream();
