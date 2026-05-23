export enum UserRole {
  StateManager = 'state_manager',
  DistrictManager = 'district_manager',
  BlockManager = 'block_manager',
  Admin = 'admin',
}

export const GROUP_CODE_TO_ROLE: Record<string, UserRole> = {
  SM: UserRole.StateManager,
  DM: UserRole.DistrictManager,
  BM: UserRole.BlockManager,
  AD: UserRole.Admin,
};

export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  [UserRole.Admin]: ['view_projects', 'add_projects', 'edit_projects', 'delete_projects'],
  [UserRole.StateManager]: ['view_projects'],
  [UserRole.DistrictManager]: ['view_projects', 'add_projects', 'edit_projects', 'delete_projects'],
  [UserRole.BlockManager]: ['view_projects', 'add_projects', 'edit_projects', 'delete_projects'],
};
