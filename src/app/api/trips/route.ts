// Route: GET /api/trips, POST /api/trips

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerTripService } from '@/lib/server/marketplace/tripService';
import { serverDb } from '@/lib/server/db/memoryDb';
import { PrivacySerializer } from '@/lib/server/privacy/serializers';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET() {
  try {
    const rawTrips = ServerTripService.getAllPublishedTrips();

    const sanitized = rawTrips.map((trip) => {
      const user = serverDb.users.get(trip.travellerId);
      const profile = serverDb.userProfiles.get(trip.travellerId);
      const travellerProfile = serverDb.travellerProfiles.get(trip.travellerId);

      return {
        ...trip,
        traveller: user && profile
          ? PrivacySerializer.serializePublicTraveller(user, profile, travellerProfile, trip)
          : null,
      };
    });

    return successResponse(sanitized);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json().catch(() => ({}));

    const trip = ServerTripService.createTrip(auth.user.id, body);
    return successResponse(trip, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
