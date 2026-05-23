import { Observable } from 'rxjs';
import { AreaAnalytics } from '../entities/area-analytics.entity';
import { GeoScope } from '../value-objects/geo-scope.vo';

export abstract class AnalyticsRepository {
  abstract getAreaSummary(scope: GeoScope): Observable<AreaAnalytics | null>;
}
