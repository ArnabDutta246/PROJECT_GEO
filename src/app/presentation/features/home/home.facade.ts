import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GetApplicableStatesUseCase } from '@application/geo/get-applicable-states.use-case';
import { GetApplicableDistrictsUseCase } from '@application/geo/get-applicable-districts.use-case';
import { GetApplicableBlocksUseCase } from '@application/geo/get-applicable-blocks.use-case';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { GetProjectsByJurisdictionUseCase } from '@application/projects/get-projects-by-jurisdiction.use-case';
import { User } from '@domain/entities/user.entity';
import { UserRole } from '@domain/value-objects/role.enum';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { LocalProjectRepository } from '@infrastructure/persistence/local-project.repository';
import { MapSelectionStore } from '@presentation/state/map-selection.store';
import { MapFacade } from '@presentation/features/map/map.facade';
import { FilterOptionViewModel } from './models/home.view-model';
import { IProjectData } from '../../../project/insert-update-project/insert-update-project';
import { PROJECT_REPOSITORY } from '@infrastructure/tokens/repository.tokens';
import { ProjectRepository } from '@domain/repositories/project.repository';

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
  readonly projects = signal<IProjectData[]>([]);

  readonly stateLocked = computed(() => this.states().length <= 1);
  readonly districtLocked = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.DistrictManager || user?.role === UserRole.BlockManager;
  });
  readonly blockLocked = computed(() => this.currentUser()?.role === UserRole.BlockManager);

  readonly districtNames = computed(() => this.districts().map((item) => item.label));
  readonly blockNames = computed(() => this.blocks().map((item) => item.label));

  private readonly currentUser = signal<User | null>(null);

  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly getStates = inject(GetApplicableStatesUseCase);
  private readonly getDistricts = inject(GetApplicableDistrictsUseCase);
  private readonly getBlocks = inject(GetApplicableBlocksUseCase);
  private readonly getProjects = inject(GetProjectsByJurisdictionUseCase);
  private readonly mapSelectionStore = inject(MapSelectionStore);
  private readonly mapFacade = inject(MapFacade);
  private readonly projectRepository = inject<ProjectRepository>(PROJECT_REPOSITORY);

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

  selectProject(project: IProjectData): void {
    this.mapFacade.focusLegacyProject({
      activityName: project.activityName,
      locationName: project.locationName,
      latitude: project.latitude ?? undefined,
      longitude: project.longitude ?? undefined,
    });
  }

  closeProjectSummary(): void {
    this.mapFacade.closeSummary();
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

    if (this.projectRepository instanceof LocalProjectRepository) {
      const legacy = await firstValueFrom(this.projectRepository.toLegacyProjects(user));
      const filtered = this.filterLegacyBySelection(legacy);
      this.projects.set(filtered);
      return;
    }

    const domainProjects = await firstValueFrom(
      this.getProjects.execute({
        districtName: this.mapSelectionStore.selectedDistrictName(),
        blockName: this.mapSelectionStore.selectedBlockName(),
      })
    );
    this.projects.set(this.filterLegacyBySelection(this.mapDomainProjects(domainProjects)));
  }

  private filterLegacyBySelection(projects: IProjectData[]): IProjectData[] {
    const districtName = this.mapSelectionStore.selectedDistrictName();
    const blockName = this.mapSelectionStore.selectedBlockName();

    let filtered = projects;
    if (districtName) {
      const district = normalizeGeoName(districtName);
      filtered = filtered.filter(
        (project) => normalizeGeoName(project.districtName) === district
      );
    }
    if (blockName) {
      const block = normalizeGeoName(blockName);
      filtered = filtered.filter((project) => normalizeGeoName(project.mouzaName) === block);
    }
    return filtered;
  }

  private mapDomainProjects(projects: import('@domain/entities/project.entity').Project[]): IProjectData[] {
    return projects.map((project) => ({
      projectName: project.projectName,
      activityName: project.activityName,
      schemeType: project.schemeType,
      locationName: project.locationName,
      latitude: project.coordinates.latitude,
      longitude: project.coordinates.longitude,
      aoiFile: null,
      beneficiaryName: project.beneficiaryName,
      beneficiaryDetails: project.beneficiaryDetails,
      estimatedCost: project.estimatedCost?.amount ?? 0,
      finalCost: project.finalCost?.amount ?? 0,
      fundType: project.fundType,
      selectedProjectName: project.projectName,
      newProjectName: '',
      selectedSchemeType: project.schemeType,
      newSchemeType: '',
      districtName: project.jurisdiction.districts[0] ?? '',
      mouzaName: project.jurisdiction.blocks[0] ?? '',
    }));
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
