// Route: POST /api/bookings/[id]/dispute

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerDisputeService } from '@/lib/server/booking/disputeService';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const dispute = ServerDisputeService.raiseDispute(id, auth.user.id, {
      category: body.category || 'other',
      description: body.description || '',
    });

    return successResponse({
      dispute,
      messageBn: 'বিরোধ অভিযোগ সফলভাবে নথিভুক্ত হয়েছে। সাপোর্ট টিম আগামী ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
