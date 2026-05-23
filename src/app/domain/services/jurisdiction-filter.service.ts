import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';

export class JurisdictionFilterService {
  filterProjects(projects: Project[], user: User): Project[] {
    return projects.filter((project) => project.isWithin(user.jurisdiction));
  }
}
