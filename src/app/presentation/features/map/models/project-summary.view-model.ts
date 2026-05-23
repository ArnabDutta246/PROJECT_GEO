import { ProjectPin } from '@domain/value-objects/project-pin.vo';

export class ProjectSummaryViewModel {
  constructor(
    public readonly id: string,
    public readonly projectName: string,
    public readonly schemeType: string,
    public readonly locationName: string,
    public readonly districtName: string,
    public readonly blockName: string,
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static fromPin(pin: ProjectPin): ProjectSummaryViewModel {
    return new ProjectSummaryViewModel(
      pin.id,
      pin.projectName,
      pin.schemeType,
      pin.locationName,
      pin.districtName,
      pin.blockName,
      pin.coordinates.latitude,
      pin.coordinates.longitude
    );
  }
}
