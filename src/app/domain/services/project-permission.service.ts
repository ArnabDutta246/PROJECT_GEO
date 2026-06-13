import { User } from '@domain/entities/user.entity';

export class ProjectPermissionService {
  /** v1: all authenticated roles may start project create from the dashboard. */
  canCreateProject(user: User | null): boolean {
    return user !== null && user.active;
  }

  canCreateFromLegacyRole(role: string | undefined, _permissions: readonly string[] = []): boolean {
    return !!role;
  }
}
