import { Component, OnInit, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, IDefaultUser } from '../../../services/auth/auth';
import { Router } from '@angular/router';
import { IProjectData } from '../../../project/insert-update-project/insert-update-project';
import { Project as ProjectService } from '../../../services/project/project';
import { HomeFacade } from './home.facade';
import { HomeMapComponent } from './components/home-map.component';
import { ProjectSummaryPanelComponent } from './components/project-summary-panel.component';
import { AreaSummaryCardComponent } from './components/area-summary-card.component';
import {
  getSchemeTypeColor,
  getSchemeTypeMaterialIcon,
  SCHEME_TYPE_CATALOG,
} from '@domain/catalog/scheme-type.catalog';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, HomeMapComponent, ProjectSummaryPanelComponent, AreaSummaryCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  protected readonly facade = inject(HomeFacade);

  protected projects: IProjectData[] = [];
  protected searchTerm = '';
  protected selectedYear = '2024';
  protected selectedStatus = 'Active';

  protected readonly schemeTypeCatalog = SCHEME_TYPE_CATALOG;

  readonly availableLayers = signal([
    { name: 'OpenStreetMap', label: 'Streets' },
    { name: 'Satellite', label: 'Satellite' },
  ]);
  readonly currentLayerName = signal('OpenStreetMap');

  private readonly userProfile = signal<IDefaultUser | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly projectService: ProjectService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.projectService.initializeDummyData();
    this.getUserProfile();
    await this.facade.initialize();
    this.projects = this.facade.projects();
    void this.facade.mapFacadeRef.refreshMap();
  }

  protected get filteredProjects(): IProjectData[] {
    const source = this.facade.projects().length ? this.facade.projects() : this.projects;
    const keyword = this.searchTerm.trim().toLowerCase();

    if (!keyword) {
      return source;
    }

    return source.filter((project) => this.matchesKeyword(project, keyword));
  }

  onStateChange(stateId: number | null): void {
    void this.facade.onStateChange(stateId).then(() => {
      this.projects = this.facade.projects();
    });
  }

  onDistrictIdChange(districtId: number | null): void {
    void this.facade.onDistrictChange(districtId).then(() => {
      this.projects = this.facade.projects();
    });
  }

  onBlockIdChange(blockId: number | null): void {
    void this.facade.onBlockChange(blockId).then(() => {
      this.projects = this.facade.projects();
    });
  }

  protected selectProject(project: IProjectData): void {
    this.facade.selectProject(project);
  }

  protected selectLocationOnMap(project: IProjectData): void {
    this.facade.selectProject(project);
  }

  protected openProjectInNewTab(project: IProjectData): void {
    sessionStorage.setItem('selectedProjectData', JSON.stringify(project));
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/projects`, '_blank');
  }

  protected closeSummary(): void {
    this.facade.closeProjectSummary();
  }

  protected closeAreaSummary(): void {
    this.facade.mapFacadeRef.closeAreaSummary();
  }

  switchLayer(layerName: string): void {
    this.currentLayerName.set(layerName);
    this.facade.mapFacadeRef.setBaseLayer(layerName === 'Satellite' ? 'satellite' : 'osm');
  }

  isLayerActive(layerName: string): boolean {
    return this.currentLayerName() === layerName;
  }

  isProjectSelected(project: IProjectData): boolean {
    const selectedId = this.facade.mapFacadeRef.selectedPinId();
    if (!selectedId) {
      return false;
    }
    const pin = this.facade.mapFacadeRef.pins().find((item) => item.id === selectedId);
    return !!pin && pin.activityName === project.activityName && pin.locationName === project.locationName;
  }

  getSchemeIcon(schemeType: string): string {
    return getSchemeTypeMaterialIcon(schemeType);
  }

  getSchemeColor(schemeType: string): string {
    return getSchemeTypeColor(schemeType);
  }

  onSchemeTypeFilter(schemeType: string | null): void {
    void this.facade.onSchemeTypeChange(schemeType).then(() => {
      this.projects = this.facade.projects();
    });
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

  private matchesKeyword(project: IProjectData, keyword: string): boolean {
    return (
      project.activityName.toLowerCase().includes(keyword) ||
      project.locationName.toLowerCase().includes(keyword) ||
      project.schemeType.toLowerCase().includes(keyword) ||
      project.beneficiaryName.toLowerCase().includes(keyword)
    );
  }
}
