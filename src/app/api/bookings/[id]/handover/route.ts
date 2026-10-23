// Route: POST /api/bookings/[id]/handover

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerHandoverService } from '@/lib/server/booking/handoverService';
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
    const checklist = body.checklist || {};

    const updatedBooking = ServerHandoverService.verifyHandoverAtomic(
      id,
      auth.user.id,
      otp,
      checklist
    );

    return successResponse({
      booking: updatedBooking,
      messageBn: '১ম ওটিপি কোড সফলভাবে যাচাই হয়েছে। পার্সেল হস্তান্তর সম্পন্ন।',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
