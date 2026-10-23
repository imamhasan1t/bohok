// BOHOK Phase 8 — Server Trip Management Service
// Handles nationwide trip publishing, capacity checks, and corridor queries

import { serverDb } from '../db/memoryDb';
import { DbTrip } from '../db/dbTypes';
import { ServerValidator } from '../validation/validator';
import { AuditLogger } from '../audit/auditLogger';

export interface CreateTripDto {
  originCity: string;
  originArea: string;
  destinationCity: string;
  destinationArea: string;
  departureAt: string;
  estimatedArrivalAt: string;
  travelMode: DbTrip['travelMode'];
  vehicleModeBn: string;
  totalCapacityKg: number;
  pickupPreference?: DbTrip['pickupPreference'];
  pickupPreferenceBn?: string;
}

export const ServerTripService = {
  createTrip(travellerId: string, dto: CreateTripDto): DbTrip {
    const totalCapacityKg = ServerValidator.validateCapacity(dto.totalCapacityKg);
    const originCity = ServerValidator.validateRequiredString(dto.originCity, 'originCity', 'প্রস্থান শহর');
    const destinationCity = ServerValidator.validateRequiredString(dto.destinationCity, 'destinationCity', 'গন্তব্য শহর');

    const trip = serverDb.insertTrip({
      travellerId,
      originCity,
      originArea: dto.originArea || `${originCity} টার্মিনাল`,
      destinationCity,
      destinationArea: dto.destinationArea || `${destinationCity} পয়েন্ট`,
      departureAt: dto.departureAt || new Date(Date.now() + 2 * 3600000).toISOString(),
      estimatedArrivalAt: dto.estimatedArrivalAt || new Date(Date.now() + 5 * 3600000).toISOString(),
      travelMode: dto.travelMode || 'bus',
      vehicleModeBn: dto.vehicleModeBn || 'বাস',
      totalCapacityKg,
      pickupPreference: dto.pickupPreference || 'near_me',
      pickupPreferenceBn: dto.pickupPreferenceBn || 'আমার আশেপাশে',
      status: 'PUBLISHED',
    });

    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'trip',
      entityId: trip.id,
      eventType: 'BOOKING_CREATED', // Trip published event
      metadata: { route: `${originCity} -> ${destinationCity}`, capacity: totalCapacityKg },
    });

    return trip;
  },

  getTripById(tripId: string): DbTrip | null {
    return serverDb.trips.get(tripId) || null;
  },

  getAllPublishedTrips(): DbTrip[] {
    const trips: DbTrip[] = [];
    for (const t of serverDb.trips.values()) {
      if (t.status === 'PUBLISHED') trips.push(t);
    }
    return trips;
  },

  getTripsByTraveller(travellerId: string): DbTrip[] {
    const trips: DbTrip[] = [];
    for (const t of serverDb.trips.values()) {
      if (t.travellerId === travellerId) trips.push(t);
    }
    return trips;
  },
};
