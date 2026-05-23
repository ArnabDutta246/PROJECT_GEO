import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApplicationError } from '../errors/application.error';
import { StateOption } from '@domain/entities/applicable-area.entity';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { APPLICABLE_AREA_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetApplicableStatesUseCase {
  private readonly areaRepository = inject<ApplicableAreaRepository>(APPLICABLE_AREA_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(stateId = 0): Observable<StateOption[]> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return throwError(
        () => new ApplicationError('You must be signed in to load states.', 'UNAUTHORIZED')
      );
    }
    return this.areaRepository.getStates(user.userId, stateId);
  }
}
