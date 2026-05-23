import { GeoBoundary } from '../entities/geo-boundary.entity';
import { Coordinates } from './coordinates.vo';

export class MapBounds {
  constructor(
    public readonly southWest: Coordinates,
    public readonly northEast: Coordinates
  ) {}

  static fromGeoBoundaries(boundaries: GeoBoundary[]): MapBounds | null {
    if (!boundaries.length) {
      return null;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    const visit = (lng: number, lat: number): void => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    };

    const walkCoords = (coords: unknown): void => {
      if (!Array.isArray(coords)) {
        return;
      }
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        visit(coords[0], coords[1]);
        return;
      }
      coords.forEach(walkCoords);
    };

    boundaries.forEach((boundary) => walkCoords(boundary.geometry.coordinates));

    if (!Number.isFinite(minLat)) {
      return null;
    }

    return new MapBounds(
      Coordinates.create(minLat, minLng),
      Coordinates.create(maxLat, maxLng)
    );
  }
}
