import { UserRole } from '../value-objects/role.enum';
import { Jurisdiction } from '../value-objects/jurisdiction.vo';

export class User {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public name: string,
    public email: string,
    public role: UserRole,
    public jurisdiction: Jurisdiction,
    public permissions: ReadonlyArray<string>,
    public active: boolean
  ) {}

  can(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  canAccessDistrict(districtName: string): boolean {
    return this.jurisdiction.includesDistrict(districtName);
  }

  canAccessBlock(districtName: string, blockName: string): boolean {
    return this.jurisdiction.includesBlock(districtName, blockName);
  }
}
