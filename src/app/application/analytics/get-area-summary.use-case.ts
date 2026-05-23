import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AreaSummary } from '@domain/entities/area-summary.entity';
import { AnalyticsRepository } from '@domain/repositories/analytics.repository';
import { GeoScope } from '@domain/value-objects/geo-scope.vo';
import { UserRole } from '@domain/value-objects/role.enum';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { ANALYTICS_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetAreaSummaryUseCase {
  private readonly analyticsRepository = inject<AnalyticsRepository>(ANALYTICS_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(scope: GeoScope): Observable<AreaSummary | null> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return of(null);
    }

    if (!this.isScopeAllowed(scope, user.role, user.jurisdiction.districts, user.jurisdiction.blocks)) {
      return of(null);
    }

    return this.analyticsRepository.getAreaSummary(scope);
  }

  private isScopeAllowed(
    scope: GeoScope,
    role: UserRole,
    districts: ReadonlyArray<string>,
    blocks: ReadonlyArray<string>
  ): boolean {
    if (role === UserRole.StateManager || role === UserRole.Admin) {
      return true;
    }

    const allowedDistricts = districts.filter((name) => name !== 'ALL');
    const districtAllowed = allowedDistricts.some(
      (district) => normalizeGeoName(district) === normalizeGeoName(scope.districtName)
    );

    if (!districtAllowed) {
      return false;
    }

    if (scope.level === 'district') {
      return role === UserRole.DistrictManager || role === UserRole.BlockManager;
    }

    if (scope.level === 'block' && scope.blockName) {
      if (role === UserRole.DistrictManager && blocks.includes('ALL')) {
        return true;
      }

      const allowedBlocks = blocks.filter((name) => name !== 'ALL');
      return allowedBlocks.some(
        (block) => normalizeGeoName(block) === normalizeGeoName(scope.blockName ?? '')
      );
    }

    return false;
  }
}
