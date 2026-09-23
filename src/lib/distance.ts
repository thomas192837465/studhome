import type { Coordinates } from "./geolocation";

// Straight-line (haversine) distance, then inflated by a fixed detour
// factor since no street actually runs point-to-point — real walking
// routes are longer than the straight line. This keeps the estimate
// reasonable without depending on a paid routing API.
const EARTH_RADIUS_KM = 6371;
const ROUTE_DETOUR_FACTOR = 1.3;
const WALK_SPEED_KMH = 4.5;

export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function estimateWalkingMinutes(a: Coordinates, b: Coordinates): number {
  const distanceKm = haversineDistanceKm(a, b) * ROUTE_DETOUR_FACTOR;
  return Math.max(1, Math.round((distanceKm / WALK_SPEED_KMH) * 60));
}

export function formatWalkingTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} min à pied`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `~${hours} h${rem ? ` ${rem} min` : ""} à pied`;
}
