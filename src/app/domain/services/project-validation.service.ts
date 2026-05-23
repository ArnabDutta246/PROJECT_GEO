import { Project } from '../entities/project.entity';

export class ProjectValidationService {
  validateRequiredFields(project: Project): string[] {
    const errors: string[] = [];
    if (!project.projectName.trim()) errors.push('Project name is required');
    if (!project.activityName.trim()) errors.push('Activity name is required');
    if (!project.schemeType.trim()) errors.push('Scheme type is required');
    if (!project.locationName.trim()) errors.push('Location name is required');
    if (!project.fundType.trim()) errors.push('Fund type is required');
    if (!project.beneficiaryName.trim()) errors.push('Beneficiary name is required');
    return errors;
  }
}
