import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetApplicableStatesUseCase } from '@application/geo/get-applicable-states.use-case';
import { GetApplicableDistrictsUseCase } from '@application/geo/get-applicable-districts.use-case';
import { GetApplicableBlocksUseCase } from '@application/geo/get-applicable-blocks.use-case';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { GetProjectListUseCase } from '@application/projects/get-project-list.use-case';
import { User } from '@domain/entities/user.entity';
import { UserRole } from '@domain/value-objects/role.enum';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { MapSelectionStore } from '@presentation/state/map-selection.store';
import { MapFacade } from '@presentation/features/map/map.facade';
import { FilterOptionViewModel } from './models/home.view-model';
import {
  ProjectSidebarItem,
  projectSidebarItemFromProject,
} from './models/project-sidebar-item.vm';
import { matchesSchemeTypeFilter } from '@domain/catalog/scheme-type.catalog';

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  readonly states = signal<FilterOptionViewModel[]>([]);
  readonly districts = signal<FilterOptionViewModel[]>([]);
  readonly blocks = signal<FilterOptionViewModel[]>([]);
  readonly selectedStateId = signal<number | null>(null);
  readonly selectedDistrictId = signal<number | null>(null);
  readonly selectedBlockId = signal<number | null>(null);
  readonly filtersLoading = signal(false);
  readonly filtersError = signal<string | null>(null);
  readonly projectsLoading = signal(false);
  readonly projectsError = signal<string | null>(null);
  readonly projects = signal<ProjectSidebarItem[]>([]);

  readonly stateLocked = computed(() => this.states().length <= 1);
  readonly districtLocked = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.DistrictManager || user?.role === UserRole.BlockManager;
  });
  readonly blockLocked = computed(() => this.currentUser()?.role === UserRole.BlockManager);

  readonly districtNames = computed(() => this.districts().map((item) => item.label));
  readonly blockNames = computed(() => this.blocks().map((item) => item.label));
  readonly selectedSchemeType = computed(() => this.mapSelectionStore.selectedSchemeType());

  private readonly currentUser = signal<User | null>(null);

  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly getStates = inject(GetApplicableStatesUseCase);
  private readonly getDistricts = inject(GetApplicableDistrictsUseCase);
  private readonly getBlocks = inject(GetApplicableBlocksUseCase);
  private readonly getProjectList = inject(GetProjectListUseCase);
  private readonly mapSelectionStore = inject(MapSelectionStore);
  private readonly mapFacade = inject(MapFacade);

  async initialize(): Promise<void> {
    this.filtersLoading.set(true);
    this.filtersError.set(null);

    try {
      const user = this.getCurrentUser.execute();
      this.currentUser.set(user);
      if (!user) {
        return;
      }

      const stateOptions = await firstValueFrom(this.getStates.execute(0));
      this.states.set(stateOptions.map((item) => ({ id: item.id, label: item.name })));

      const initialState = stateOptions[0] ?? null;
      if (initialState) {
        this.selectedStateId.set(initialState.id);
        this.mapSelectionStore.selectState(initialState.id, initialState.name);
        await this.loadDistricts(initialState.id, user);
        await this.loadProjectsForSelection();
      }
    } catch (error) {
      this.filtersError.set(this.readError(error));
    } finally {
      this.filtersLoading.set(false);
    }
  }

  async onStateChange(stateId: number | null): Promise<void> {
    if (!stateId) {
      this.resetBelowState();
      this.mapFacade.onFiltersChanged();
      return;
    }

    const state = this.states().find((item) => item.id === stateId);
    this.selectedStateId.set(stateId);
    this.mapSelectionStore.selectState(stateId, state?.label ?? null);

    const user = this.currentUser();
    if (user) {
      await this.loadDistricts(stateId, user);
      await this.loadProjectsForSelection();
      this.mapFacade.onFiltersChanged();
    }
  }

  async onDistrictChange(districtId: number | null): Promise<void> {
    if (!districtId) {
      this.selectedDistrictId.set(null);
      this.blocks.set([]);
      this.selectedBlockId.set(null);
      this.mapSelectionStore.clearDistrict();
      await this.loadProjectsForSelection();
      this.mapFacade.onFiltersChanged();
      return;
    }

    const district = this.districts().find((item) => item.id === districtId);
    this.selectedDistrictId.set(districtId);
    this.mapSelectionStore.selectDistrict(districtId, district?.label ?? null);

    const stateId = this.selectedStateId();
    if (stateId) {
      await this.loadBlocks(stateId, districtId);
    }
    await this.loadProjectsForSelection();
    this.mapFacade.onFiltersChanged();
  }

  async onBlockChange(blockId: number | null): Promise<void> {
    if (!blockId) {
      this.selectedBlockId.set(null);
      this.mapSelectionStore.clearBlock();
      await this.loadProjectsForSelection();
      this.mapFacade.onFiltersChanged();
      return;
    }

    const block = this.blocks().find((item) => item.id === blockId);
    this.selectedBlockId.set(blockId);
    this.mapSelectionStore.selectBlock(blockId, block?.label ?? null);
    await this.loadProjectsForSelection();
    this.mapFacade.onFiltersChanged();
  }

  selectProject(project: ProjectSidebarItem): void {
    this.mapFacade.focusProjectPin({
      id: project.id,
      activityName: project.activityName,
      locationName: project.locationName,
      latitude: project.latitude,
      longitude: project.longitude,
      schemeType: project.schemeType,
    });
  }

  async retryLoadProjects(): Promise<void> {
    await this.loadProjectsForSelection();
  }

  closeProjectSummary(): void {
    this.mapFacade.closeSummary();
  }

  onSchemeTypeChange(schemeType: string | null): Promise<void> {
    this.mapSelectionStore.selectSchemeType(schemeType);
    this.mapFacade.onSchemeTypeFilterChanged();
    return this.loadProjectsForSelection();
  }

  readonly mapFacadeRef = this.mapFacade;

  getSelectedDistrictName(): string {
    return this.mapSelectionStore.selectedDistrictName() ?? '';
  }

  getSelectedBlockName(): string {
    return this.mapSelectionStore.selectedBlockName() ?? '';
  }

  private async loadDistricts(stateId: number, user: User): Promise<void> {
    const districtOptions = await firstValueFrom(this.getDistricts.execute(stateId, 0));
    this.districts.set(districtOptions.map((item) => ({ id: item.id, label: item.name })));
    this.blocks.set([]);
    this.selectedBlockId.set(null);

    const preselectedDistrict = this.resolvePreselectedDistrict(user, districtOptions.map((d) => d.name));
    if (preselectedDistrict) {
      this.selectedDistrictId.set(preselectedDistrict.id);
      this.mapSelectionStore.selectDistrict(preselectedDistrict.id, preselectedDistrict.label);
      await this.loadBlocks(stateId, preselectedDistrict.id);

      if (user.role === UserRole.BlockManager) {
        const preselectedBlock = this.resolvePreselectedBlock(user, this.blocks());
        if (preselectedBlock) {
          this.selectedBlockId.set(preselectedBlock.id);
          this.mapSelectionStore.selectBlock(preselectedBlock.id, preselectedBlock.label);
        }
      }
    } else {
      this.selectedDistrictId.set(null);
      this.mapSelectionStore.clearDistrict();
    }
  }

  private async loadBlocks(stateId: number, districtId: number): Promise<void> {
    const blockOptions = await firstValueFrom(this.getBlocks.execute(stateId, districtId, 0));
    this.blocks.set(blockOptions.map((item) => ({ id: item.id, label: item.name })));
  }

  private async loadProjectsForSelection(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      this.projects.set([]);
      return;
    }

    this.projectsLoading.set(true);
    this.projectsError.set(null);

    try {
      const domainProjects = await firstValueFrom(this.getProjectList.execute());
      const sidebarItems = domainProjects.map(projectSidebarItemFromProject);
      this.projects.set(this.filterSidebarBySelection(sidebarItems, domainProjects));
    } catch (error) {
      this.projectsError.set(this.readError(error));
      this.projects.set([]);
    } finally {
      this.projectsLoading.set(false);
    }
  }

  private filterSidebarBySelection(
    items: ProjectSidebarItem[],
    domainProjects: import('@domain/entities/project.entity').Project[]
  ): ProjectSidebarItem[] {
    const districtName = this.mapSelectionStore.selectedDistrictName();
    const blockName = this.mapSelectionStore.selectedBlockName();
    const projectById = new Map(domainProjects.map((project) => [project.id, project]));

    let filtered = items;
    if (districtName) {
      const district = normalizeGeoName(districtName);
      filtered = filtered.filter((item) => {
        const project = projectById.get(item.id);
        return project?.jurisdiction.districts.some(
          (name) => normalizeGeoName(name) === district
        );
      });
    }
    if (blockName) {
      const block = normalizeGeoName(blockName);
      filtered = filtered.filter((item) => {
        const project = projectById.get(item.id);
        return project?.jurisdiction.blocks.some((name) => normalizeGeoName(name) === block);
      });
    }

    const schemeType = this.mapSelectionStore.selectedSchemeType();
    if (schemeType) {
      filtered = filtered.filter((item) => matchesSchemeTypeFilter(item.schemeType, schemeType));
    }

    return filtered;
  }

  private resolvePreselectedDistrict(
    user: User,
    available: string[]
  ): FilterOptionViewModel | null {
    if (user.role === UserRole.Admin || user.role === UserRole.StateManager) {
      return null;
    }

    const target = user.jurisdiction.districts.find((name) => name !== 'ALL');
    if (!target) {
      return null;
    }

    return (
      this.districts().find(
        (district) => normalizeGeoName(district.label) === normalizeGeoName(target)
      ) ?? null
    );
  }

  private resolvePreselectedBlock(
    user: User,
    available: FilterOptionViewModel[]
  ): FilterOptionViewModel | null {
    const target = user.jurisdiction.blocks.find((name) => name !== 'ALL');
    if (!target) {
      return null;
    }
    return (
      available.find((block) => normalizeGeoName(block.label) === normalizeGeoName(target)) ?? null
    );
  }

  private resetBelowState(): void {
    this.districts.set([]);
    this.blocks.set([]);
    this.selectedDistrictId.set(null);
    this.selectedBlockId.set(null);
    this.mapSelectionStore.clearDistrict();
  }

  private readError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unable to load dashboard filters.';
  }
}
