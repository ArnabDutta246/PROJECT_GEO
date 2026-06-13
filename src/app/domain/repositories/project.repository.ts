import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';

export interface ProjectListQuery {
  loginUserId?: string;
  currentPageNo?: number;
  noOfPagesToGet?: number;
  activeYn?: 'Y' | 'N';
}

export interface ProjectBasicInfoPayload {
  numericId: number;
  projectTypeCode: string;
  projectName: string;
  schemeTypeCode: string;
  stateId: number;
  districtId: number;
  blockId: number;
  locationName: string;
  nearestLandmark: string;
  geoLocationType: string;
  geoLocationLat: string;
  geoLocationLong: string;
  geoAccuracy: string;
  geoLocationLengthAreaVol: number;
  assignedToUserId: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  projectStatus: string;
  loginUser: string;
  active: string;
  plannedStartDate: string;
  actualStartDate?: string;
  plannedEndDate: string;
  actualEndDate?: string;
}

export abstract class ProjectRepository {
  abstract getAllForUser(user: User): Observable<Project[]>;
  abstract listForUser(query: ProjectListQuery): Observable<Project[]>;
  abstract getById(id: string): Observable<Project | null>;
  abstract getByNumericId(id: number): Observable<Project | null>;
  abstract create(project: Project): Observable<Project>;
  abstract update(project: Project): Observable<Project>;
  abstract delete(id: string): Observable<void>;
  abstract submitBasicInfo(payload: ProjectBasicInfoPayload): Observable<void>;
}
