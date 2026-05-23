import { Observable } from 'rxjs';
import { GeoBoundary } from '../entities/geo-boundary.entity';

export abstract class GeoRepository {
  abstract getBoundary(level: string, id: string): Observable<GeoBoundary | null>;
}
