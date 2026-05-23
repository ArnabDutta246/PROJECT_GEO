import { ApiEnvelope } from './api-envelope.dto';

export interface LoginRequestDto {
  user_id: string;
  password: string;
  device_uuid: string;
}

export interface UserProfileDto {
  usp_user_id: string;
  usp_pswd: string;
  usp_first_name: string;
  usp_middle_name: string;
  usp_last_name: string;
  usp_group_code: string;
  usp_group_desc: string;
  usp_dept: string;
  usp_mailid: string;
  usp_mobile: string;
  usp_employee_id: string;
  usp_reportee_user: string;
  usp_active_yn: 'Y' | 'N' | string;
}

export interface LoginResponseDto extends ApiEnvelope<null> {
  token: string | null;
  user: UserProfileDto[] | null;
}

export interface StateItemDto {
  tsm_state_id: number;
  tsm_state_name: string;
}

export interface DistrictItemDto {
  tdm_district_id: number;
  tdm_district_name: string;
  tsm_state_id?: number;
}

export interface BlockItemDto {
  tbm_block_id: number;
  tbm_block_name: string;
  tdm_district_id?: number;
  tsm_state_id?: number;
}
