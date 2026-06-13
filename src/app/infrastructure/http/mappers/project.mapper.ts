import { Project } from '@domain/entities/project.entity';
import { ProjectBasicInfoPayload } from '@domain/repositories/project.repository';
import { resolveProjectTypeApiCode } from '@domain/catalog/project-type.catalog';
import { resolveSchemeTypeApiCode } from '@domain/catalog/scheme-type.catalog';
import { Coordinates } from '@domain/value-objects/coordinates.vo';
import { Jurisdiction } from '@domain/value-objects/jurisdiction.vo';
import { UserRole } from '@domain/value-objects/role.enum';
import { projectSidebarItemFromProject } from '@presentation/features/home/models/project-sidebar-item.vm';
import {
  GeoProjectBasicInfoRequestDto,
  GeoProjectListItemDto,
} from '../dto/project.dto';

function parseCoord(value: string | null | undefined): number | null {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapListItemToProject(dto: GeoProjectListItemDto): Project {
  const lat = parseCoord(dto.gpbi_geo_location_lat);
  const lng = parseCoord(dto.gpbi_geo_location_long);
  const hasMapCoordinates = lat != null && lng != null;
  const coordinates = hasMapCoordinates
    ? Coordinates.create(lat, lng)
    : Coordinates.create(0, 0);

  const schemeTypeName =
    dto.gpbi_project_scheme_type_name?.trim() ||
    dto.gpbi_project_type_name?.trim() ||
    '';

  const jurisdiction = new Jurisdiction(
    [dto.gpbi_state_name ?? ''],
    [dto.gpbi_district_name ?? ''],
    [dto.gpbi_block_name ?? ''],
    UserRole.BlockManager
  );

  return new Project(
    String(dto.gpbi_id),
    dto.gpbi_project_name ?? '',
    dto.gpbi_project_name ?? '',
    schemeTypeName,
    dto.gpbi_location_name ?? '',
    coordinates,
    jurisdiction,
    null,
    null,
    '',
    '',
    '',
    null,
    [],
    [],
    dto.gpbi_id,
    dto.gpbi_project_code ?? '',
    dto.gpbi_project_type ?? '',
    dto.gpbi_project_type_name ?? '',
    dto.gpbi_project_scheme_type ?? '',
    schemeTypeName,
    dto.gpbi_nearest_landmark ?? '',
    dto.gpbi_geo_location_type ?? 'POINT',
    dto.gpbi_geo_location_accuracy ?? '100',
    dto.gpbi_state_id ?? 0,
    dto.gpbi_district_id ?? 0,
    dto.gpbi_block_id ?? 0,
    dto.gpbi_project_assigned_to ?? '',
    dto.gpbi_project_assigned_to_user_name ?? '',
    dto.gpbi_contact_name ?? '',
    dto.gpbi_contact_number ?? '',
    dto.gpbi_contact_email_id ?? '',
    dto.gpbi_project_status ?? 'PENDING',
    dto.gpbi_project_remarks ?? '',
    dto.gpbi_active === 'Y',
    dto.gpbi_project_created_on ?? '',
    dto.gpbi_planned_start_date ?? '',
    dto.gpbi_actual_start_date || null,
    dto.gpbi_planned_end_date ?? '',
    dto.gpbi_actual_end_date || null,
    hasMapCoordinates
  );
}

export const mapProjectToSidebarItem = projectSidebarItemFromProject;

export interface WizardBasicInfoInput {
  numericId: number;
  selectedProjectName: string;
  newProjectName: string;
  selectedSchemeType: string;
  newSchemeType: string;
  activityName: string;
  locationName: string;
  nearestLandmark: string;
  latitude: number | null;
  longitude: number | null;
  stateId: number;
  districtId: number;
  blockId: number;
  assignedToUserId: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  geoAccuracy?: string;
}

export function mapWizardToBasicInfoDto(
  input: WizardBasicInfoInput,
  loginUserId: string
): GeoProjectBasicInfoRequestDto {
  const projectName =
    input.selectedProjectName === 'MISC. (Create new)' && input.newProjectName.trim()
      ? input.newProjectName.trim()
      : input.selectedProjectName || input.activityName;

  const schemeLabel =
    input.selectedSchemeType === 'Misc. (Create new)' && input.newSchemeType.trim()
      ? input.newSchemeType.trim()
      : input.selectedSchemeType;

  const payload: ProjectBasicInfoPayload = {
    numericId: input.numericId,
    projectTypeCode: resolveProjectTypeApiCode(
      input.selectedProjectName,
      input.newProjectName
    ),
    projectName,
    schemeTypeCode: resolveSchemeTypeApiCode(schemeLabel),
    stateId: input.stateId,
    districtId: input.districtId,
    blockId: input.blockId,
    locationName: input.locationName,
    nearestLandmark: input.nearestLandmark,
    geoLocationType: 'POINT',
    geoLocationLat: String(input.latitude ?? ''),
    geoLocationLong: String(input.longitude ?? ''),
    geoAccuracy: input.geoAccuracy ?? '100',
    geoLocationLengthAreaVol: 0,
    assignedToUserId: input.assignedToUserId,
    contactName: input.contactName,
    contactNumber: input.contactNumber,
    contactEmail: input.contactEmail,
    projectStatus: 'PENDING',
    loginUser: loginUserId,
    active: 'Y',
    plannedStartDate: input.plannedStartDate,
    plannedEndDate: input.plannedEndDate,
    actualStartDate: input.actualStartDate,
    actualEndDate: input.actualEndDate,
  };

  return mapPayloadToRequestDto(payload);
}

export function mapPayloadToRequestDto(
  payload: ProjectBasicInfoPayload
): GeoProjectBasicInfoRequestDto {
  return {
    gpbi_id: payload.numericId,
    gpbi_project_type: payload.projectTypeCode,
    gpbi_project_name: payload.projectName,
    gpbi_project_scheme_type: payload.schemeTypeCode,
    gpbi_state_id: payload.stateId,
    gpbi_district_id: payload.districtId,
    gpbi_block_id: payload.blockId,
    gpbi_location_name: payload.locationName,
    gpbi_nearest_landmark: payload.nearestLandmark,
    gpbi_geo_location_type: payload.geoLocationType,
    gpbi_geo_location_lat: payload.geoLocationLat,
    gpbi_geo_location_long: payload.geoLocationLong,
    gpbi_geo_location_accuracy: payload.geoAccuracy,
    gpbi_geo_location_length_area_vol: payload.geoLocationLengthAreaVol,
    gpbi_project_assigned_to: payload.assignedToUserId,
    gpbi_contact_name: payload.contactName,
    gpbi_contact_number: payload.contactNumber,
    gpbi_contact_email_id: payload.contactEmail,
    gpbi_project_status: payload.projectStatus,
    gpbi_login_user: payload.loginUser,
    gpbi_active: payload.active,
    gpbi_planned_start_date: payload.plannedStartDate,
    gpbi_planned_end_date: payload.plannedEndDate,
    gpbi_actual_start_date: payload.actualStartDate,
    gpbi_actual_end_date: payload.actualEndDate,
  };
}

export function mapPayloadFromRequestDto(
  dto: GeoProjectBasicInfoRequestDto
): ProjectBasicInfoPayload {
  return {
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
}
