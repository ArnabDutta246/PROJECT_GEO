export interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'video';
  category: 'beneficiary' | 'plan' | 'tender' | 'other' | 'media' | 'aoi';
}

export interface ProjectWizardFormData {
  projectName: string;
  activityName: string;
  schemeType: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  aoiFile: File | null;
  beneficiaryName: string;
  beneficiaryDetails: string;
  estimatedCost: number | null;
  finalCost: number | null;
  fundType: string;
  selectedProjectName: string;
  newProjectName: string;
  selectedSchemeType: string;
  newSchemeType: string;
  districtName: string;
  mouzaName: string;
  nearestLandmark: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  assignedToUserId: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  selectedStateId: number | null;
  selectedDistrictId: number | null;
  selectedBlockId: number | null;
  numericId: number;
}

export interface ProjectFormStepMeta {
  step: number;
  title: string;
}

export interface FundTypeOption {
  value: string;
  label: string;
}

export const FUND_TYPE_OPTIONS: readonly FundTypeOption[] = [
  { value: 'STATE_FUND', label: 'State Fund' },
  { value: 'CENTRAL_FUND', label: 'Central Fund' },
  { value: 'EXTERNALLY_AIDED', label: 'Externally Aided' },
  { value: 'OTHER', label: 'Other (Specify)' },
] as const;

export const PROJECT_FORM_STEPS: readonly ProjectFormStepMeta[] = [
  { step: 1, title: 'ACTIVITY NAME & LOCATION DETAILS' },
  { step: 2, title: 'BENEFICIERIES DETAILS' },
  { step: 3, title: 'DOCUMENTATION' },
  { step: 4, title: 'PHOTO & VIDEOGRAPHY' },
  { step: 5, title: 'REVIEW DETAILS' },
] as const;

export function createEmptyFormData(
  userDefaults?: { name?: string; email?: string; userId?: string }
): ProjectWizardFormData {
  return {
    projectName: '',
    activityName: '',
    schemeType: '',
    locationName: '',
    latitude: null,
    longitude: null,
    aoiFile: null,
    beneficiaryName: '',
    beneficiaryDetails: '',
    estimatedCost: null,
    finalCost: null,
    fundType: '',
    selectedProjectName: '',
    newProjectName: '',
    selectedSchemeType: '',
    newSchemeType: '',
    districtName: '',
    mouzaName: '',
    nearestLandmark: '',
    contactName: userDefaults?.name ?? '',
    contactNumber: '',
    contactEmail: userDefaults?.email ?? '',
    assignedToUserId: userDefaults?.userId ?? '',
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    selectedStateId: null,
    selectedDistrictId: null,
    selectedBlockId: null,
    numericId: 0,
  };
}

export interface ProjectMapComponentRef {
  setLocationFromCoordinates(latitude: number, longitude: number): void;
  ensureMapInitialized?(): Promise<void>;
}
