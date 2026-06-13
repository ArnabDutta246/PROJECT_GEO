import { Project } from '../entities/project.entity';
import { Coordinates } from './coordinates.vo';

export class ProjectPin {
  constructor(
    public readonly id: string,
    public readonly projectName: string,
    public readonly activityName: string,
    public readonly schemeType: string,
    public readonly locationName: string,
    public readonly coordinates: Coordinates,
    public readonly districtName: string,
    public readonly blockName: string
  ) {}

  static fromProject(project: Project): ProjectPin | null {
    if (!project.hasMapCoordinates) {
      return null;
    }
    try {
      const coordinates = Coordinates.create(
        project.coordinates.latitude,
        project.coordinates.longitude
      );
      return new ProjectPin(
        project.id,
        project.projectName,
        project.activityName,
        project.schemeType,
        project.locationName,
        coordinates,
        project.jurisdiction.districts[0] ?? '',
        project.jurisdiction.blocks[0] ?? ''
      );
    } catch {
      return null;
    }
  }
}
