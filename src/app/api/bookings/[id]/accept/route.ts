// Route: POST /api/bookings/[id]/accept

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { serverDb } from '@/lib/server/db/memoryDb';
import { ServerBookingService } from '@/lib/server/booking/bookingService';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const booking = serverDb.bookings.get(id);
    if (!booking) throw AppErrors.notFound('Booking');

    const res = ServerBookingService.acceptBookingAtomic(booking.tripId, booking.parcelId, auth.user.id);
    return successResponse(res);
  } catch (err) {
    return errorResponse(err);
  }
}
