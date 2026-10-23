// BOHOK Phase 9 — Server-Sent Events (SSE) Streaming API Handler
// Route: GET /api/realtime?bookingId=...

import { NextRequest } from 'next/server';
import { serverRealtimeBus, RealtimeBookingEvent } from '@/lib/server/realtime/realtimeBus';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bookingId = searchParams.get('bookingId') || undefined;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to enqueue SSE message
      const sendEvent = (event: RealtimeBookingEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream might be closed
        }
      };

      // 1. Send initial handshake connection event
      const handshake: RealtimeBookingEvent = {
        id: `hs_${Date.now()}`,
        type: 'IN_TRANSIT',
        bookingId: bookingId || 'system',
        timestamp: new Date().toISOString(),
        titleBn: 'রিয়েল-টাইম সংযোগ স্থাপিত',
        messageBn: 'রিয়েল-টাইম ইভেন্ট ব্রডকাস্টারে সফলভাবে সংযুক্ত।',
        data: { connected: true, bookingId },
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(handshake)}\n\n`));

      // 2. Subscribe to event bus
      const unsubscribe = serverRealtimeBus.subscribe(bookingId, (event) => {
        sendEvent(event);
      });

      // 3. Heartbeat interval every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Clean up on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
