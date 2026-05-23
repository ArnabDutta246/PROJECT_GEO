import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ProjectPin } from '@domain/value-objects/project-pin.vo';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { GetProjectsByJurisdictionUseCase } from '../projects/get-projects-by-jurisdiction.use-case';

export interface GetMappableProjectsInput {
  districtName?: string | null;
  blockName?: string | null;
}

export interface GetMappableProjectsResult {
  pins: ProjectPin[];
  skippedCount: number;
}

@Injectable({ providedIn: 'root' })
export class GetMappableProjectsUseCase {
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly getProjects = inject(GetProjectsByJurisdictionUseCase);

  execute(input: GetMappableProjectsInput = {}): Observable<GetMappableProjectsResult> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return of({ pins: [], skippedCount: 0 });
    }

    return this.getProjects.execute(input).pipe(
      map((projects) => {
        const pins: ProjectPin[] = [];
        let skippedCount = 0;
        projects.forEach((project) => {
          const pin = ProjectPin.fromProject(project);
          if (pin) {
            pins.push(pin);
          } else {
            skippedCount += 1;
          }
        });
        return { pins, skippedCount };
      })
    );
  }
}
