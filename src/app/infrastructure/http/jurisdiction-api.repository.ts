import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApplicationError } from '@application/errors/application.error';
import {
  BlockOption,
  DistrictOption,
  StateOption,
} from '@domain/entities/applicable-area.entity';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { ApiClientService } from './api-client.service';
import {
  ApplicableBlockResponseDto,
  ApplicableDistrictResponseDto,
  ApplicableStateResponseDto,
} from './dto/jurisdiction.dto';
import { mapBlockItem, mapDistrictItem, mapStateItem } from './mappers/jurisdiction.mapper';

@Injectable()
export class JurisdictionApiRepository extends ApplicableAreaRepository {
  private readonly http = inject(HttpClient);
  private readonly apiClient = inject(ApiClientService);

  getStates(userId: string, stateId = 0): Observable<StateOption[]> {
    return this.get<ApplicableStateResponseDto>('/UserDetails/GetUserApplicableState', {
      userId,
      stateId: String(stateId),
    }).pipe(map((response) => (response.state ?? []).map(mapStateItem)));
  }

  getDistricts(userId: string, stateId: number, districtId = 0): Observable<DistrictOption[]> {
    return this.get<ApplicableDistrictResponseDto>('/UserDetails/GetUserApplicableDistrict', {
      userId,
      stateId: String(stateId),
      districtId: String(districtId),
    }).pipe(
      map((response) =>
        (response.district ?? []).map((item) => mapDistrictItem({ ...item, tsm_state_id: stateId }))
      )
    );
  }

  getBlocks(
    userId: string,
    stateId: number,
    districtId: number,
    blockId = 0
  ): Observable<BlockOption[]> {
    return this.get<ApplicableBlockResponseDto>('/UserDetails/GetUserApplicableBlock', {
      userId,
      stateId: String(stateId),
      districtId: String(districtId),
      blockId: String(blockId),
    }).pipe(
      map((response) =>
        (response.block ?? []).map((item) =>
          mapBlockItem({ ...item, tdm_district_id: districtId, tsm_state_id: stateId })
        )
      )
    );
  }

  private get<T>(path: string, params: Record<string, string>): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params });
    const headers = new HttpHeaders({ accept: 'text/plain' });

    return this.http
      .get<T>(this.apiClient.url(path), { params: httpParams, headers })
      .pipe(
        catchError((error) => {
          const message =
            error?.error?.message ??
            error?.message ??
            'Unable to load jurisdiction data. Check your network and try again.';
          return throwError(() => new ApplicationError(message, 'NETWORK_ERROR'));
        })
      );
  }
}
