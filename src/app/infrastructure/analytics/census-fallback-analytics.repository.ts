import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AreaSummary } from '@domain/entities/area-summary.entity';
import { GeoBoundary } from '@domain/entities/geo-boundary.entity';
import { AnalyticsRepository } from '@domain/repositories/analytics.repository';
import { GeoBoundaryRepository } from '@domain/repositories/geo-boundary.repository';
import { GeoScope } from '@domain/value-objects/geo-scope.vo';
import { GEO_BOUNDARY_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { toAreaSummary } from './mappers/area-summary.mapper';

@Injectable({ providedIn: 'root' })
export class CensusFallbackAnalyticsRepository extends AnalyticsRepository {
  private readonly geoBoundaryRepository = inject<GeoBoundaryRepository>(
    GEO_BOUNDARY_REPOSITORY
  );

  getAreaSummary(scope: GeoScope): Observable<AreaSummary | null> {
    return this.geoBoundaryRepository.loadBlockBoundaries().pipe(
      map((blocks) => {
        if (scope.level === 'block' && scope.blockName) {
          return this.buildBlockSummary(scope, blocks);
        }
        if (scope.level === 'district') {
          return this.buildDistrictSummary(scope, blocks);
        }
        return null;
      })
    );
  }

  private buildBlockSummary(scope: GeoScope, blocks: GeoBoundary[]): AreaSummary | null {
    const block = blocks.find(
      (item) =>
        normalizeGeoName(item.name) === normalizeGeoName(scope.blockName ?? '') &&
        normalizeGeoName(item.districtName) === normalizeGeoName(scope.districtName)
    );

    if (!block) {
      return null;
    }

    const total = block.censusAttributes?.totalPopulation ?? null;
    const populationAvailable = total != null && Number.isFinite(total);

    return toAreaSummary(
      scope,
      scope.stateName,
      block.districtName,
      block.name,
      populationAvailable ? total : null,
      populationAvailable
    );
  }

  private buildDistrictSummary(scope: GeoScope, blocks: GeoBoundary[]): AreaSummary | null {
    const districtBlocks = blocks.filter(
      (block) =>
        normalizeGeoName(block.districtName) === normalizeGeoName(scope.districtName)
    );

    if (!districtBlocks.length) {
      return null;
    }

    let total = 0;
    let hasCensus = false;

    for (const block of districtBlocks) {
      const blockTotal = block.censusAttributes?.totalPopulation;
      if (blockTotal != null && Number.isFinite(blockTotal)) {
        total += blockTotal;
        hasCensus = true;
      }
    }

    return toAreaSummary(
      scope,
      scope.stateName,
      districtBlocks[0].districtName,
      null,
      hasCensus ? total : null,
      hasCensus
    );
  }
}
