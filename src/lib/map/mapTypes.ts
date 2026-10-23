// BOHOK Phase 9 — Map Architecture & Provider Abstraction Types

export type MapProviderType = 'svg_highway' | 'mapbox' | 'google_maps';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface PrivacyRadiusZone {
  center: GeoCoordinate;
  radiusMeters: number; // typically 500 - 1000m
  fuzzedCoordinate: GeoCoordinate;
  hubNameBn: string;
  isApproximate: true;
  privacyNoticeBn: string;
}

export interface MapRoutePoint {
  id: string;
  nameBn: string;
  coordinate: GeoCoordinate;
  isHub: boolean;
  checkpointType: 'origin' | 'waypoint' | 'destination';
}

export interface MapRouteRenderConfig {
  originId: string;
  destinationId: string;
  routeColor: string;
  highlightCheckpoints: boolean;
  privacyRadiusEnabled: boolean;
  travellerLivePositionPercent?: number; // 0 - 100%
}

export interface IMapProviderAdapter {
  providerType: MapProviderType;
  isConfigured(): boolean;
  getPrivacyZone(rawCoordinate: GeoCoordinate, hubNameBn: string): PrivacyRadiusZone;
  getRouteWaypoints(originId: string, destinationId: string): MapRoutePoint[];
}
