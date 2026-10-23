// Route: GET /api/matches/[parcelId]

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerParcelService } from '@/lib/server/marketplace/parcelService';
import { ServerTripService } from '@/lib/server/marketplace/tripService';
import { serverDb } from '@/lib/server/db/memoryDb';
import { calculateMatchScore } from '@/lib/matching/matchingEngine';
import { DEFAULT_MATCHING_WEIGHTS, ParcelMatchRequirement, TravellerTripMatchCandidate } from '@/lib/matching/matchingTypes';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parcelId: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    const { parcelId } = await params;
    const parcel = ServerParcelService.getParcelById(parcelId);
    if (!parcel) throw AppErrors.notFound('Parcel');

    if (parcel.senderId !== auth.user.id) {
      throw AppErrors.forbidden();
    }

    const requirement: ParcelMatchRequirement = {
      originId: parcel.originCity,
      destinationId: parcel.destinationCity,
      originCityBn: parcel.originCity,
      destinationCityBn: parcel.destinationCity,
      weightKg: parcel.weightKg,
      size: parcel.packageSize,
      urgency: parcel.urgency,
      pickupAreaBn: parcel.originArea,
    };

    const publishedTrips = ServerTripService.getAllPublishedTrips();
    const matches = publishedTrips
      .filter((t) => t.travellerId !== auth.user.id) // Sender cannot match their own trips
      .map((t) => {
        const candidate: TravellerTripMatchCandidate = {
          id: t.id,
          travellerId: t.travellerId,
          name: serverDb.userProfiles.get(t.travellerId)?.name || 'সহযাত্রী',
          avatarInitials: serverDb.userProfiles.get(t.travellerId)?.avatarInitials || 'স',
          isVerified: true,
          verificationBadgeText: 'যাচাইকৃত সহযাত্রী',
          rating: serverDb.travellerProfiles.get(t.travellerId)?.ratingAvg || 5.0,
          totalTripsCompleted: serverDb.travellerProfiles.get(t.travellerId)?.totalTripsCompleted || 0,
          originId: t.originCity,
          destinationId: t.destinationCity,
          originAreaBn: t.originArea,
          destinationAreaBn: t.destinationArea,
          departureDate: 'আজকে',
          departureTime: 'সকাল ০৮:০০',
          estimatedArrival: 'সকাল ১০:৩০',
          availableCapacityKg: t.remainingCapacityKg,
          travelMode: t.travelMode,
          vehicleModeBn: t.vehicleModeBn,
          approximateDistanceKm: 96,
          estimatedPrice: 180,
          allowedParcelTypes: ['documents', 'books', 'clothes', 'other_permitted'],
        };

        const result = calculateMatchScore(requirement, candidate, DEFAULT_MATCHING_WEIGHTS);
        return {
          tripId: t.id,
          score: result.totalScore,
          compatibilityLevel: result.compatibilityLevel,
          reasons: result.reasons,
          trip: t,
        };
      })
      .filter((m) => m.compatibilityLevel !== 'NO_MATCH')
      .sort((a, b) => b.score - a.score);

    return successResponse(matches);
  } catch (err) {
    return errorResponse(err);
  }
}
