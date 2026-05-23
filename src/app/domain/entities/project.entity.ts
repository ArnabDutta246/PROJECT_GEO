import { Coordinates } from '../value-objects/coordinates.vo';
import { Jurisdiction } from '../value-objects/jurisdiction.vo';
import { Money } from '../value-objects/money.vo';

export class Project {
  constructor(
    public readonly id: string,
    public projectName: string,
    public activityName: string,
    public schemeType: string,
    public locationName: string,
    public coordinates: Coordinates,
    public jurisdiction: Jurisdiction,
    public estimatedCost: Money | null,
    public finalCost: Money | null,
    public fundType: string,
    public beneficiaryName: string,
    public beneficiaryDetails: string,
    public aoiFileRef: string | null,
    public documentRefs: ReadonlyArray<string>,
    public mediaRefs: ReadonlyArray<string>
  ) {}

  isWithin(jurisdiction: Jurisdiction): boolean {
    return jurisdiction.isInside(this.jurisdiction);
  }

  renameActivity(name: string): void {
    if (!name.trim()) {
      throw new Error('Activity name cannot be empty');
    }
    this.activityName = name.trim();
  }
}
