import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { ApplicationError } from '@application/errors/application.error';
import { Project } from '@domain/entities/project.entity';
import { User } from '@domain/entities/user.entity';
import {
  ProjectBasicInfoPayload,
  ProjectListQuery,
  ProjectRepository,
} from '@domain/repositories/project.repository';
import { ApiClientService } from './api-client.service';
import {
  GeoProjectListResponseDto,
  GeoProjectSubmitResponseDto,
} from './dto/project.dto';
import {
  mapListItemToProject,
  mapPayloadToRequestDto,
} from './mappers/project.mapper';
import { assertApiSuccess } from './mappers/api-response.mapper';
import { SessionRepository } from '@domain/repositories/session.repository';
import { SESSION_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable()
export class ProjectApiRepository extends ProjectRepository {
  private readonly http = inject(HttpClient);
  private readonly apiClient = inject(ApiClientService);
  private readonly sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);

  getAllForUser(user: User): Observable<Project[]> {
    return this.listForUser({ loginUserId: user.userId });
  }

  listForUser(query: ProjectListQuery): Observable<Project[]> {
    if (!query.loginUserId) {
      return of([]);
    }

    const params = new HttpParams({
      fromObject: {
        loginUserId: query.loginUserId,
        currentPageNo: String(query.currentPageNo ?? 1),
        noOfPagesToGet: String(query.noOfPagesToGet ?? 50),
        activeYn: query.activeYn ?? 'Y',
      },
    });

    const headers = new HttpHeaders({ accept: 'text/plain' });

    return this.http
      .get<GeoProjectListResponseDto>(this.apiClient.url('/UserDetails/GetGeoProjectList'), {
        params,
        headers,
      })
      .pipe(
        map((response) => {
          assertApiSuccess(response);
          return (response.geoProjectList ?? []).map(mapListItemToProject);
        }),
        catchError((error) => {
          const message =
            error?.error?.message ??
            error?.message ??
            'Unable to load projects. Check your network and try again.';
          return throwError(() => new ApplicationError(message, 'NETWORK_ERROR'));
        })
      );
  }

  getById(id: string): Observable<Project | null> {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return of(null);
    }
    return this.getByNumericId(numericId);
  }

  getByNumericId(id: number): Observable<Project | null> {
    const session = this.sessionRepository.getSession();
    if (!session) {
      return of(null);
    }
    return this.listForUser({ loginUserId: session.user.userId }).pipe(
      map((projects) => projects.find((project) => project.numericId === id) ?? null)
    );
  }

  create(project: Project): Observable<Project> {
    return of(project);
  }

  update(project: Project): Observable<Project> {
    return of(project);
  }

  delete(_id: string): Observable<void> {
    return of(undefined);
  }

  submitBasicInfo(payload: ProjectBasicInfoPayload): Observable<void> {
    const body = mapPayloadToRequestDto(payload);
    const headers = new HttpHeaders({
      accept: 'text/plain',
      'Content-Type': 'application/json',
    });

    return this.http
      .post<GeoProjectSubmitResponseDto>(
        this.apiClient.url('/UserDetails/InsertUpdateGeoProjectBasicInfo'),
        body,
        { headers }
      )
      .pipe(
        map((response) => {
          if (response.success === false || response.statusCode >= 400) {
            throw new ApplicationError(response.message || 'Request failed', String(response.statusCode));
          }
        }),
        catchError((error) => {
          const message =
            error?.error?.message ??
            error?.message ??
            'Unable to submit project. Check your network and try again.';
          return throwError(() => new ApplicationError(message, 'NETWORK_ERROR'));
        })
      );
  }
}
