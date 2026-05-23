import { Observable } from 'rxjs';
import { BlockOption, DistrictOption, StateOption } from '../entities/applicable-area.entity';

export abstract class ApplicableAreaRepository {
  abstract getStates(userId: string, stateId?: number): Observable<StateOption[]>;
  abstract getDistricts(userId: string, stateId: number, districtId?: number): Observable<DistrictOption[]>;
  abstract getBlocks(
    userId: string,
    stateId: number,
    districtId: number,
    blockId?: number
  ): Observable<BlockOption[]>;
}
