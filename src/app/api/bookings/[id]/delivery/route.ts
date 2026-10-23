// Route: POST /api/bookings/[id]/delivery

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerDeliveryService } from '@/lib/server/booking/deliveryService';
import { ServerValidator } from '@/lib/server/validation/validator';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const otp = ServerValidator.validateOtp(body.otp);
    const notes = body.notes?.trim();

    const updatedBooking = ServerDeliveryService.verifyDeliveryAtomic(
      id,
      auth.user.id,
      otp,
      notes
    );

    return successResponse({
      booking: updatedBooking,
      messageBn: '২য় ওটিপি কোড সফলভাবে যাচাই হয়েছে। পার্সেল ডেলিভারি সম্পন্ন ও ভাড়া পরিশোধিত।',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
