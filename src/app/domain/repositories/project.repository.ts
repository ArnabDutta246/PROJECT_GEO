import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';

export abstract class ProjectRepository {
  abstract getAllForUser(user: User): Observable<Project[]>;
  abstract getById(id: string): Observable<Project | null>;
  abstract create(project: Project): Observable<Project>;
  abstract update(project: Project): Observable<Project>;
  abstract delete(id: string): Observable<void>;
}
