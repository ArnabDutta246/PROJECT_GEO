import { AreaSummary } from '@domain/entities/area-summary.entity';
import { GeoScope } from '@domain/value-objects/geo-scope.vo';

export function toAreaSummary(
  scope: GeoScope,
  stateName: string,
  districtName: string,
  blockName: string | null,
  totalPopulation: number | null,
  populationAvailable: boolean
): AreaSummary {
  return new AreaSummary(
    scope,
    stateName,
    districtName,
    blockName,
    totalPopulation,
    populationAvailable
  );
}
