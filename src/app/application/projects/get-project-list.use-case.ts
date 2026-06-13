import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project } from '@domain/entities/project.entity';
import { ProjectListQuery } from '@domain/repositories/project.repository';
import { PROJECT_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';

@Injectable({ providedIn: 'root' })
export class GetProjectListUseCase {
  private readonly projectRepository = inject(PROJECT_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(_query?: Partial<ProjectListQuery>): Observable<Project[]> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return of([]);
    }

    return this.projectRepository.getAllForUser(user);
  }
}
