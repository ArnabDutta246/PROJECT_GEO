export interface FilterOptionViewModel {
  id: number;
  label: string;
}

export interface HomeViewModel {
  states: FilterOptionViewModel[];
  districts: FilterOptionViewModel[];
  blocks: FilterOptionViewModel[];
  selectedStateId: number | null;
  selectedDistrictId: number | null;
  selectedBlockId: number | null;
  stateLocked: boolean;
  districtLocked: boolean;
  blockLocked: boolean;
  filtersLoading: boolean;
  filtersError: string | null;
  projectCount: number;
}
