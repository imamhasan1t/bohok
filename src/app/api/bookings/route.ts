// Route: GET /api/bookings, POST /api/bookings

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { serverDb } from '@/lib/server/db/memoryDb';
import { ServerBookingService } from '@/lib/server/booking/bookingService';
import { PrivacySerializer } from '@/lib/server/privacy/serializers';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const bookings: unknown[] = [];

    for (const b of serverDb.bookings.values()) {
      if (b.senderId === auth.user.id || b.travellerId === auth.user.id) {
        const parcel = serverDb.parcels.get(b.parcelId);
        const trip = serverDb.trips.get(b.tripId);
        const senderUser = serverDb.users.get(b.senderId);
        const senderProfile = serverDb.userProfiles.get(b.senderId);
        const travellerUser = serverDb.users.get(b.travellerId);
        const travellerProfile = serverDb.userProfiles.get(b.travellerId);

        if (parcel && trip && senderUser && senderProfile && travellerUser && travellerProfile) {
          bookings.push(
            PrivacySerializer.serializePrivateBooking(
              b,
              parcel,
              trip,
              senderUser,
              senderProfile,
              travellerUser,
              travellerProfile,
              auth.user.id
            )
          );
        }
      }
    }

    return successResponse(bookings);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json().catch(() => ({}));
    const { tripId, parcelId } = body;

    if (!tripId || !parcelId) {
      throw AppErrors.validationError('body', 'tripId and parcelId are required', 'ট্রিপ এবং পার্সেল আইডি প্রদান আবশ্যক।');
    }

    const trip = serverDb.trips.get(tripId);
    if (!trip) throw AppErrors.notFound('Trip');

    // Atomic Booking Acceptance by Traveller
    const res = ServerBookingService.acceptBookingAtomic(tripId, parcelId, auth.user.id);
    return successResponse(res, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
