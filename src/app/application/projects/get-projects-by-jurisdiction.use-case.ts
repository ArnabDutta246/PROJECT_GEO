import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from '@domain/entities/project.entity';
import { JurisdictionFilterService } from '@domain/services/jurisdiction-filter.service';
import { ProjectRepository } from '@domain/repositories/project.repository';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { PROJECT_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';

@Injectable({ providedIn: 'root' })
export class GetProjectsByJurisdictionUseCase {
  private readonly projectRepository = inject<ProjectRepository>(PROJECT_REPOSITORY);
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

    return this.projectRepository.getAllForUser(user).pipe(
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
