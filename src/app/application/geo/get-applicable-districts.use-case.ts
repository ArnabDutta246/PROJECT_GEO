import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApplicationError } from '../errors/application.error';
import { DistrictOption } from '@domain/entities/applicable-area.entity';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { APPLICABLE_AREA_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetApplicableDistrictsUseCase {
  private readonly areaRepository = inject<ApplicableAreaRepository>(APPLICABLE_AREA_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(stateId: number, districtId = 0): Observable<DistrictOption[]> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return throwError(
        () => new ApplicationError('You must be signed in to load districts.', 'UNAUTHORIZED')
      );
    }
    if (!stateId) {
      return throwError(
        () => new ApplicationError('Select a state before loading districts.', 'VALIDATION_FAILED')
      );
    }
    return this.areaRepository.getDistricts(user.userId, stateId, districtId);
  }
}
