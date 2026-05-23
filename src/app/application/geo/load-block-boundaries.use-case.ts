import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GeoBoundary } from '@domain/entities/geo-boundary.entity';
import { GeoBoundaryRepository } from '@domain/repositories/geo-boundary.repository';
import { GEO_BOUNDARY_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { filterBlocksByDistrictAndBlock } from '@infrastructure/geo/mappers/geojson-block.mapper';

export interface LoadBlockBoundariesInput {
  districtName?: string | null;
  blockName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoadBlockBoundariesUseCase {
  private readonly geoBoundaryRepository = inject<GeoBoundaryRepository>(
    GEO_BOUNDARY_REPOSITORY
  );

  execute(input: LoadBlockBoundariesInput = {}): Observable<GeoBoundary[]> {
    return this.geoBoundaryRepository.loadBlockBoundaries().pipe(
      map((blocks) =>
        filterBlocksByDistrictAndBlock(blocks, input.districtName, input.blockName)
      )
    );
  }
}
