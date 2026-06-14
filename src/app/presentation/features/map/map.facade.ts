import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { User } from '@domain/entities/user.entity';
import { Project } from '@domain/entities/project.entity';
import { GeoBoundary } from '@domain/entities/geo-boundary.entity';
import { GeoScope } from '@domain/value-objects/geo-scope.vo';
import { UserRole } from '@domain/value-objects/role.enum';
import { MapBounds } from '@domain/value-objects/map-bounds.vo';
import { ProjectPin } from '@domain/value-objects/project-pin.vo';
import { GetAreaSummaryUseCase } from '@application/analytics/get-area-summary.use-case';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { LoadBlockBoundariesUseCase } from '@application/geo/load-block-boundaries.use-case';
import { GetMappableProjectsUseCase } from '@application/map/get-mappable-projects.use-case';
import {
  getSchemeTypeColor,
  getSchemeTypeMaterialIcon,
  getSchemeTypeLabel,
  matchesSchemeTypeFilter,
} from '@domain/catalog/scheme-type.catalog';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';
import { MAP_ADAPTER } from '@infrastructure/tokens/repository.tokens';
import {
  BlockLayerInput,
  MapAdapter,
  MapBaseLayerId,
  ProjectMarkerInput,
} from '@infrastructure/geo/map-adapter';
import { MapSelectionStore } from '@presentation/state/map-selection.store';
import { AreaSummaryViewModel } from './models/area-summary.view-model';
import {
  projectMapDetailCardFromPin,
  projectMapDetailCardFromProject,
  ProjectMapDetailCardViewModel,
} from './models/project-map-detail-card.view-model';

const AP_CENTER: [number, number] = [28.2, 94.5];
const AP_DEFAULT_ZOOM = 8;
const DEFAULT_STATE_NAME = 'Arunachal Pradesh';

@Injectable({ providedIn: 'root' })
export class MapFacade {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pins = signal<ProjectPin[]>([]);
  readonly blockLayerReady = signal(false);
  readonly summaryOpen = signal(false);
  readonly selectedPinId = signal<string | null>(null);
  readonly summary = signal<ProjectMapDetailCardViewModel | null>(null);
  readonly areaSummary = signal<AreaSummaryViewModel | null>(null);
  readonly areaSummaryLoading = signal(false);
  readonly hasAreaSelection = computed(
    () => this.areaSummaryLoading() || this.areaSummary() !== null
  );

  private readonly platformId = inject(PLATFORM_ID);
  private readonly mapAdapter = inject<MapAdapter>(MAP_ADAPTER);
  private readonly mapSelectionStore = inject(MapSelectionStore);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly loadBlocks = inject(LoadBlockBoundariesUseCase);
  private readonly getMappableProjects = inject(GetMappableProjectsUseCase);
  private readonly getAreaSummary = inject(GetAreaSummaryUseCase);

  private container: HTMLElement | null = null;
  private initialized = false;
  private currentBlocks: GeoBoundary[] = [];
  private allPins: ProjectPin[] = [];
  private projectsById = new Map<string, Project>();

  async initialize(container: HTMLElement): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.container = container;
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.mapAdapter.initialize(container, {
        center: AP_CENTER,
        zoom: AP_DEFAULT_ZOOM,
      });

      this.mapAdapter.onMarkerClick((projectId) => this.openSummary(projectId));
      this.mapAdapter.onBlockClick((blockId, blockName) => {
        void this.handleBlockSelection(blockId, blockName);
      });
      this.mapAdapter.onDistrictClick((districtName) => {
        void this.handleDistrictSelection(districtName);
      });
      this.mapAdapter.onMapClick(({ latitude, longitude }) => {
        void this.handleMapAreaClick(latitude, longitude);
      });

      this.initialized = true;
      await this.refreshMap();
    } catch (err) {
      this.error.set(this.readError(err));
    } finally {
      this.loading.set(false);
    }
  }

  async refreshMap(): Promise<void> {
    if (!this.initialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const user = this.getCurrentUser.execute();
    if (!user) {
      this.pins.set([]);
      this.mapAdapter.setProjectMarkers([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const districtName = this.mapSelectionStore.selectedDistrictName();
      const blockName = this.mapSelectionStore.selectedBlockName();
      const scopedBlocks = await this.resolveBlocksForUser(user, districtName, blockName);
      this.currentBlocks = scopedBlocks;
      this.renderBlockLayer(scopedBlocks, blockName);
      this.blockLayerReady.set(true);

      const { pins, projects } = await firstValueFrom(
        this.getMappableProjects.execute({ districtName, blockName })
      );
      this.allPins = pins;
      this.projectsById = new Map(projects.map((project) => [project.id, project]));
      this.applySchemeTypeFilter();
      this.fitViewport(user, scopedBlocks);
    } catch (err) {
      this.error.set(this.readError(err));
      this.mapAdapter.setProjectMarkers([]);
    } finally {
      this.loading.set(false);
    }
  }

  focusProject(projectId: string): void {
    const pin = this.pins().find((item) => item.id === projectId);
    if (!pin) {
      return;
    }
    this.mapAdapter.focusMarker(projectId);
    this.openSummary(projectId);
  }

  focusProjectPin(match: {
    id: string;
    activityName: string;
    locationName: string;
    latitude?: number | null;
    longitude?: number | null;
    schemeType?: string;
  }): void {
    const pin =
      this.pins().find((item) => item.id === match.id) ??
      this.pins().find(
        (item) =>
          item.activityName === match.activityName &&
          item.locationName === match.locationName
      ) ??
      this.pins().find(
        (item) =>
          match.latitude != null &&
          match.longitude != null &&
          item.coordinates.latitude === match.latitude &&
          item.coordinates.longitude === match.longitude
      );

    if (pin) {
      this.focusProject(pin.id);
    }
  }

  focusLegacyProject(match: {
    activityName: string;
    locationName: string;
    latitude?: number | null;
    longitude?: number | null;
  }): void {
    this.focusProjectPin({
      id: '',
      activityName: match.activityName,
      locationName: match.locationName,
      latitude: match.latitude,
      longitude: match.longitude,
    });
  }

  closeSummary(): void {
    this.summaryOpen.set(false);
    this.selectedPinId.set(null);
    this.summary.set(null);
    this.mapSelectionStore.clearProjectSelection();
  }

  closeAreaSummary(): void {
    this.areaSummary.set(null);
    this.areaSummaryLoading.set(false);
  }

  onFiltersChanged(): void {
    if (this.summaryOpen()) {
      this.closeSummary();
    }
    if (this.hasAreaSelection()) {
      this.closeAreaSummary();
    }
    void this.refreshMap();
  }

  onSchemeTypeFilterChanged(): void {
    this.applySchemeTypeFilter();
    if (this.summaryOpen()) {
      const selectedId = this.selectedPinId();
      if (selectedId && !this.pins().some((pin) => pin.id === selectedId)) {
        this.closeSummary();
      }
    }
  }

  destroy(): void {
    this.closeAreaSummary();
    this.closeSummary();
    this.mapAdapter.destroy();
    this.initialized = false;
    this.container = null;
    this.currentBlocks = [];
  }

  setBaseLayer(layerId: MapBaseLayerId): void {
    this.mapAdapter.setBaseLayer(layerId);
  }

  invalidateSize(): void {
    this.mapAdapter.invalidateSize();
  }

  private openSummary(projectId: string): void {
    const pin = this.pins().find((item) => item.id === projectId);
    if (!pin) {
      return;
    }
    const project = this.projectsById.get(projectId);
    this.selectedPinId.set(projectId);
    this.summary.set(
      project ? projectMapDetailCardFromProject(project) : projectMapDetailCardFromPin(pin)
    );
    this.summaryOpen.set(true);
    this.mapSelectionStore.selectProject(projectId);
  }

  private async handleBlockSelection(blockId: string, blockName: string): Promise<void> {
    const block =
      this.currentBlocks.find((item) => item.id === blockId) ??
      this.currentBlocks.find(
        (item) => normalizeGeoName(item.name) === normalizeGeoName(blockName)
      );

    if (!block) {
      return;
    }

    this.mapAdapter.highlightBlock(block.id);
    const scope = GeoScope.block(DEFAULT_STATE_NAME, block.districtName, block.name);
    await this.openAreaSummary(scope);
  }

  private async handleDistrictSelection(districtName: string): Promise<void> {
    const scope = GeoScope.district(DEFAULT_STATE_NAME, districtName);
    await this.openAreaSummary(scope);
  }

  private async handleMapAreaClick(latitude: number, longitude: number): Promise<void> {
    const resolved = this.mapAdapter.resolveBlockAt(latitude, longitude);
    if (!resolved) {
      return;
    }
    await this.handleBlockSelection(resolved.blockId, resolved.blockName);
  }

  private async openAreaSummary(scope: GeoScope): Promise<void> {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return;
    }

    this.areaSummaryLoading.set(true);

    try {
      const summary = await firstValueFrom(this.getAreaSummary.execute(scope));
      if (!summary) {
        this.closeAreaSummary();
        return;
      }
      this.areaSummary.set(AreaSummaryViewModel.fromEntity(summary));
    } catch (err) {
      this.error.set(this.readError(err));
      this.closeAreaSummary();
    } finally {
      this.areaSummaryLoading.set(false);
    }
  }

  private async resolveBlocksForUser(
    user: User,
    districtName: string | null,
    blockName: string | null
  ): Promise<GeoBoundary[]> {
    let blocks = await firstValueFrom(this.loadBlocks.execute({ districtName, blockName }));

    if (user.role === UserRole.DistrictManager) {
      const allowedDistricts = user.jurisdiction.districts.filter((name) => name !== 'ALL');
      blocks = blocks.filter((block) =>
        allowedDistricts.some(
          (district) => normalizeGeoName(district) === normalizeGeoName(block.districtName)
        )
      );
    }

    if (user.role === UserRole.BlockManager) {
      const allowedBlocks = user.jurisdiction.blocks.filter((name) => name !== 'ALL');
      blocks = blocks.filter((block) =>
        allowedBlocks.some((name) => normalizeGeoName(name) === normalizeGeoName(block.name))
      );
    }

    return blocks;
  }

  private renderBlockLayer(blocks: GeoBoundary[], selectedBlockName: string | null): void {
    const selectedBlock = selectedBlockName
      ? blocks.find((block) => normalizeGeoName(block.name) === normalizeGeoName(selectedBlockName))
      : null;

    const layerInput: BlockLayerInput[] = blocks.map((block) => ({
      id: block.id,
      geometry: block.geometry,
      name: block.name,
      districtName: block.districtName,
      style: selectedBlock && block.id === selectedBlock.id ? 'highlight' : 'default',
    }));

    this.mapAdapter.setBlockLayer(layerInput);
    this.mapAdapter.highlightBlock(selectedBlock?.id ?? null);
  }

  private renderMarkers(pins: ProjectPin[]): void {
    const markers: ProjectMarkerInput[] = pins.map((pin) => {
      const schemeLabel = getSchemeTypeLabel(pin.schemeType);
      const locationSuffix = pin.locationName.trim()
        ? pin.locationName
        : 'Location unavailable';

      return {
        id: pin.id,
        latitude: pin.coordinates.latitude,
        longitude: pin.coordinates.longitude,
        label: pin.projectName,
        tooltip: `${pin.projectName} — ${locationSuffix} (${schemeLabel})`,
        schemeType: pin.schemeType,
        materialIcon: getSchemeTypeMaterialIcon(pin.schemeType),
        color: getSchemeTypeColor(pin.schemeType),
      };
    });
    this.mapAdapter.setProjectMarkers(markers);
  }

  private applySchemeTypeFilter(): void {
    const schemeFilter = this.mapSelectionStore.selectedSchemeType();
    const filtered = this.allPins.filter((pin) =>
      matchesSchemeTypeFilter(pin.schemeType, schemeFilter)
    );
    this.pins.set(filtered);
    this.renderMarkers(filtered);
  }

  private fitViewport(user: User, blocks: GeoBoundary[]): void {
    const bounds = MapBounds.fromGeoBoundaries(blocks);
    if (bounds) {
      this.mapAdapter.fitBounds({
        southWest: [bounds.southWest.latitude, bounds.southWest.longitude],
        northEast: [bounds.northEast.latitude, bounds.northEast.longitude],
      });
    } else {
      this.mapAdapter.fitBounds({
        southWest: [26.5, 91.5],
        northEast: [29.5, 97.5],
      });
    }
    this.mapAdapter.invalidateSize();
  }

  private readError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unable to load map data.';
  }
}
