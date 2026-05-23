import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map, catchError, throwError } from 'rxjs';
import { GeoBoundary } from '@domain/entities/geo-boundary.entity';
import { GeoBoundaryRepository } from '@domain/repositories/geo-boundary.repository';
import { ApplicationError } from '@application/errors/application.error';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import {
  filterBlocksByDistrict,
  filterBlocksByDistrictAndBlock,
  mapFeatureCollection,
} from './mappers/geojson-block.mapper';

const BLOCK_GEOJSON_URL = '/geojson/ARUNACHAL_PRADESH_BLOCK.geojson';

@Injectable({ providedIn: 'root' })
export class GeoJsonFileRepository extends GeoBoundaryRepository {
  private readonly http = inject(HttpClient);
  private cache$?: Observable<GeoBoundary[]>;

  loadBlockBoundaries(): Observable<GeoBoundary[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<{ features: unknown[] }>(BLOCK_GEOJSON_URL).pipe(
        map((raw) => mapFeatureCollection(raw as Parameters<typeof mapFeatureCollection>[0])),
        catchError(() =>
          throwError(
            () => new ApplicationError('Unable to load map boundaries.', 'GEOJSON_LOAD_FAILED')
          )
        ),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  getBlocksByDistrict(districtName: string): Observable<GeoBoundary[]> {
    return this.loadBlockBoundaries().pipe(
      map((blocks) => filterBlocksByDistrict(blocks, districtName))
    );
  }

  getBlockByName(districtName: string, blockName: string): Observable<GeoBoundary | null> {
    return this.loadBlockBoundaries().pipe(
      map((blocks) => {
        const targetDistrict = normalizeGeoName(districtName);
        const targetBlock = normalizeGeoName(blockName);
        return (
          blocks.find(
            (block) =>
              normalizeGeoName(block.districtName) === targetDistrict &&
              normalizeGeoName(block.name) === targetBlock
          ) ?? null
        );
      })
    );
  }
}
