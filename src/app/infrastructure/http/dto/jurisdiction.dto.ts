import { ApiEnvelope } from './api-envelope.dto';
import { BlockItemDto, DistrictItemDto, StateItemDto } from './login.dto';

export type { BlockItemDto, DistrictItemDto, StateItemDto };

export interface ApplicableStateResponseDto extends ApiEnvelope<null> {
  state: StateItemDto[];
}

export interface ApplicableDistrictResponseDto extends ApiEnvelope<null> {
  district: DistrictItemDto[];
}

export interface ApplicableBlockResponseDto extends ApiEnvelope<null> {
  block: BlockItemDto[];
}
