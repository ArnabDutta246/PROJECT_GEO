import { Component, OnInit, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, IDefaultUser } from '../../../services/auth/auth';
import { Router } from '@angular/router';
import { HomeFacade } from './home.facade';
import { HomeMapComponent } from './components/home-map.component';
import { ProjectMapDetailCardComponent } from '@presentation/features/map/components/project-map-detail-card.component';
import { AreaSummaryCardComponent } from './components/area-summary-card.component';
import { SCHEME_TYPE_CATALOG } from '@domain/catalog/scheme-type.catalog';
import { ProjectPermissionService } from '@domain/services/project-permission.service';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import {
  PROJECT_CREATE_CONTEXT_KEY,
  serializeProjectCreateContext,
} from '@domain/value-objects/project-create-context.vo';
import { MapBaseLayerId } from '@infrastructure/geo/map-adapter';
import { ProjectSidebarItem } from './models/project-sidebar-item.vm';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, HomeMapComponent, ProjectMapDetailCardComponent, AreaSummaryCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  protected readonly facade = inject(HomeFacade);

  protected searchTerm = '';
  protected selectedYear = '2024';
  protected selectedStatus = 'Active';

  protected readonly schemeTypeCatalog = SCHEME_TYPE_CATALOG;

  readonly availableLayers = signal<
    Array<{ name: string; label: string; layerId: MapBaseLayerId }>
  >([
    { name: 'OpenStreetMap', label: 'Streets', layerId: 'streets' },
    { name: 'Satellite', label: 'Satellite', layerId: 'satellite' },
    { name: 'Light', label: 'Light', layerId: 'light' },
    { name: 'Terrain', label: 'Terrain', layerId: 'terrain' },
  ]);
  readonly currentLayerName = signal('OpenStreetMap');

  private readonly userProfile = signal<IDefaultUser | null>(null);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly projectPermission = new ProjectPermissionService();

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /** Re-evaluated each change-detection cycle so buttons appear after session loads. */
  protected canCreateProject(): boolean {
    const domainUser = this.getCurrentUser.execute();
    if (domainUser) {
      return this.projectPermission.canCreateProject(domainUser);
    }
    const legacy = this.authService.getCurrentLoginUser() ?? this.userProfile();
    return this.projectPermission.canCreateFromLegacyRole(legacy?.role, legacy?.permissions ?? []);
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.getUserProfile();
    await this.facade.initialize();
    void this.facade.mapFacadeRef.refreshMap();
  }

  protected get filteredProjects(): ProjectSidebarItem[] {
    const source = this.facade.projects();
    const keyword = this.searchTerm.trim().toLowerCase();

    if (!keyword) {
      return source;
    }

    return source.filter((project) => this.matchesKeyword(project, keyword));
  }

  onStateChange(stateId: number | null): void {
    void this.facade.onStateChange(stateId);
  }

  onDistrictIdChange(districtId: number | null): void {
    void this.facade.onDistrictChange(districtId);
  }

  onBlockIdChange(blockId: number | null): void {
    void this.facade.onBlockChange(blockId);
  }

  protected selectProject(project: ProjectSidebarItem): void {
    this.facade.selectProject(project);
  }

  protected selectLocationOnMap(project: ProjectSidebarItem): void {
    this.facade.selectProject(project);
  }

  protected openProjectInNewTab(project: ProjectSidebarItem): void {
    sessionStorage.setItem('selectedProjectData', JSON.stringify(project));
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/projects`, '_blank');
  }

  protected navigateToCreateProject(): void {
    if (!this.canCreateProject()) {
      return;
    }
    sessionStorage.setItem(
      PROJECT_CREATE_CONTEXT_KEY,
      serializeProjectCreateContext({
        mode: 'create',
        stateId: this.facade.selectedStateId(),
        districtId: this.facade.selectedDistrictId(),
        blockId: this.facade.selectedBlockId(),
        projectId: null,
      })
    );
    void this.router.navigate(['/projects']);
  }

  protected retryLoadProjects(): void {
    void this.facade.retryLoadProjects();
  }

  protected closeSummary(): void {
    this.facade.closeProjectSummary();
  }

  protected closeAreaSummary(): void {
    this.facade.mapFacadeRef.closeAreaSummary();
  }

  switchLayer(layerName: string): void {
    this.currentLayerName.set(layerName);
    const layer = this.availableLayers().find((item) => item.name === layerName);
    if (layer) {
      this.facade.mapFacadeRef.setBaseLayer(layer.layerId);
    }
  }

  isLayerActive(layerName: string): boolean {
    return this.currentLayerName() === layerName;
  }

  isProjectSelected(project: ProjectSidebarItem): boolean {
    const selectedId = this.facade.mapFacadeRef.selectedPinId();
    return !!selectedId && selectedId === project.id;
  }

  getSchemeIcon(project: ProjectSidebarItem): string {
    return project.schemeIcon;
  }

  getSchemeColor(project: ProjectSidebarItem): string {
    return project.schemeColor;
  }

  onSchemeTypeFilter(schemeType: string | null): void {
    void this.facade.onSchemeTypeChange(schemeType);
  }

  isSchemeTypeActive(schemeType: string | null): boolean {
    return this.facade.selectedSchemeType() === schemeType;
  }

  logout(): void {
    this.authService.logout();
    this.userProfile.set(null);
    this.router.navigate(['/login']);
  }

  private getUserProfile(): void {
    const user = this.authService.getCurrentLoginUser();
    if (user) {
      this.userProfile.set(user);
    }
  }

  private matchesKeyword(project: ProjectSidebarItem, keyword: string): boolean {
    return (
      project.title.toLowerCase().includes(keyword) ||
      project.subtitle.toLowerCase().includes(keyword) ||
      project.schemeLabel.toLowerCase().includes(keyword) ||
      project.code.toLowerCase().includes(keyword)
    );
  }
}
