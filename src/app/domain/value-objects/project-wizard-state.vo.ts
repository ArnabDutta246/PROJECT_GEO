import { WizardBasicInfoInput, mapWizardToBasicInfoDto } from '@infrastructure/http/mappers/project.mapper';

export interface ProjectWizardState {
  step1: WizardBasicInfoInput;
  beneficiaryName: string;
  beneficiaryDetails: string;
  estimatedCost: number | null;
  finalCost: number | null;
  fundType: string;
}

export function toBasicInfoPayload(state: ProjectWizardState, userId: string) {
  return mapWizardToBasicInfoDto(state.step1, userId);
}
