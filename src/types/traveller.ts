// BOHOK Phase 4 — Traveller Journey & Two-Sided Marketplace Types

export type TravelMode = 'bus' | 'train' | 'car' | 'motorcycle' | 'other';

export type PickupPreference = 'near_me' | 'specific_area' | 'along_route';

export type TripStatus = 'draft' | 'active' | 'in_progress' | 'completed';

export type TravellerStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TravelModeOption {
  id: TravelMode;
  labelBn: string;
  subBn: string;
  iconName: string;
  allowedParcelTypesNote: string;
}

export interface PickupPreferenceOption {
  id: PickupPreference;
  labelBn: string;
  subBn: string;
  tagBn: string;
}

export interface ParcelRequestItem {
  id: string;
  routeId: string;
  originId: string;
  destinationId: string;
  senderName: string;
  senderRating: number;
  titleBn: string;
  categoryBn: string;
  weightKg: number;
  sizeLabelBn: string;
  pickupAreaBn: string;
  destinationAreaBn: string;
  pickupPreferenceLabelBn: string;
  estimatedEarning: number;
  urgencyLabelBn: string;
  itemDescriptionBn: string;
  status: 'pending' | 'accepted' | 'declined';
  pickupCoordinatesOffset?: { x: number; y: number };
}

export interface TravellerTripData {
  id: string;
  // Step 1: Route
  originId: string;
  destinationId: string;
  originCityBn: string;
  destinationCityBn: string;

  // Step 2: Journey Time
  departureDate: string;
  departureTime: string;
  estimatedArrival: string;

  // Step 3: Travel Mode
  travelMode: TravelMode;
  travelModeLabelBn: string;
  vehicleNameOptional?: string;

  // Step 4: Capacity
  capacityKg: number;
  capacitySize: 'small' | 'medium' | 'large';
  capacitySizeLabelBn: string;

  // Step 5: Pickup Preference
  pickupPreference: PickupPreference;
  pickupPreferenceLabelBn: string;
  preferredPickupAreaName: string;

  // Step 6 & 7: Status & Dashboard
  status: TripStatus;
  potentialEarningsEstimate: number;
  acceptedParcels: ParcelRequestItem[];
  createdAtBn: string;
}
