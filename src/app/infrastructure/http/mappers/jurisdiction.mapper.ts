import { BlockOption, DistrictOption, StateOption } from '@domain/entities/applicable-area.entity';
import { BlockItemDto, DistrictItemDto, StateItemDto } from '../dto/login.dto';

export function normalizeGeoName(name: string): string {
  return name.trim().toUpperCase();
}

export function mapStateItem(dto: StateItemDto): StateOption {
  return new StateOption(dto.tsm_state_id, dto.tsm_state_name);
}

export function mapDistrictItem(dto: DistrictItemDto): DistrictOption {
  return new DistrictOption(dto.tdm_district_id, dto.tdm_district_name, dto.tsm_state_id ?? 0);
}

export function mapBlockItem(dto: BlockItemDto): BlockOption {
  return new BlockOption(
    dto.tbm_block_id,
    dto.tbm_block_name,
    dto.tdm_district_id ?? 0,
    dto.tsm_state_id ?? 0
  );
}
