import { Observable } from 'rxjs';
import { AreaSummary } from '../entities/area-summary.entity';
import { GeoScope } from '../value-objects/geo-scope.vo';

export abstract class AnalyticsRepository {
  abstract getAreaSummary(scope: GeoScope): Observable<AreaSummary | null>;
}
