import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Project } from '@domain/entities/project.entity';
import { User } from '@domain/entities/user.entity';
import {
  ProjectBasicInfoPayload,
  ProjectListQuery,
  ProjectRepository,
} from '@domain/repositories/project.repository';
import { Coordinates } from '@domain/value-objects/coordinates.vo';
import { Jurisdiction } from '@domain/value-objects/jurisdiction.vo';
import { Money } from '@domain/value-objects/money.vo';
import { UserRole } from '@domain/value-objects/role.enum';
import { IProjectData } from '../../project/insert-update-project/insert-update-project';

function toProject(data: IProjectData, index: number): Project {
  const jurisdiction = new Jurisdiction(
    ['ARUNACHAL PRADESH'],
    [data.districtName],
    [data.mouzaName],
    UserRole.BlockManager
  );

  return new Project(
    `local-${index}-${data.activityName}`,
    data.projectName,
    data.activityName,
    data.schemeType,
    data.locationName,
    Coordinates.create(data.latitude, data.longitude),
    jurisdiction,
    data.estimatedCost != null ? Money.create(data.estimatedCost) : null,
    data.finalCost != null ? Money.create(data.finalCost) : null,
    data.fundType,
    data.beneficiaryName,
    data.beneficiaryDetails ?? '',
    null,
    [],
    []
  );
}

@Injectable()
export class LocalProjectRepository extends ProjectRepository {
  getAllForUser(user: User): Observable<Project[]> {
    const raw = this.readProjectsFromStorage();
    const scoped = this.filterLegacyProjects(raw, user);
    return of(scoped.map((item, index) => toProject(item, index)));
  }

  listForUser(_query: ProjectListQuery): Observable<Project[]> {
    const raw = this.readProjectsFromStorage();
    return of(raw.map((item, index) => toProject(item, index)));
  }

  getByNumericId(id: number): Observable<Project | null> {
    return this.getById(String(id));
  }

  submitBasicInfo(_payload: ProjectBasicInfoPayload): Observable<void> {
    return of(undefined);
  }

  getById(id: string): Observable<Project | null> {
    const raw = this.readProjectsFromStorage();
    const matchIndex = raw.findIndex(
      (item, index) => `local-${index}-${item.activityName}` === id
    );
    if (matchIndex < 0) {
      return of(null);
    }
    return of(toProject(raw[matchIndex], matchIndex));
  }

  create(project: Project): Observable<Project> {
    return of(project);
  }

  update(project: Project): Observable<Project> {
    return of(project);
  }

  delete(_id: string): Observable<void> {
    return of(undefined);
  }

  toLegacyProjects(user: User): Observable<IProjectData[]> {
    return this.getAllForUser(user).pipe(
      map((projects) => {
        const raw = this.readProjectsFromStorage();
        const scoped = this.filterLegacyProjects(raw, user);
        return scoped;
      })
    );
  }

  private readProjectsFromStorage(): IProjectData[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const raw = localStorage.getItem('projectData');
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as IProjectData[];
    } catch {
      return [];
    }
  }

  private filterLegacyProjects(projects: IProjectData[], user: User): IProjectData[] {
    if (user.role === UserRole.Admin || user.role === UserRole.StateManager) {
      return projects;
    }
    if (user.role === UserRole.DistrictManager) {
      if (user.jurisdiction.districts.includes('ALL')) {
        return projects;
      }
      return projects.filter((project) =>
        user.jurisdiction.districts.some(
          (district) => district.toUpperCase() === project.districtName.toUpperCase()
        )
      );
    }
    if (user.role === UserRole.BlockManager) {
      return projects.filter(
        (project) =>
          user.jurisdiction.districts.some(
            (district) => district.toUpperCase() === project.districtName.toUpperCase()
          ) &&
          user.jurisdiction.blocks.some(
            (block) => block.toUpperCase() === project.mouzaName.toUpperCase()
          )
      );
    }
    return [];
  }
}
