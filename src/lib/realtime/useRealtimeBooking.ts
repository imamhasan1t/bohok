// BOHOK Phase 9 — Client-side Real-time Booking Hook with Polling Fallback
// Listens to Server-Sent Events (SSE) and gracefully degrades to HTTP polling when disconnected

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeBookingEvent } from '@/lib/server/realtime/realtimeBus';

export interface UseRealtimeBookingResult {
  latestEvent: RealtimeBookingEvent | null;
  eventsHistory: RealtimeBookingEvent[];
  connectionStatus: 'CONNECTING' | 'CONNECTED' | 'POLLING_FALLBACK' | 'ERROR';
  isLive: boolean;
  reconnect: () => void;
}

export function useRealtimeBooking(bookingId?: string): UseRealtimeBookingResult {
  const [latestEvent, setLatestEvent] = useState<RealtimeBookingEvent | null>(null);
  const [eventsHistory, setEventsHistory] = useState<RealtimeBookingEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'POLLING_FALLBACK' | 'ERROR'>('CONNECTING');

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) return;
    setConnectionStatus('POLLING_FALLBACK');

    if (!bookingId) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings?id=${bookingId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            // Synthesize polling update
            const pollEvt: RealtimeBookingEvent = {
              id: `poll_${Date.now()}`,
              type: 'IN_TRANSIT',
              bookingId,
              timestamp: new Date().toISOString(),
              titleBn: 'স্ট্যাটাস আপডেট (পোলিং)',
              messageBn: 'পোলিংয়ের মাধ্যমে সর্বশেষ স্ট্যাটাস আপডেট হয়েছে।',
              data: json.data,
            };
            setLatestEvent(pollEvt);
          }
        }
      } catch {
        // Ignore polling error
      }
    }, 5000);
  }, [bookingId]);

  const connectSSE = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setConnectionStatus('CONNECTING');

    const url = bookingId ? `/api/realtime?bookingId=${encodeURIComponent(bookingId)}` : '/api/realtime';

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionStatus('CONNECTED');
      };

      es.onmessage = (e) => {
        try {
          const parsed: RealtimeBookingEvent = JSON.parse(e.data);
          setLatestEvent(parsed);
          setEventsHistory((prev) => [parsed, ...prev.slice(0, 24)]);
        } catch {
          // Ignore parse errors (e.g. heartbeat)
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        startPollingFallback();
      };
    } catch {
      startPollingFallback();
    }
  }, [bookingId, startPollingFallback]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [connectSSE]);

  return {
    latestEvent,
    eventsHistory,
    connectionStatus,
    isLive: connectionStatus === 'CONNECTED',
    reconnect: connectSSE,
  };
}
