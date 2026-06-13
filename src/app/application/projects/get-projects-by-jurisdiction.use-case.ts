import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from '@domain/entities/project.entity';
import { JurisdictionFilterService } from '@domain/services/jurisdiction-filter.service';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { GetProjectListUseCase } from './get-project-list.use-case';

@Injectable({ providedIn: 'root' })
export class GetProjectsByJurisdictionUseCase {
  private readonly getProjectList = inject(GetProjectListUseCase);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly jurisdictionFilter = new JurisdictionFilterService();

  execute(options?: {
    districtName?: string | null;
    blockName?: string | null;
  }): Observable<Project[]> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return of([]);
    }

    return this.getProjectList.execute().pipe(
      map((projects) => this.jurisdictionFilter.filterProjects(projects, user)),
      map((projects) => this.applySelectionFilter(projects, options))
    );
  }

  private applySelectionFilter(
    projects: Project[],
    options?: { districtName?: string | null; blockName?: string | null }
  ): Project[] {
    let filtered = projects;
    if (options?.districtName) {
      const district = normalizeGeoName(options.districtName);
      filtered = filtered.filter((project) =>
        project.jurisdiction.districts.some((name) => normalizeGeoName(name) === district)
      );
    }
    if (options?.blockName) {
      const block = normalizeGeoName(options.blockName);
      filtered = filtered.filter((project) =>
        project.jurisdiction.blocks.some((name) => normalizeGeoName(name) === block)
      );
    }
    return filtered;
  }
}
