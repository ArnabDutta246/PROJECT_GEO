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
    public mediaRefs: ReadonlyArray<string>,
    public readonly numericId: number = 0,
    public projectCode: string = '',
    public projectTypeCode: string = '',
    public projectTypeName: string = '',
    public schemeTypeCode: string = '',
    public schemeTypeName: string = '',
    public nearestLandmark: string = '',
    public geoLocationType: string = 'POINT',
    public geoAccuracy: string = '100',
    public stateId: number = 0,
    public districtId: number = 0,
    public blockId: number = 0,
    public assignedToUserId: string = '',
    public assignedToUserName: string = '',
    public contactName: string = '',
    public contactNumber: string = '',
    public contactEmail: string = '',
    public status: string = 'PENDING',
    public remarks: string = '',
    public active: boolean = true,
    public createdOn: string = '',
    public plannedStartDate: string = '',
    public actualStartDate: string | null = null,
    public plannedEndDate: string = '',
    public actualEndDate: string | null = null,
    public readonly hasMapCoordinates: boolean = true
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
