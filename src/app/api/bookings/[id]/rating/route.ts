// Route: POST /api/bookings/[id]/rating

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerRatingService } from '@/lib/server/booking/ratingService';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const rating = ServerRatingService.submitRating(id, auth.user.id, {
      score: body.score,
      careScore: body.careScore,
      speedScore: body.speedScore,
      communicationScore: body.communicationScore,
      comment: body.comment,
    });

    return successResponse({
      rating,
      messageBn: 'আপনার মতামত ও রেটিং সফলভাবে সংরক্ষিত হয়েছে।',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
