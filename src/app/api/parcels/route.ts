// Route: GET /api/parcels, POST /api/parcels

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerParcelService } from '@/lib/server/marketplace/parcelService';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const parcels = ServerParcelService.getParcelsBySender(auth.user.id);
    return successResponse(parcels);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json().catch(() => ({}));

    const parcel = ServerParcelService.createParcel(auth.user.id, body);
    return successResponse(parcel, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
