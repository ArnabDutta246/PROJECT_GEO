import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  BlockOption,
  DistrictOption,
  StateOption,
} from '@domain/entities/applicable-area.entity';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { SessionRepository } from '@domain/repositories/session.repository';
import { UserRole } from '@domain/value-objects/role.enum';
import { SESSION_REPOSITORY } from '../tokens/repository.tokens';

const LOCAL_STATE_ID = 12;
const LOCAL_STATE_NAME = 'ARUNACHAL PRADESH';

const LOCAL_DISTRICTS: Record<string, number> = {
  'DIBANG VALLEY': 1,
  CHANGLANG: 2,
  TAWANG: 3,
  'WEST KAMENG': 4,
};

const LOCAL_BLOCKS: Record<string, Record<string, number>> = {
  'DIBANG VALLEY': { ANINI: 101, MUNNAI: 102 },
  CHANGLANG: { CHANGLANG: 201, BORDUMSA: 202 },
};

@Injectable()
export class LocalJurisdictionRepository extends ApplicableAreaRepository {
  private readonly sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);

  getStates(_userId: string, _stateId = 0): Observable<StateOption[]> {
    return of([new StateOption(LOCAL_STATE_ID, LOCAL_STATE_NAME)]);
  }

  getDistricts(_userId: string, _stateId: number, _districtId = 0): Observable<DistrictOption[]> {
    const user = this.sessionRepository.getUser();
    if (!user) {
      return of([]);
    }

    const allDistricts = Object.entries(LOCAL_DISTRICTS).map(
      ([name, id]) => new DistrictOption(id, name, LOCAL_STATE_ID)
    );

    if (user.role === UserRole.Admin || user.role === UserRole.StateManager) {
      return of(allDistricts);
    }

    const scoped = user.jurisdiction.districts.includes('ALL')
      ? allDistricts
      : allDistricts.filter((district) =>
          user.jurisdiction.districts.some(
            (allowed) => allowed.toUpperCase() === district.name.toUpperCase()
          )
        );

    return of(scoped);
  }

  getBlocks(
    _userId: string,
    stateId: number,
    districtId: number,
    _blockId = 0
  ): Observable<BlockOption[]> {
    const user = this.sessionRepository.getUser();
    if (!user) {
      return of([]);
    }

    const districtName = Object.entries(LOCAL_DISTRICTS).find(([, id]) => id === districtId)?.[0];
    if (!districtName) {
      return of([]);
    }

    const blocksForDistrict = LOCAL_BLOCKS[districtName] ?? {};
    const allBlocks = Object.entries(blocksForDistrict).map(
      ([name, id]) => new BlockOption(id, name, districtId, stateId)
    );

    if (user.role === UserRole.BlockManager) {
      const scoped = user.jurisdiction.blocks.includes('ALL')
        ? allBlocks
        : allBlocks.filter((block) =>
            user.jurisdiction.blocks.some(
              (allowed) => allowed.toUpperCase() === block.name.toUpperCase()
            )
          );
      return of(scoped);
    }

    return of(allBlocks);
  }
}
