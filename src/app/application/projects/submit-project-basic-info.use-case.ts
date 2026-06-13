import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '@domain/repositories/project.repository';
import { PROJECT_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { mapWizardToBasicInfoDto, WizardBasicInfoInput } from '@infrastructure/http/mappers/project.mapper';
import { GetCurrentUserUseCase } from '../auth/get-current-user.use-case';
import { ApplicationError } from '../errors/application.error';

@Injectable({ providedIn: 'root' })
export class SubmitProjectBasicInfoUseCase {
  private readonly projectRepository = inject<ProjectRepository>(PROJECT_REPOSITORY);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);

  execute(input: WizardBasicInfoInput): Observable<void> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      throw new ApplicationError('You must be signed in to submit a project.', 'UNAUTHORIZED');
    }

    const dto = mapWizardToBasicInfoDto(input, user.userId);
    const payload = {
      numericId: dto.gpbi_id,
      projectTypeCode: dto.gpbi_project_type,
      projectName: dto.gpbi_project_name,
      schemeTypeCode: dto.gpbi_project_scheme_type,
      stateId: dto.gpbi_state_id,
      districtId: dto.gpbi_district_id,
      blockId: dto.gpbi_block_id,
      locationName: dto.gpbi_location_name,
      nearestLandmark: dto.gpbi_nearest_landmark,
      geoLocationType: dto.gpbi_geo_location_type,
      geoLocationLat: dto.gpbi_geo_location_lat,
      geoLocationLong: dto.gpbi_geo_location_long,
      geoAccuracy: dto.gpbi_geo_location_accuracy,
      geoLocationLengthAreaVol: dto.gpbi_geo_location_length_area_vol,
      assignedToUserId: dto.gpbi_project_assigned_to,
      contactName: dto.gpbi_contact_name,
      contactNumber: dto.gpbi_contact_number,
      contactEmail: dto.gpbi_contact_email_id,
      projectStatus: dto.gpbi_project_status,
      loginUser: dto.gpbi_login_user,
      active: dto.gpbi_active,
      plannedStartDate: dto.gpbi_planned_start_date,
      plannedEndDate: dto.gpbi_planned_end_date,
      actualStartDate: dto.gpbi_actual_start_date,
      actualEndDate: dto.gpbi_actual_end_date,
    };

    return this.projectRepository.submitBasicInfo(payload);
  }
}
