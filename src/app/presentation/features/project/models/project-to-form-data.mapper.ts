import { Project } from '@domain/entities/project.entity';
import { ProjectPin } from '@domain/value-objects/project-pin.vo';
import { IProjectData } from './legacy-project-data';

export function projectToFormData(project: Project): IProjectData {
  const schemeType = project.schemeTypeName || project.schemeType;

  return {
    projectName: project.projectName,
    activityName: project.activityName,
    schemeType,
    locationName: project.locationName,
    latitude: project.hasMapCoordinates ? project.coordinates.latitude : null,
    longitude: project.hasMapCoordinates ? project.coordinates.longitude : null,
    aoiFile: null,
    beneficiaryName: project.beneficiaryName,
    beneficiaryDetails: project.beneficiaryDetails,
    estimatedCost: project.estimatedCost?.amount ?? null,
    finalCost: project.finalCost?.amount ?? null,
    fundType: project.fundType,
    selectedProjectName: project.projectName,
    newProjectName: '',
    selectedSchemeType: schemeType,
    newSchemeType: '',
    districtName: project.jurisdiction.districts[0] ?? '',
    mouzaName: project.jurisdiction.blocks[0] ?? '',
    nearestLandmark: project.nearestLandmark,
    contactName: project.contactName,
    contactNumber: project.contactNumber,
    contactEmail: project.contactEmail,
    assignedToUserId: project.assignedToUserId,
    plannedStartDate: project.plannedStartDate,
    plannedEndDate: project.plannedEndDate,
    actualStartDate: project.actualStartDate ?? '',
    actualEndDate: project.actualEndDate ?? '',
    selectedStateId: project.stateId || null,
    selectedDistrictId: project.districtId || null,
    selectedBlockId: project.blockId || null,
    numericId: project.numericId,
  };
}

export function projectPinToFormData(pin: ProjectPin): IProjectData {
  return {
    projectName: pin.projectName,
    activityName: pin.activityName,
    schemeType: pin.schemeType,
    locationName: pin.locationName,
    latitude: pin.coordinates.latitude,
    longitude: pin.coordinates.longitude,
    aoiFile: null,
    beneficiaryName: '',
    beneficiaryDetails: '',
    estimatedCost: null,
    finalCost: null,
    fundType: '',
    selectedProjectName: pin.projectName,
    newProjectName: '',
    selectedSchemeType: pin.schemeType,
    newSchemeType: '',
    districtName: pin.districtName,
    mouzaName: pin.blockName,
  };
}
