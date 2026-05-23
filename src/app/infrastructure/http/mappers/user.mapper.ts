import { ApplicationError } from '@application/errors/application.error';
import { User } from '@domain/entities/user.entity';
import { Jurisdiction } from '@domain/value-objects/jurisdiction.vo';
import {
  GROUP_CODE_TO_ROLE,
  ROLE_PERMISSIONS,
  UserRole,
} from '@domain/value-objects/role.enum';
import { UserProfileDto } from '../dto/login.dto';

function composeName(profile: UserProfileDto): string {
  return [profile.usp_first_name, profile.usp_middle_name, profile.usp_last_name]
    .filter((part) => part?.trim())
    .join(' ')
    .trim();
}

function mapRole(groupCode: string): UserRole {
  const role = GROUP_CODE_TO_ROLE[groupCode.trim().toUpperCase()];
  if (!role) {
    throw new ApplicationError(`Unsupported user group code: ${groupCode}`, 'UNSUPPORTED_ROLE');
  }
  return role;
}

export function mapUserProfileToDomain(profile: UserProfileDto, index = 0): User {
  if (profile.usp_active_yn !== 'Y') {
    throw new ApplicationError(
      'Account inactive — contact your administrator.',
      'ACCOUNT_INACTIVE'
    );
  }

  const role = mapRole(profile.usp_group_code);

  return new User(
    index + 1,
    profile.usp_user_id,
    composeName(profile) || profile.usp_user_id,
    profile.usp_mailid,
    role,
    Jurisdiction.empty(role),
    ROLE_PERMISSIONS[role],
    profile.usp_active_yn === 'Y'
  );
}

export function mapLoginUserToDomain(profiles: UserProfileDto[] | null): User {
  if (!profiles?.length) {
    throw new ApplicationError('Login failed! Invalid user or password!', 'LOGIN_FAILED');
  }
  return mapUserProfileToDomain(profiles[0]);
}
