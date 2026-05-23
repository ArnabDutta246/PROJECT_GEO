import { DomainError } from '../errors/domain.error';

export class Coordinates {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static create(latitude: number | null | undefined, longitude: number | null | undefined): Coordinates {
    if (latitude == null || longitude == null) {
      throw new DomainError('Coordinates require latitude and longitude', 'INVALID_COORDINATES');
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new DomainError('Coordinates are out of range', 'INVALID_COORDINATES');
    }
    return new Coordinates(latitude, longitude);
  }
}
