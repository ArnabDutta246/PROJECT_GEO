import { GeoJsonGeometry } from '@domain/value-objects/geo-json-geometry.vo';

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygonCoordinates(lng: number, lat: number, coordinates: unknown): boolean {
  if (!Array.isArray(coordinates)) {
    return false;
  }

  if (coordinates.length && Array.isArray(coordinates[0]?.[0])) {
    if (Array.isArray(coordinates[0][0][0])) {
      return (coordinates as number[][][][]).some((polygon) =>
        pointInRing(lng, lat, polygon[0] as number[][])
      );
    }
    return pointInRing(lng, lat, coordinates[0] as number[][]);
  }

  return false;
}

export function pointInGeoJsonGeometry(
  latitude: number,
  longitude: number,
  geometry: GeoJsonGeometry
): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygonCoordinates(longitude, latitude, geometry.coordinates);
  }
  if (geometry.type === 'MultiPolygon') {
    return pointInPolygonCoordinates(longitude, latitude, geometry.coordinates);
  }
  return false;
}
