// BOHOK Phase 7 — Demo Highway Corridor Tracking Provider
// Privacy-first simulation that never leaks private GPS or residential coordinates

import { CorridorRoute, TrackingProgress, TrackingProvider } from './trackingTypes';
import { getCorridorForRoute } from './trackingCorridors';

export class DemoTrackingProvider implements TrackingProvider {
  private progressStore = new Map<string, TrackingProgress>();

  /**
   * Initializes or fetches progress for a booking along its corridor
   */
  public async getTracking(
    bookingId: string,
    originBn: string = 'ঢাকা',
    destinationBn: string = 'কুমিল্লা'
  ): Promise<TrackingProgress> {
    const existing = this.progressStore.get(bookingId);
    if (existing) {
      return existing;
    }

    const corridor = getCorridorForRoute(originBn, destinationBn);
    const initial = this.createInitialProgress(bookingId, corridor);
    this.progressStore.set(bookingId, initial);
    return initial;
  }

  /**
   * Advances the simulated movement to the next checkpoint along the highway
   */
  public async advanceTracking(bookingId: string): Promise<TrackingProgress> {
    const current = this.progressStore.get(bookingId);
    if (!current) {
      throw new Error(`Tracking for booking ${bookingId} not found`);
    }

    const nextIndex = Math.min(
      current.activeCheckpointIndex + 1,
      current.checkpoints.length - 1
    );

    const updatedCheckpoints = current.checkpoints.map((cp, idx) => ({
      ...cp,
      passed: idx <= nextIndex,
      passedAt: idx <= nextIndex ? cp.passedAt || new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : undefined,
    }));

    const activeCp = updatedCheckpoints[nextIndex];
    const progressPercent = activeCp.targetPercent;
    const distanceRemaining = Math.max(
      0,
      current.checkpoints[current.checkpoints.length - 1].cumulativeKm - activeCp.cumulativeKm
    );
    const estMinutes = Math.round((distanceRemaining / 50) * 60);

    const updated: TrackingProgress = {
      ...current,
      activeCheckpointIndex: nextIndex,
      progressPercentage: progressPercent,
      activeCheckpointBn: activeCp.nameBn,
      maskedCurrentLocationBn: `${activeCp.nameBn} সংলগ্ন মহাসড়ক`,
      distanceCoveredKm: activeCp.cumulativeKm,
      distanceRemainingKm: distanceRemaining,
      estimatedMinutesRemaining: estMinutes,
      etaBn: activeCp.estimatedArrivalBn,
      checkpoints: updatedCheckpoints,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.progressStore.set(bookingId, updated);
    return updated;
  }

  /**
   * Resets simulation back to the beginning
   */
  public async resetTracking(bookingId: string): Promise<TrackingProgress> {
    const current = this.progressStore.get(bookingId);
    if (!current) {
      throw new Error(`Tracking for booking ${bookingId} not found`);
    }

    const corridor = getCorridorForRoute('ঢাকা', 'কুমিল্লা');
    const reset = this.createInitialProgress(bookingId, corridor);
    this.progressStore.set(bookingId, reset);
    return reset;
  }

  private createInitialProgress(
    bookingId: string,
    corridor: CorridorRoute
  ): TrackingProgress {
    const checkpoints = corridor.checkpoints.map((cp, idx) => ({
      ...cp,
      passed: idx === 0,
      passedAt: idx === 0 ? 'সকাল ০৭:১৫' : undefined,
    }));

    const firstCp = checkpoints[0];
    const totalKm = checkpoints[checkpoints.length - 1].cumulativeKm;
    const distanceRemaining = totalKm - firstCp.cumulativeKm;

    return {
      bookingId,
      corridorId: corridor.id,
      corridorNameBn: corridor.corridorNameBn,
      progressPercentage: firstCp.targetPercent,
      activeCheckpointIndex: 0,
      activeCheckpointBn: firstCp.nameBn,
      maskedCurrentLocationBn: `${firstCp.nameBn} সংলগ্ন মহাসড়ক`,
      distanceCoveredKm: firstCp.cumulativeKm,
      distanceRemainingKm: distanceRemaining,
      estimatedMinutesRemaining: corridor.estimatedStandardDurationMinutes,
      etaBn: checkpoints[checkpoints.length - 1].estimatedArrivalBn,
      checkpoints,
      lastUpdatedAt: new Date().toISOString(),
      isSimulated: true,
      safetyNoteBn:
        'ব্যক্তিগত নিরাপত্তা বিধিমালার আলোকে সহযাত্রীর সুনির্দিষ্ট বাসা বা লাইভ জিপিএস গোপন রাখা হয়েছে। জাতীয় মহাসড়কের আনুমানিক ল্যান্ডমার্ক পয়েন্ট প্রদর্শিত হচ্ছে।',
    };
  }
}

export const defaultDemoTrackingProvider = new DemoTrackingProvider();
