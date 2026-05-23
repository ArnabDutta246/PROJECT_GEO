import { Observable } from 'rxjs';
import { GeoBoundary } from '../entities/geo-boundary.entity';

export abstract class GeoBoundaryRepository {
  abstract loadBlockBoundaries(): Observable<GeoBoundary[]>;

  abstract getBlocksByDistrict(districtName: string): Observable<GeoBoundary[]>;

  abstract getBlockByName(
    districtName: string,
    blockName: string
  ): Observable<GeoBoundary | null>;
}
