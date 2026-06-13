export interface GeoProjectListItemDto {
  gpbi_id: number;
  gpbi_project_code: string;
  gpbi_project_type: string;
  gpbi_project_type_name: string;
  gpbi_project_name: string;
  gpbi_project_scheme_type: string;
  gpbi_project_scheme_type_name: string;
  gpbi_state_id: number;
  gpbi_state_name: string;
  gpbi_district_id: number;
  gpbi_district_name: string;
  gpbi_block_id: number;
  gpbi_block_name: string;
  gpbi_location_name: string;
  gpbi_nearest_landmark: string;
  gpbi_geo_location_type: string;
  gpbi_geo_location_lat: string;
  gpbi_geo_location_long: string;
  gpbi_geo_location_accuracy: string;
  gpbi_geo_location_length_area_vol: number;
  gpbi_project_assigned_to: string;
  gpbi_project_assigned_to_user_name: string;
  gpbi_contact_name: string;
  gpbi_contact_number: string;
  gpbi_contact_email_id: string;
  gpbi_project_status: string;
  gpbi_project_remarks: string;
  gpbi_project_created_on: string;
  gpbi_planned_start_date: string;
  gpbi_actual_start_date: string;
  gpbi_planned_end_date: string;
  gpbi_actual_end_date: string;
  gpbi_active: string;
}

export interface GeoProjectListResponseDto {
  geoProjectList: GeoProjectListItemDto[];
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

export interface GeoProjectBasicInfoRequestDto {
  gpbi_id: number;
  gpbi_project_type: string;
  gpbi_project_name: string;
  gpbi_project_scheme_type: string;
  gpbi_state_id: number;
  gpbi_district_id: number;
  gpbi_block_id: number;
  gpbi_location_name: string;
  gpbi_nearest_landmark: string;
  gpbi_geo_location_type: string;
  gpbi_geo_location_lat: string;
  gpbi_geo_location_long: string;
  gpbi_geo_location_accuracy: string;
  gpbi_geo_location_length_area_vol: number;
  gpbi_project_assigned_to: string;
  gpbi_contact_name: string;
  gpbi_contact_number: string;
  gpbi_contact_email_id: string;
  gpbi_project_status: string;
  gpbi_login_user: string;
  gpbi_active: string;
  gpbi_planned_start_date: string;
  gpbi_actual_start_date?: string;
  gpbi_planned_end_date: string;
  gpbi_actual_end_date?: string;
}

export interface GeoProjectSubmitResponseDto {
  statusCode: number;
  message: string;
  success: boolean;
  data?: null;
}
