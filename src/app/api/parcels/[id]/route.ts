// Route: GET /api/parcels/[id]

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerParcelService } from '@/lib/server/marketplace/parcelService';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const parcel = ServerParcelService.getParcelById(id);
    if (!parcel) throw AppErrors.notFound('Parcel');

    if (parcel.senderId !== auth.user.id) {
      throw AppErrors.forbidden();
    }

    return successResponse(parcel);
  } catch (err) {
    return errorResponse(err);
  }
}
