import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MapSelectionStore {
  readonly selectedStateId = signal<number | null>(null);
  readonly selectedDistrictId = signal<number | null>(null);
  readonly selectedBlockId = signal<number | null>(null);
  readonly selectedStateName = signal<string | null>(null);
  readonly selectedDistrictName = signal<string | null>(null);
  readonly selectedBlockName = signal<string | null>(null);
  readonly selectedLayerName = signal<string | null>(null);
  readonly selectedProjectId = signal<string | null>(null);

  readonly hasDistrictSelection = computed(() => this.selectedDistrictId() != null);
  readonly hasBlockSelection = computed(() => this.selectedBlockId() != null);

  selectState(stateId: number | null, stateName: string | null): void {
    this.selectedStateId.set(stateId);
    this.selectedStateName.set(stateName);
    this.clearDistrict();
  }

  selectDistrict(districtId: number | null, districtName: string | null): void {
    this.selectedDistrictId.set(districtId);
    this.selectedDistrictName.set(districtName);
    this.clearBlock();
  }

  selectBlock(blockId: number | null, blockName: string | null): void {
    this.selectedBlockId.set(blockId);
    this.selectedBlockName.set(blockName);
  }

  selectLayer(layerName: string | null): void {
    this.selectedLayerName.set(layerName);
  }

  selectProject(projectId: string | null): void {
    this.selectedProjectId.set(projectId);
  }

  clearProjectSelection(): void {
    this.selectedProjectId.set(null);
  }

  clearDistrict(): void {
    this.selectedDistrictId.set(null);
    this.selectedDistrictName.set(null);
    this.clearBlock();
  }

  clearBlock(): void {
    this.selectedBlockId.set(null);
    this.selectedBlockName.set(null);
  }
}
