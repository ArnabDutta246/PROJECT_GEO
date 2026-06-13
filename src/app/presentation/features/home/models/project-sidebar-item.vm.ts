import { Project } from '@domain/entities/project.entity';
import {
  getSchemeTypeColor,
  getSchemeTypeMaterialIcon,
  resolveSchemeType,
} from '@domain/catalog/scheme-type.catalog';

export interface ProjectSidebarItem {
  id: string;
  title: string;
  subtitle: string;
  schemeLabel: string;
  schemeIcon: string;
  schemeColor: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
  activityName: string;
  locationName: string;
  schemeType: string;
}

export function projectSidebarItemFromProject(project: Project): ProjectSidebarItem {
  const schemeLabel = project.schemeTypeName || project.schemeType;
  const scheme = resolveSchemeType(schemeLabel);

  return {
    id: project.id,
    title: project.projectName,
    subtitle: project.locationName,
    schemeLabel,
    schemeIcon: scheme.materialIcon,
    schemeColor: scheme.color,
    code: project.projectCode,
    latitude: project.hasMapCoordinates ? project.coordinates.latitude : null,
    longitude: project.hasMapCoordinates ? project.coordinates.longitude : null,
    activityName: project.activityName,
    locationName: project.locationName,
    schemeType: schemeLabel,
  };
}
