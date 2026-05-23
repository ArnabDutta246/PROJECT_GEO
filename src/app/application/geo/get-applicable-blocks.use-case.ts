import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApplicationError } from '../errors/application.error';
import { BlockOption } from '@domain/entities/applicable-area.entity';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { APPLICABLE_AREA_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetApplicableBlocksUseCase {
  private readonly areaRepository = inject<ApplicableAreaRepository>(APPLICABLE_AREA_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(stateId: number, districtId: number, blockId = 0): Observable<BlockOption[]> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return throwError(
        () => new ApplicationError('You must be signed in to load blocks.', 'UNAUTHORIZED')
      );
    }
    if (!stateId || !districtId) {
      return throwError(
        () =>
          new ApplicationError('Select a state and district before loading blocks.', 'VALIDATION_FAILED')
      );
    }
    return this.areaRepository.getBlocks(user.userId, stateId, districtId, blockId);
  }
}
