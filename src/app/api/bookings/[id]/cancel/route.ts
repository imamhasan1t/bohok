// Route: POST /api/bookings/[id]/cancel

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerBookingService } from '@/lib/server/booking/bookingService';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reasonBn = body.reasonBn?.trim() || 'ব্যক্তিগত অসুবিধা';

    const cancelled = ServerBookingService.cancelBooking(id, auth.user.id, reasonBn);
    return successResponse(cancelled);
  } catch (err) {
    return errorResponse(err);
  }
}
