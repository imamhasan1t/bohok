// BOHOK Phase 7 — Corridor Tracking & Progress Types
// Privacy-preserving highway milestone tracking for peer-to-peer parcel movement

export interface CorridorCheckpoint {
  id: string;
  nameBn: string;
  distanceKm: number;
  cumulativeKm: number;
  targetPercent: number; // 0 to 100
  passed: boolean;
  passedAt?: string;
  estimatedArrivalBn: string;
  milestoneDescriptionBn: string;
}

export interface CorridorRoute {
  id: string;
  originBn: string;
  destinationBn: string;
  corridorNameBn: string;
  totalDistanceKm: number;
  estimatedStandardDurationMinutes: number;
  checkpoints: CorridorCheckpoint[];
}

export interface TrackingProgress {
  bookingId: string;
  corridorId: string;
  corridorNameBn: string;
  progressPercentage: number; // 0 to 100
  activeCheckpointIndex: number;
  activeCheckpointBn: string;
  maskedCurrentLocationBn: string;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  estimatedMinutesRemaining: number;
  etaBn: string;
  checkpoints: CorridorCheckpoint[];
  lastUpdatedAt: string;
  isSimulated: boolean;
  safetyNoteBn: string;
}

export interface TrackingProvider {
  getTracking(bookingId: string): Promise<TrackingProgress | null>;
  advanceTracking(bookingId: string): Promise<TrackingProgress>;
  resetTracking(bookingId: string): Promise<TrackingProgress>;
}
