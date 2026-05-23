import { UserRole } from './role.enum';

export class Jurisdiction {
  constructor(
    public readonly states: ReadonlyArray<string>,
    public readonly districts: ReadonlyArray<string>,
    public readonly blocks: ReadonlyArray<string>,
    public readonly role: UserRole
  ) {}

  static empty(role: UserRole): Jurisdiction {
    return new Jurisdiction([], [], [], role);
  }

  includesDistrict(district: string): boolean {
    if (this.role === UserRole.StateManager || this.role === UserRole.Admin) {
      return true;
    }
    return this.districts.includes('ALL') || this.districts.includes(district);
  }

  includesBlock(district: string, block: string): boolean {
    if (!this.includesDistrict(district)) {
      return false;
    }
    if (this.role === UserRole.StateManager || this.role === UserRole.Admin) {
      return true;
    }
    if (this.role === UserRole.DistrictManager) {
      return this.blocks.includes('ALL') || this.blocks.includes(block);
    }
    return this.blocks.includes(block);
  }

  isInside(other: Jurisdiction): boolean {
    return this.includesDistrict(other.districts[0] ?? '');
  }
}
