// Route: GET /api/trips/[id]

import { NextRequest } from 'next/server';
import { ServerTripService } from '@/lib/server/marketplace/tripService';
import { serverDb } from '@/lib/server/db/memoryDb';
import { PrivacySerializer } from '@/lib/server/privacy/serializers';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = ServerTripService.getTripById(id);
    if (!trip) throw AppErrors.notFound('Trip');

    const user = serverDb.users.get(trip.travellerId);
    const profile = serverDb.userProfiles.get(trip.travellerId);
    const travellerProfile = serverDb.travellerProfiles.get(trip.travellerId);

    return successResponse({
      ...trip,
      traveller: user && profile
        ? PrivacySerializer.serializePublicTraveller(user, profile, travellerProfile, trip)
        : null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
