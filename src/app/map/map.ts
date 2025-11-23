import { Component, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, OnDestroy, ViewEncapsulation, NgZone, ViewChild, ElementRef, ApplicationRef, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MapSelectionService } from '../map-selection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div id="map"></div>
    <!-- <div *ngIf="showInfoPanel" id="infoPanel" class="info-panel" style="position: fixed !important; bottom: 20px !important; right: 20px !important; width: 250px !important; background: white !important; border: 2px solid #0066cc !important; border-radius: 8px !important; padding: 15px !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important; z-index: 99999 !important;">
      <button (click)="hideInfoPanel()" style="position: absolute; top: 8px; right: 8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
      <h4 style="margin: 0 0 12px 0; color: #0066cc; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; padding-right: 30px;">Selected Information</h4>
      <div style="margin: 8px 0; font-size: 13px;">
        <strong style="color: #333; display: inline-block; width: 90px;">State:</strong> 
        <span style="color: #666;">Arunachal Pradesh</span>
      </div>
      <div style="margin: 8px 0; font-size: 13px;">
        <strong style="color: #333; display: inline-block; width: 90px;">District:</strong> 
        <span id="selectedDistrict" style="color: #0066cc; font-weight: bold;">{{ selectedDistrict || 'None' }}</span>
      </div>
      <div style="margin: 8px 0; font-size: 13px;">
        <strong style="color: #333; display: inline-block; width: 90px;">Mouza Count:</strong> 
        <span id="mouzaCount" style="color: #28a745; font-weight: bold;">{{ mouzaCount }}</span>
      </div>
      <div style="margin: 8px 0; font-size: 13px;">
        <strong style="color: #333; display: inline-block; width: 90px;">Selected Mouza:</strong> 
        <span id="selectedMouza" style="color: #dc3545; font-weight: bold;">{{ selectedMouza || 'None' }}</span>
      </div>
    </div> -->
    <!-- Location Details Panel - Always in DOM, visibility controlled by style -->
    <div #locationDetailsPanel
         class="location-details-panel"
         [style.left.px]="panelPosition.x"
         [style.top.px]="panelPosition.y"
         [style.transform]="'none'"
         [style.display]="shouldShowPanelValue ? 'flex' : 'none'"
         [style.visibility]="shouldShowPanelValue ? 'visible' : 'hidden'"
         [attr.data-visible]="shouldShowPanelValue">
      <div class="panel-drag-handle" 
           (mousedown)="startDrag($event)"
           (touchstart)="startDrag($event)">
        <button class="close-location-details" 
                title="Close" 
                (click)="hideLocationDetailsPanel()"
                (mousedown)="$event.stopPropagation()"
                (touchstart)="$event.stopPropagation()">×</button>
        <h4 class="location-title">{{ selectedLocation()?.name }}</h4>
        
      </div>
      <div class="location-info">
        <!-- Tab Navigation -->
         <div style="display:flex; align-items:center; justify-content:flex-end;">
           <a  href="/projects" class="projects-link" target="_blank" style="color:#0066cc; text-decoration:none; font-weight:500; font-size:13px;">
             View Project Details
           </a>
           <i class="fas fa-external-link-alt" style="color:#0066cc"></i>
         </div>
        <div class="tab-navigation">
          <button class="tab-button" 
                  [class.active]="activeTab === 'info'"
                  (click)="setActiveTab('info')">
            INFO
          </button>
          <button class="tab-button" 
                  [class.active]="activeTab === 'beneficiaries'"
                  (click)="setActiveTab('beneficiaries')">
            BENEFICIERIES DETAILS
          </button>
          <button class="tab-button" 
                  [class.active]="activeTab === 'documentation'"
                  (click)="setActiveTab('documentation')">
            DOCUMENTATION
          </button>
          <button class="tab-button" 
                  [class.active]="activeTab === 'photovideo'"
                  (click)="setActiveTab('photovideo')">
            PHOTO & VIDEOGRAPHY
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- INFO Tab -->
          <div *ngIf="activeTab === 'info'" [class.active]="activeTab === 'info'"  class="tab-pane">
            <div class="location-type" [style.background-color]="getTypeColor(selectedLocation()?.type)">
              <strong>Type:</strong> 
              <span>{{ getTypeLabel(selectedLocation()?.type) }}</span>
            </div>
            <div class="location-coords">
              <strong>Coordinates:</strong> 
              <span>{{ selectedLocation()?.latitude?.toFixed(4) }}, {{ selectedLocation()?.longitude?.toFixed(4) }}</span>
            </div>
            <div class="location-description">
              <strong>Description:</strong>
              <p>{{ selectedLocation()?.description }}</p>
            </div>
          </div>

          <!-- BENEFICIERIES DETAILS Tab -->
          <div *ngIf="activeTab === 'beneficiaries'" [class.active]="activeTab === 'beneficiaries'" class="tab-pane">
            <div class="tab-section">
              <h5>Beneficiaries Information</h5>
              <p class="text-muted">Beneficiaries details will be displayed here.</p>
              <div style="padding: 20px; background: #f8f9fa; border-radius: 6px; margin-top: 15px;">
                <p style="color: #666; margin: 0;">Content area for beneficiaries information</p>
              </div>
            </div>
          </div>

          <!-- DOCUMENTATION Tab -->
          <div *ngIf="activeTab === 'documentation'" [class.active]="activeTab === 'documentation'" class="tab-pane">
            <div class="tab-section">
              <h5>Documentation</h5>
              <p class="text-muted">Documentation files will be displayed here.</p>
              <div style="padding: 20px; background: #f8f9fa; border-radius: 6px; margin-top: 15px;">
                <p style="color: #666; margin: 0;">Content area for documentation files</p>
              </div>
            </div>
          </div>

          <!-- PHOTO & VIDEOGRAPHY Tab -->
          <div *ngIf="activeTab === 'photovideo'" [class.active]="activeTab === 'photovideo'" class="tab-pane">
            <div class="tab-section">
              <h5>Photos & Videos</h5>
              <p class="text-muted">Photos and videos will be displayed here.</p>
              <div style="padding: 20px; background: #f8f9fa; border-radius: 6px; margin-top: 15px;">
                <p style="color: #666; margin: 0;">Content area for photos and videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    #map {
      height: 77vh;
      width: 100%;
    }
    .info-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 250px;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid #0066cc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      backdrop-filter: blur(5px);
    }
    
    .info-panel h4 {
      margin: 0 0 12px 0;
      color: #0066cc;
      font-size: 16px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      padding-right: 30px;
    }

    .info-item {
      margin: 8px 0;
      font-size: 13px;
      line-height: 1.4;
    }
    
    .info-item strong {
      color: #333;
      display: inline-block;
      width: 90px;
    }
    
    .info-item span {
      color: #666;
    }

    #selectedDistrict {
      color: #0066cc;
      font-weight: bold;
    }

    #mouzaCount {
      color: #28a745;
      font-weight: bold;
    }

    #selectedMouza {
      color: #dc3545;
      font-weight: bold;
    }

    /* Close button styles */
    #closeInfoPanel {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    
    #closeInfoPanel:hover {
      background: #c82333;
    }

    /* Location Details Panel Styles */
    .location-details-panel {
      position: fixed;
      width: 400px;
      max-width: 90vw;
      max-height: 80vh;
      background: rgba(255, 255, 255, 0.98);
      border: 3px solid #ff6b35;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 100001;
      font-family: Arial, sans-serif;
      backdrop-filter: blur(10px);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
      display: flex;
      flex-direction: column;
      will-change: transform;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .panel-drag-handle {
      cursor: move;
      padding: 20px 20px 15px 20px;
      border-bottom: 2px solid #ff6b35;
      background: rgba(255, 107, 53, 0.05);
      user-select: none;
      position: relative;
    }

    .panel-drag-handle:active {
      cursor: grabbing;
    }

    .location-details-panel .location-info {
      padding: 10px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    
    .location-details-panel .location-title {
      margin: 0;
      color: #ff6b35;
      font-size: 20px;
      font-weight: bold;
      padding-right: 35px;
    }
    
    .location-details-panel .location-info {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .location-details-panel .location-type {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 6px;
      color: white;
      font-weight: bold;
    }
    
    .location-details-panel .location-type strong {
      color: white;
      display: inline-block;
      margin-right: 8px;
    }
    
    .location-details-panel .location-type span {
      color: white;
      text-transform: capitalize;
    }
    
    .location-details-panel .location-coords {
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #ff6b35;
    }
    
    .location-details-panel .location-coords strong {
      color: #333;
      display: block;
      margin-bottom: 5px;
    }
    
    .location-details-panel .location-coords span {
      color: #666;
      font-family: 'Courier New', monospace;
    }
    
    .location-details-panel .location-description strong {
      color: #333;
      display: block;
      margin-bottom: 8px;
    }
    
    .location-details-panel .location-description p {
      margin: 0;
      color: #555;
      text-align: justify;
      line-height: 1.7;
    }
    
    /* Tab Navigation Styles */
    .tab-navigation {
      display: flex;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 15px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .tab-button {
      flex: 1;
      min-width: 0;
      padding: 10px 8px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .tab-button:hover {
      color: #ff6b35;
      background: rgba(255, 107, 53, 0.05);
    }
    
    .tab-button.active {
      color: #ff6b35;
      border-bottom-color: #ff6b35;
      background: rgba(255, 107, 53, 0.08);
    }
    
    /* Tab Content Styles */
    .tab-content {
      min-height: 200px;
      max-height: calc(80vh - 250px);
      overflow-y: auto;
      display: block;
      width: 100%;
      position: relative;
    }
    
    .tab-pane {
      animation: fadeIn 0.3s ease-in;
      padding: 10px 0;
      display: block;
      min-height: 150px;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .tab-section {
      padding: 10px 0;
    }
    
    .tab-section h5 {
      color: #333;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 10px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .tab-section .text-muted {
      color: #999;
      font-size: 13px;
      font-style: italic;
      margin: 0;
    }
    
    /* Ensure location info elements are visible in tabs */
    .tab-pane .location-type,
    .tab-pane .location-coords,
    .tab-pane .location-description {
      margin-bottom: 15px;
    }
    
    .location-details-panel .close-location-details {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #ff6b35;
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      line-height: 1;
      z-index: 10;
    }
    
    .location-details-panel .close-location-details:hover {
      background: #e55a2b;
      transform: scale(1.1);
    }
    
    .location-details-panel .close-location-details:active {
      transform: scale(0.95);
    }

    /* Location marker styles */
    .location-marker {
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .location-marker:hover {
      transform: scale(1.2);
    }

    /* Selected marker animation */
    @keyframes pulse-ring {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.4);
        opacity: 0.5;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    .location-marker .selected-marker {
      position: relative;
    }

    .location-marker .selected-marker::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid rgba(255, 107, 53, 0.6);
      animation: pulse-ring 2s infinite;
      pointer-events: none;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private map: any;
  private L: any;
  private currentLayer: any = null;
  private activeLayer: any = null;
  private mouzaLayer: any = null;
  private currentMarker: any;
  private highlightedMouzaLayer: any = null;
  private highlightedMouzaMarker: any = null;

  // District and mouza data
  private districtData: any;
  private mouzaData: any;
  private selectedDistrictFeature: any = null;
  private geojsonLayer: any = null;

  // UI state
  selectedDistrict: string | null = null;
  selectedMouza: string | null = null;
  mouzaCount: number = 0;
  showInfoPanel: boolean = false;
  private isHighlighting: boolean = false;
  
  // Location markers state
  private locationMarkers: any[] = [];
  private locationMarkerMap: Map<string, any> = new Map(); // Map location name to marker
  private selectedMarker: any = null;
  showLocationDetails = signal<boolean>(false);
  selectedLocation = signal<any>(null);
  activeTab: string = 'info'; // Active tab in location details panel
  
  // Computed signal for panel visibility
  shouldShowPanel = computed(() => {
    const show = this.showLocationDetails();
    const location = this.selectedLocation();
    const result = show && location && location.name;
    return result;
  });
  
  // Simple getter as fallback (doesn't rely on computed signal)
  get shouldShowPanelValue(): boolean {
    const show = this.showLocationDetails();
    const location = this.selectedLocation();
    return show && location && location.name;
  }
  
  // Legacy properties for template compatibility
  get showLocationDetailsValue(): boolean {
    return this.showLocationDetails();
  }
  
  get selectedLocationValue(): any {
    return this.selectedLocation();
  }
  
  // Panel drag state
  @ViewChild('locationDetailsPanel', { static: false }) panelElementRef!: ElementRef<HTMLElement>;
  panelPosition = { x: 0, y: 0 };
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  
  // Map initialization state
  isMapReady: boolean = false;

  availableLayers = [
    { name: 'OpenStreetMap', label: 'OpenStreetMap' },
    { name: 'Satellite', label: 'Satellite' },
    // { name: 'Terrain', label: 'Terrain' },
    { name: 'Google Streets', label: 'Google Streets' },
    // { name: 'Google Satellite', label: 'Google Satellite' },
    { name: 'Google Hybrid', label: 'Google Hybrid' },
    // { name: 'CartoDB Light', label: 'CartoDB Light' },
    // { name: 'CartoDB Dark', label: 'CartoDB Dark' }
  ];

  currentLayerName: string = 'Satellite';
  private baseLayers: any = {};
  districtListItems: any[] = [];
  private subscriptions: Subscription[] = [];
  private districtLayerMap: Map<string, any> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private mapSelectionService: MapSelectionService,
    private ngZone: NgZone,
    private appRef: ApplicationRef
  ) {
    // Effect to track panel visibility changes
    effect(() => {
      const shouldShow = this.shouldShowPanel();
      const location = this.selectedLocation();
      
      if (shouldShow) {
        // Use requestAnimationFrame to check DOM after Angular renders
        requestAnimationFrame(() => {
          setTimeout(() => {
            const panelElement = document.querySelector('.location-details-panel');
          }, 0);
        });
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.initMap();
      this.subscribeToSelections();
      
      // Ensure panel element exists in DOM (even if hidden)
      setTimeout(() => {
        const panelElement = document.querySelector('.location-details-panel');
        const viewChildElement = this.panelElementRef?.nativeElement;
        
        if (panelElement) {
          (panelElement as HTMLElement).style.display = 'none';
        }
        if (viewChildElement) {
          viewChildElement.style.display = 'none';
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Clean up drag event listeners
    this.stopDrag();
  }

  private subscribeToSelections(): void {
    // Listen to district selection from home page
    const districtSub = this.mapSelectionService.selectedDistrict$.subscribe(districtName => {
      if (districtName && this.districtLayerMap.has(districtName)) {
        const district = this.districtLayerMap.get(districtName);
        this.highlightDistrict(district.layer, districtName);
      }
    });

    // Listen to mouza selection from home page
    const mouzaSub = this.mapSelectionService.selectedMouza$.subscribe(mouzaName => {
      if (mouzaName) {
        // Try to find and highlight the mouza
        const highlightMouza = () => {
          if (this.mouzaLayer) {
            let found = false;
            this.mouzaLayer.eachLayer((layer: any) => {
              const feature = layer.feature;
              const name = feature.properties["Mouza Name"] || feature.properties.subdistrict;
              if (name === mouzaName) {
                this.selectedMouza = mouzaName;
                this.highlightMouza(feature, layer);
                this.cdr.detectChanges();
                found = true;
                return; // Found and highlighted
              }
            });
            return found;
          }
          return false;
        };

        // Try immediately
        if (!highlightMouza()) {
          // If mouza layer not ready, wait a bit and retry
          setTimeout(() => {
            highlightMouza();
          }, 500);
        }
      } else {
        // Clear mouza highlight when selection is cleared
        this.clearMouzaHighlight();
        this.selectedMouza = null;
        this.cdr.detectChanges();
      }
    });

    // Listen to layer selection from home page
    const layerSub = this.mapSelectionService.selectedLayer$.subscribe(layerName => {
      if (layerName) {
        this.switchLayer(layerName);
      }
    });

    this.subscriptions.push(districtSub, mouzaSub, layerSub);
  }

  private async initMap(): Promise<void> {
    this.L = await import('leaflet');
    
    // Fix missing default marker icons using local assets
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/images/marker-icon-2x.png',
      iconUrl: '/assets/images/marker-icon.png',
      shadowUrl: '/assets/images/marker-shadow.png',
    });

    this.map = this.L.map('map', {
      center: [28.2, 94.5], // Center of Arunachal Pradesh
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true
    });

    // Define different map layers
    this.baseLayers = {
      "OpenStreetMap": this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 4
      }),
      
      "Satellite": this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 18,
        minZoom: 4
      }),
      
      "Terrain": this.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap',
        maxZoom: 17,
        minZoom: 4
      }),
      
      "Google Streets": this.L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google',
        maxZoom: 20,
        minZoom: 4
      }),
      
      "Google Satellite": this.L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google',
        maxZoom: 20,
        minZoom: 4
      }),
      
      "Google Hybrid": this.L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google',
        maxZoom: 20,
        minZoom: 4
      }),
      
      "CartoDB Light": this.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 20,
        minZoom: 4
      }),
      
      "CartoDB Dark": this.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
        maxZoom: 20,
        minZoom: 4
      })
    };
    
    // Add the default layer
    this.baseLayers["Satellite"].addTo(this.map);
    this.currentLayer = this.baseLayers["Satellite"];
    this.currentLayerName = 'Satellite';
    
    // Note: Layer control is commented out since we're using custom buttons
    // If you want to use Leaflet's built-in layer control, uncomment this line
    // this.L.control.layers(this.baseLayers).addTo(this.map);
    
    // Add scale control
    this.L.control.scale().addTo(this.map);
    
    // Add My Location button
    this.addMyLocationControl();

    // Ensure map resizes properly
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    // Mark map as ready
    this.isMapReady = true;

    // For demo purposes, create sample district data
    // In production, you would load this from a GeoJSON file
    this.initDistrictData();
    
    // Add location markers
    this.addLocationMarkers();
  }

  switchLayer(layerName: string): void {
    if (!this.isMapReady || !this.map) {
      // Retry after a short delay if map is still initializing
      setTimeout(() => {
        if (this.isMapReady && this.map) {
          this.switchLayer(layerName);
        } else {
          console.error('Map still not ready after retry');
        }
      }, 200);
      return;
    }
    
    if (!this.baseLayers || Object.keys(this.baseLayers).length === 0) {
      setTimeout(() => {
        if (this.baseLayers && Object.keys(this.baseLayers).length > 0) {
          this.switchLayer(layerName);
        }
      }, 200);
      return;
    }
    
    if (!this.baseLayers[layerName]) {
      return;
    }
    
    try {
      // Remove current layer if it exists
      if (this.currentLayer && this.map.hasLayer(this.currentLayer)) {
        this.map.removeLayer(this.currentLayer);
      }
      
      // Add new layer
      this.currentLayer = this.baseLayers[layerName];
      this.map.addLayer(this.currentLayer);
      this.currentLayerName = layerName;
      
      // Force map to redraw
      this.map.invalidateSize();
      
      this.cdr.detectChanges();
    } catch (error) {
      console.log('Error switching layer:', error);
    }
  }

  addMyLocationControl(): void {
    const myLocationControl = this.L.Control.extend({
      onAdd: (map: any) => {
        const container = this.L.DomUtil.create('div', 'my-location-control');
        const button = this.L.DomUtil.create('button', 'my-location-btn');
        button.innerHTML = '📍';
        button.title = 'Go to my location';
        button.style.cssText = `
          width: 40px;
          height: 40px;
          background: white;
          border: 2px solid rgba(0,0,0,0.2);
          border-radius: 4px;
          cursor: pointer;
          font-size: 20px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        this.L.DomEvent.disableClickPropagation(button);
        
        button.addEventListener('click', () => {
          this.getCurrentLocation();
        });

        container.appendChild(button);
        return container;
      }
    });

    new myLocationControl({ position: 'topright' }).addTo(this.map);
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker);
        }

        this.currentMarker = this.L.marker([lat, lng], {
          icon: this.L.divIcon({
            className: 'current-location-marker',
            html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(this.map);

        this.currentMarker.bindPopup('Your current location').openPopup();
        this.map.setView([lat, lng], 15);
      },
      (error) => {
        console.log('Error getting user location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  hideInfoPanel(): void {
    this.showInfoPanel = false;
    
    // Force change detection
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    // Also trigger in next tick to ensure it's applied
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);
  }

  filteredDistricts: any[] = [];
  searchQuery: string = '';

  filterDistricts(event: any): void {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDistricts = this.districtListItems.filter(d => 
      d.name.toLowerCase().includes(this.searchQuery)
    );
  }

  getDisplayDistricts(): any[] {
    if (!this.searchQuery) {
      return this.districtListItems;
    }
    return this.filteredDistricts.length > 0 ? this.filteredDistricts : this.districtListItems;
  }

  // Load district data from assets
  private async initDistrictData(): Promise<void> {
    await this.loadDistrictData();
  }

  private async loadDistrictData(): Promise<void> {
    try {
      // Load JavaScript files that export variables
      // These files export json_ArunachalPradeshDistricts_2 and json_ArunachalPradeshMouza_1
      
      // Load district script
      await this.loadScript('/assets/data/ArunachalPradeshDistricts_2.js');
      
      // Load mouza script
      await this.loadScript('/assets/data/ArunachalPradeshMouza_1.js');
      
      // Access the global variables that were declared in the JS files
      this.districtData = (window as any).json_ArunachalPradeshDistricts_2;
      this.mouzaData = (window as any).json_ArunachalPradeshMouza_1;
      
      if (!this.districtData) {
        throw new Error('District data not loaded');
      }
      
      this.setupDistrictLayer();
    } catch (error) {
      console.error('Error loading data files:', error);
      // Fall back to sample data if real data fails
      this.setupDistrictLayer();
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private setupDistrictLayer(): void {
    if (!this.districtData || !this.districtData.features) return;

    const districtMap = new Map<string, any>();

    this.geojsonLayer = this.L.geoJSON(this.districtData, {
      style: { color: "blue", weight: 1, fillOpacity: 0 },
      onEachFeature: (feature: any, layer: any) => {
        const name = feature.properties["District N"] || feature.properties.district;
        districtMap.set(name, layer);
        
        layer.on('click', () => {
          this.ngZone.run(() => {
            this.highlightDistrict(layer, name);
          });
        });
      }
    }).addTo(this.map);

    // Populate district list items for Angular template
    this.districtListItems = Array.from(districtMap.entries()).map(([name, layer]) => ({
      name,
      layer
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Store district layer map for service-based selection
    this.districtListItems.forEach(district => {
      this.districtLayerMap.set(district.name, district);
    });
    
    this.cdr.detectChanges();
  }

  selectedDistrictName: string | null = null;

  selectDistrict(district: any): void {
    this.selectedDistrictName = district.name;
    this.highlightDistrict(district.layer, district.name);
  }

  isDistrictActive(districtName: string): boolean {
    return districtName === this.selectedDistrictName;
  }

  highlightDistrict(layer: any, districtName: string, mouzaToSelect?: string | null): void {
    // Prevent recursive calls
    if (this.isHighlighting && this.selectedDistrict === districtName) {
      return;
    }
    
    this.isHighlighting = true;
    
    // Store current location panel state to preserve it
    const preserveLocationPanel = this.showLocationDetails();
    const preserveSelectedLocation = this.selectedLocation();
    
    // Reset previous active layer
    if (this.activeLayer && this.geojsonLayer) {
      this.geojsonLayer.resetStyle(this.activeLayer);
    }
    
    // Clear previously selected mouza when district is clicked
    this.clearMouzaHighlight();
    this.selectedMouza = null;
    // Also clear selection in service
    this.mapSelectionService.selectMouza(null);
    
    // Highlight the selected district
    layer.setStyle({ 
      color: "red", 
      weight: 3, 
      // fillColor: "red", 
      fillOpacity: 0 
    });
    
    // Fit bounds with padding - but don't override if we have a location panel showing
    if (!preserveLocationPanel) {
      const bounds = layer.getBounds();
      this.map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 12
      });
    }
    
    this.activeLayer = layer;
    this.selectedDistrictFeature = layer.feature;
    this.selectedDistrict = districtName;
    
    // Force show info panel - do this FIRST
    this.showInfoPanel = true;
    
    // Restore location panel state if it was showing - do this BEFORE mouza loading
    if (preserveLocationPanel && preserveSelectedLocation) {
      this.ngZone.run(() => {
        this.showLocationDetails.set(true);
        this.selectedLocation.set(preserveSelectedLocation);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
    }

    // Update mouza display
    this.loadMouzasForDistrict(districtName, layer, mouzaToSelect);
    
    // Force change detection immediately in Angular zone
    this.ngZone.run(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
    
    // Notify service AFTER change detection to update dropdowns
    // This ensures panel is shown first
    setTimeout(() => {
      this.mapSelectionService.selectDistrict(districtName);
      this.isHighlighting = false;
      
      // Re-ensure location panel is still visible
      if (preserveLocationPanel && preserveSelectedLocation) {
        this.ngZone.run(() => {
          this.showLocationDetails.set(true);
          this.selectedLocation.set(preserveSelectedLocation);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      }
    }, 100);
    
    // Also trigger delayed change detection
    setTimeout(() => {
      this.ngZone.run(() => {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        
        // Re-ensure location panel is visible if it should be
        if (preserveLocationPanel && preserveSelectedLocation && !this.showLocationDetails()) {
          this.showLocationDetails.set(true);
          this.selectedLocation.set(preserveSelectedLocation);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.appRef.tick();
        }
      });
    }, 200);
  }

  private loadMouzasForDistrict(districtName: string, districtLayer: any, mouzaToSelect?: string | null): void {
    if (!this.mouzaData || !this.mouzaData.features) return;

    // Clear previous mouzas
    if (this.mouzaLayer) {
      this.map.removeLayer(this.mouzaLayer);
    }
    this.mouzaCount = 0;

    const districtFeature = districtLayer.feature;
    const districtBounds = districtLayer.getBounds();

    // Load Mouza GeoJSON with polygon-based filtering (similar to HTML file)
    this.mouzaLayer = this.L.geoJSON(this.mouzaData, {
      filter: (f: any) => {
        const mouzaName = f.properties["Mouza Name"] || f.properties.subdistrict || "Unknown";
        
        try {
          // Get Mouza centroid (center point)
          const mouzaCentroid = this.getFeatureCentroid(f);
          
          // Use proper polygon-based filtering instead of bounds
          const isCentroidInDistrict = this.isPointInPolygon(mouzaCentroid, districtFeature);
          
          if (isCentroidInDistrict) {
            return true;
          } else {
            return false;
          }
          
        } catch (error) {
          // Fallback to bounds checking if polygon check fails
          try {
            const mouzaCentroid = this.getFeatureCentroid(f);
            const isInBounds = districtBounds.contains(mouzaCentroid);
            return isInBounds;
          } catch (fallbackError) {
            return false;
          }
        }
      },
      style: { color: '#9A1FFF', weight: 1, fillOpacity: 0 },
      onEachFeature: (feature: any, layer: any) => {
        const mouzaName = feature.properties["Mouza Name"] || feature.properties.subdistrict;
        layer.on('click', () => {
          this.ngZone.run(() => {
            this.selectedMouza = mouzaName;
            this.highlightMouza(feature, layer);
            // Notify service to update dropdown
            this.mapSelectionService.selectMouza(mouzaName);
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        });
        this.mouzaCount++;
      }
    }).addTo(this.map);

    this.updateInfoPanel();

    // Select the mouza if provided (after layer is loaded)
    if (mouzaToSelect && this.mouzaLayer) {
      setTimeout(() => {
        this.mouzaLayer.eachLayer((layer: any) => {
          const feature = layer.feature;
          const name = feature.properties["Mouza Name"] || feature.properties.subdistrict;
          if (name === mouzaToSelect) {
            this.selectedMouza = mouzaToSelect;
            this.highlightMouza(feature, layer);
            this.mapSelectionService.selectMouza(mouzaToSelect);
            this.cdr.detectChanges();
            return;
          }
        });
      }, 100);
    }
  }

  private getFeatureCentroid(feature: any): any {
    // Calculate centroid (center point) from GeoJSON feature
    // This is similar to turf.centroid but using our own calculation
    const bounds = this.getFeatureBounds(feature);
    return bounds.getCenter();
  }

  private isPointInLayer(point: any, layer: any): boolean {
    // For GeoJSON layers (which is what we have), always check the feature
    if (layer.feature) {
      return this.isPointInPolygon(point, layer.feature);
    }
    
    // For direct polygon layers, use latlngs
    if (layer.getLatLngs && typeof layer.getLatLngs === 'function') {
      try {
        return this.isPointInPolygonLayer(point, layer);
      } catch (e) {
        // Fallback to bounds check
      }
    }
    
    // Fallback: check bounds (less accurate but better than nothing)
    if (layer.getBounds && typeof layer.getBounds === 'function') {
      return layer.getBounds().contains(point);
    }
    
    return false;
  }

  private isPointInPolygonLayer(point: any, polygonLayer: any): boolean {
    // Get all latlngs from the polygon layer
    const latlngs = polygonLayer.getLatLngs();
    
    // Handle MultiPolygon
    if (Array.isArray(latlngs[0]) && Array.isArray(latlngs[0][0])) {
      // It's a MultiPolygon - check each polygon
      for (const polygon of latlngs) {
        if (this.isPointInPolygonLatLngs(point, polygon[0])) {
          return true;
        }
      }
      return false;
    } else {
      // It's a single Polygon
      return this.isPointInPolygonLatLngs(point, latlngs[0]);
    }
  }

  private isPointInPolygonLatLngs(point: any, latlngs: any[]): boolean {
    // Ray casting algorithm for Leaflet LatLng array
    let inside = false;
    const lat = point.lat;
    const lng = point.lng;

    for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
      const xi = latlngs[i].lng, yi = latlngs[i].lat;
      const xj = latlngs[j].lng, yj = latlngs[j].lat;

      // Skip horizontal edges
      if (yi === yj) continue;

      // Check if edge crosses the horizontal line at point's latitude
      const crossesLatitude = (yi > lat) !== (yj > lat);

      if (crossesLatitude) {
        // Calculate longitude where edge crosses the latitude line
        const edgeLng = (xj - xi) * (lat - yi) / (yj - yi) + xi;

        // Check if intersection point is to the right of the point
        if (lng < edgeLng) {
          inside = !inside;
        }
      }
    }

    return inside;
  }

  private getFeatureBounds(feature: any): any {
    // Calculate bounds from GeoJSON feature coordinates
    const coordinates = feature.geometry.coordinates;
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    const processCoordinate = (coord: any[]) => {
      // GeoJSON coordinates are [lng, lat]
      if (Array.isArray(coord) && coord.length >= 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number') {
        const [lng, lat] = coord;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    };

    if (feature.geometry.type === 'MultiPolygon') {
      coordinates.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
          ring.forEach(processCoordinate);
        });
      });
    } else if (feature.geometry.type === 'Polygon') {
      coordinates.forEach((ring: any) => {
        ring.forEach(processCoordinate);
      });
    }

    // Create a Leaflet LatLngBounds object
    return this.L.latLngBounds(
      [minLat, minLng],
      [maxLat, maxLng]
    );
  }

  private isPointInPolygon(point: any, polygonFeature: any): boolean {
    // Ray casting algorithm to check if point is inside polygon
    // Note: GeoJSON coordinates are [lng, lat] format
    const lat = point.lat;
    const lng = point.lng;
    
    const coordinates = polygonFeature.geometry.coordinates;
    
    // Handle MultiPolygon - check each polygon separately
    if (polygonFeature.geometry.type === 'MultiPolygon') {
      // For MultiPolygon: point is inside if it's inside ANY of the polygons
      for (const polygon of coordinates) {
        if (this.isPointInPolygonRing(point, polygon[0], lat, lng)) {
          return true;
        }
      }
      return false;
    } 
    // Handle Polygon - check outer ring, exclude holes
    else if (polygonFeature.geometry.type === 'Polygon') {
      const outerRing = coordinates[0];
      // Point must be inside outer ring
      if (!this.isPointInPolygonRing(point, outerRing, lat, lng)) {
        return false;
      }
      
      // Check if point is in any hole (if so, it's outside)
      for (let i = 1; i < coordinates.length; i++) {
        if (this.isPointInPolygonRing(point, coordinates[i], lat, lng)) {
          return false; // Point is in a hole, so it's outside
        }
      }
      return true;
    }
    
    return false;
  }

  private isPointInPolygonRing(point: any, ring: any[], lat: number, lng: number): boolean {
    let crossings = 0;
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      // GeoJSON: [lng, lat]
      const xi = ring[i][0], yi = ring[i][1]; // lng, lat
      const xj = ring[j][0], yj = ring[j][1]; // lng, lat
      
      // Skip horizontal edges
      if (Math.abs(yi - yj) < 1e-10) continue;
      
      // Check if edge crosses the horizontal line at point's latitude
      const crossesLatitude = (yi > lat) !== (yj > lat);
      
      if (crossesLatitude) {
        // Calculate longitude where edge crosses the latitude line
        const edgeLng = (xj - xi) * (lat - yi) / (yj - yi) + xi;
        
        // Check if intersection point is to the right of the point
        if (lng < edgeLng) {
          crossings++;
        }
      }
    }
    
    // Odd number of crossings means point is inside
    return crossings % 2 === 1;
  }

  private highlightMouza(feature: any, layer: any): void {
    this.clearMouzaHighlight();
    
    this.highlightedMouzaLayer = this.L.geoJSON(feature, {
      style: {
        color: '#ff6b35',
        weight: 4,
        // fillColor: '#ff6b35',
        fillOpacity: 0
      }
    }).addTo(this.map);
    
    // Ensure info panel is visible when mouza is selected
    this.showInfoPanel = true;
    
    // Update info panel with mouza information
    this.updateInfoPanel();
    
    // Force change detection
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 10);
  }

  private clearMouzaHighlight(): void {
    if (this.highlightedMouzaLayer) {
      this.map.removeLayer(this.highlightedMouzaLayer);
      this.highlightedMouzaLayer = null;
    }
  }

  private updateInfoPanel(): void {
    this.cdr.detectChanges();
  }

  // Location markers data
  private arunachalTop10Locations = [
    {
      name: "Tawang",
      latitude: 27.5860,
      longitude: 91.8650,
      type: "mountain",
      description: "Famous for Tawang Monastery, scenic mountains, and snow-clad peaks. Located near the Indo-China border."
    },
    {
      name: "Ziro Valley",
      latitude: 27.5565,
      longitude: 93.8196,
      type: "valley",
      description: "Known for its pine hills, rice fields, and the Apatani tribal culture. Hosts the popular Ziro Music Festival."
    },
    {
      name: "Bomdila",
      latitude: 27.2648,
      longitude: 92.4241,
      type: "mountain",
      description: "A hill town with apple orchards, Buddhist monasteries, and panoramic views of the Himalayas."
    },
    {
      name: "Itanagar",
      latitude: 27.0844,
      longitude: 93.6053,
      type: "city",
      description: "The capital city, featuring Ita Fort, Ganga Lake, and a blend of modern and tribal culture."
    },
    {
      name: "Dirang",
      latitude: 27.3645,
      longitude: 92.2402,
      type: "valley",
      description: "A serene valley between Bomdila and Tawang, famous for hot water springs and apple orchards."
    },
    {
      name: "Pasighat",
      latitude: 28.0660,
      longitude: 95.3263,
      type: "city",
      description: "The oldest town in Arunachal Pradesh, located along the Siang River; gateway to the eastern Himalayas."
    },
    {
      name: "Roing",
      latitude: 28.1550,
      longitude: 95.8350,
      type: "valley",
      description: "A picturesque valley town with lakes, rivers, and the Mayudia Pass offering snowfall in winter."
    },
    {
      name: "Anini",
      latitude: 28.8137,
      longitude: 95.8850,
      type: "mountain",
      description: "Remote and peaceful, surrounded by lush green hills; home to the Idu Mishmi tribe."
    },
    {
      name: "Along (Aalo)",
      latitude: 28.1670,
      longitude: 94.8030,
      type: "valley",
      description: "Known for hanging bridges made of bamboo over the Siang River and Adi tribal villages."
    },
    {
      name: "Namdapha National Park",
      latitude: 27.4917,
      longitude: 96.3858,
      type: "national_park",
      description: "A biodiversity hotspot and India's third-largest national park, home to tigers, leopards, and red pandas."
    }
  ];

  private getMarkerIconByType(type: string): any {
    let backgroundColor = '#ff6b35';
    let emoji = '📍';
    let size = 28;
    
    switch(type) {
      case 'mountain':
        backgroundColor = '#8B4513'; // Brown
        emoji = '🏔️';
        break;
      case 'valley':
        backgroundColor = '#228B22'; // Forest Green
        emoji = '🌄';
        break;
      case 'city':
        backgroundColor = '#1E90FF'; // Dodger Blue
        emoji = '🏙️';
        break;
      case 'national_park':
        backgroundColor = '#006400'; // Dark Green
        emoji = '🌲';
        size = 30;
        break;
      default:
        backgroundColor = '#ff6b35'; // Orange (default)
        emoji = '📍';
    }
    
    return this.L.divIcon({
      className: 'location-marker',
      html: `<div style="
        background-color: ${backgroundColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size - 8}px;
      ">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  private addLocationMarkers(): void {
    if (!this.map || !this.L) {
      return;
    }

    this.arunachalTop10Locations.forEach(location => {
      // Create a custom icon based on location type
      const locationIcon = this.getMarkerIconByType(location.type || 'default');

      const marker = this.L.marker([location.latitude, location.longitude], {
        icon: locationIcon,
        interactive: true,
        bubblingMouseEvents: false
      }).addTo(this.map);

      // Make marker clickable and add click event
      marker.on('click', (e: any) => {
        // Stop event propagation to prevent map click and other layer interactions
        this.L.DomEvent.stop(e);
        
        this.ngZone.run(() => {
          this.showLocationDetailsPanel(location, marker);
        });
      });
      
      // Also add mouseover for visual feedback
      marker.on('mouseover', () => {
        if (marker !== this.selectedMarker) {
          marker.setOpacity(0.8);
        }
      });
      
      marker.on('mouseout', () => {
        if (marker !== this.selectedMarker) {
          marker.setOpacity(1);
        }
      });

      this.locationMarkers.push(marker);
      this.locationMarkerMap.set(location.name, marker);
    });
  }

  showLocationDetailsPanel(location: any, marker: any): void {
    // Clear previous marker highlight
    this.clearMarkerHighlight();
    
    // Create location object first
    const locationObj = {
      name: location.name || 'Unknown Location',
      latitude: location.latitude,
      longitude: location.longitude,
      type: location.type || 'default',
      description: location.description || location.name || 'No description available'
    };
    
    // Initialize panel position to center of screen
    this.initializePanelPosition();
    
    // Update signals - do this first
    this.selectedMarker = marker;
    this.selectedLocation.set(locationObj);
    this.showLocationDetails.set(true);
    this.activeTab = 'info'; // Reset to INFO tab when panel opens
    
    // Check if element exists immediately
    let panelElement = document.querySelector('.location-details-panel') as HTMLElement;
    
    // If element doesn't exist, try ViewChild
    if (!panelElement && this.panelElementRef?.nativeElement) {
      panelElement = this.panelElementRef.nativeElement;
    }
    
    // Now run change detection inside Angular zone
    this.ngZone.run(() => {
      // Force multiple change detection cycles
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      this.appRef.tick();
      
      // Check again after change detection
      setTimeout(() => {
        // Try ViewChild first
        if (this.panelElementRef?.nativeElement) {
          panelElement = this.panelElementRef.nativeElement;
        } else {
          // Try querySelector
          panelElement = document.querySelector('.location-details-panel') as HTMLElement;
        }
        
        if (panelElement) {
          // Force show the panel
          panelElement.style.display = 'flex';
          panelElement.style.visibility = 'visible';
          panelElement.style.opacity = '1';
          panelElement.style.left = this.panelPosition.x + 'px';
          panelElement.style.top = this.panelPosition.y + 'px';
        } else {
          // Try one more aggressive change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.appRef.tick();
          
          // Check one more time
          setTimeout(() => {
            panelElement = document.querySelector('.location-details-panel') as HTMLElement;
            if (panelElement) {
              panelElement.style.display = 'flex';
              panelElement.style.visibility = 'visible';
              panelElement.style.opacity = '1';
            }
          }, 100);
        }
      }, 0);
    });
    
    // Highlight the selected marker (outside zone as it's Leaflet operation)
    if (marker && marker.getElement) {
      this.highlightMarker(marker);
    }
  }

  private initializePanelPosition(): void {
    // Center the panel on screen
    const panelWidth = 400;
    const panelHeight = 300; // Approximate height
    this.panelPosition = {
      x: Math.max(0, (window.innerWidth - panelWidth) / 2),
      y: Math.max(0, (window.innerHeight - panelHeight) / 2)
    };
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    
    this.dragOffset = {
      x: clientX - this.panelPosition.x,
      y: clientY - this.panelPosition.y
    };

    // Add event listeners for dragging
    if (event instanceof MouseEvent) {
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    } else {
      document.addEventListener('touchmove', this.onDrag);
      document.addEventListener('touchend', this.stopDrag);
    }
  }

  onDrag = (event: MouseEvent | TouchEvent): void => {
    if (!this.isDragging) return;
    
    event.preventDefault();
    
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    
    // Calculate new position (no bounds checking during drag for performance)
    const newX = clientX - this.dragOffset.x;
    const newY = clientY - this.dragOffset.y;
    
    // Update position directly via DOM using transform for GPU acceleration
    if (this.panelElementRef?.nativeElement) {
      this.panelElementRef.nativeElement.style.transform = `translate(${newX}px, ${newY}px)`;
    }
    
    // Update the position property (but don't trigger change detection)
    this.panelPosition = { x: newX, y: newY };
  }

  stopDrag = (): void => {
    this.isDragging = false;
    
    // Apply bounds checking and finalize position
    if (this.panelElementRef?.nativeElement) {
      const panelWidth = 400;
      const panelHeight = 300;
      const maxX = window.innerWidth - panelWidth;
      const maxY = window.innerHeight - panelHeight;
      
      let finalX = Math.max(0, Math.min(this.panelPosition.x, maxX));
      let finalY = Math.max(0, Math.min(this.panelPosition.y, maxY));
      
      // Update with bounds-checked position
      this.panelElementRef.nativeElement.style.transform = `translate(${finalX}px, ${finalY}px)`;
      this.panelElementRef.nativeElement.style.left = finalX + 'px';
      this.panelElementRef.nativeElement.style.top = finalY + 'px';
      this.panelElementRef.nativeElement.style.transform = 'none';
      
      this.panelPosition = { x: finalX, y: finalY };
    }
    
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend', this.stopDrag);
  }

  hideLocationDetailsPanel(): void {
    this.showLocationDetails.set(false);
    this.selectedLocation.set(null);
    this.clearMarkerHighlight();
    this.cdr.detectChanges();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private highlightMarker(marker: any): void {
    if (!marker) return;
    
    // Check if marker has Leaflet methods (is a real marker, not a temp object)
    if (typeof marker.setZIndexOffset !== 'function') {
      return; // Skip highlighting if it's not a real Leaflet marker
    }
    
    // Get the icon element
    const iconElement = marker.getElement();
    if (iconElement) {
      const markerDiv = iconElement.querySelector('div');
      if (markerDiv) {
        // Add selected class and update styles
        markerDiv.style.transform = 'scale(1.3)';
        markerDiv.style.boxShadow = '0 0 0 4px rgba(255, 107, 53, 0.6), 0 0 0 8px rgba(255, 107, 53, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)';
        markerDiv.style.zIndex = '1000';
        markerDiv.style.transition = 'all 0.3s ease';
        markerDiv.classList.add('selected-marker');
      }
    }
    
    // Also add pulsing animation
    marker.setZIndexOffset(1000);
  }

  private clearMarkerHighlight(): void {
    if (this.selectedMarker) {
      // Check if marker has Leaflet methods (is a real marker, not a temp object)
      if (typeof this.selectedMarker.setZIndexOffset === 'function') {
        const iconElement = this.selectedMarker.getElement();
        if (iconElement) {
          const markerDiv = iconElement.querySelector('div');
          if (markerDiv) {
            // Reset styles
            markerDiv.style.transform = 'scale(1)';
            markerDiv.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.3)';
            markerDiv.style.zIndex = 'auto';
            markerDiv.classList.remove('selected-marker');
          }
        }
        this.selectedMarker.setZIndexOffset(0);
        this.selectedMarker.setOpacity(1);
      }
    }
    this.selectedMarker = null;
  }

  getTypeColor(type: string): string {
    switch(type) {
      case 'mountain': return '#8B4513';
      case 'valley': return '#228B22';
      case 'city': return '#1E90FF';
      case 'national_park': return '#006400';
      default: return '#ff6b35';
    }
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'mountain': return 'Mountain';
      case 'valley': return 'Valley';
      case 'city': return 'City';
      case 'national_park': return 'National Park';
      default: return 'Location';
    }
  }

  shouldShowLocationPanel(): boolean {
    const loc = this.selectedLocation();
    const shouldShow = this.showLocationDetails() && 
                      loc && 
                      loc.name && 
                      loc.name.length > 0;
    return shouldShow;
  }

  centerOnLocation(location: { name: string; latitude: number; longitude: number; type?: string; description?: string }, districtName?: string | null, mouzaName?: string | null): void {
    // Show the panel immediately even if map isn't ready
    const locationInfo = {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      type: location.type || 'default',
      description: location.description || location.name
    };
    
    // Show panel first, regardless of map state
    this.ngZone.run(() => {
      // Create a temporary marker object for the panel
      const tempMarker = { getElement: () => null };
      this.showLocationDetailsPanel(locationInfo, tempMarker);
    });
    
    if (!this.map || !this.L) {
      // Wait for map to be ready, then continue with map operations
      const checkMapReady = () => {
        if (this.map && this.L && this.isMapReady) {
          // Map is ready, now do the map operations
          this.continueCenterOnLocation(location, districtName, mouzaName);
        } else {
          setTimeout(checkMapReady, 100);
        }
      };
      setTimeout(checkMapReady, 100);
      return;
    }
    
    // Map is ready, continue with full operations
    this.continueCenterOnLocation(location, districtName, mouzaName);
  }
  
  private continueCenterOnLocation(location: { name: string; latitude: number; longitude: number; type?: string; description?: string }, districtName?: string | null, mouzaName?: string | null): void {
    if (!this.map || !this.L) {
      return;
    }

    // Clear previous marker highlight
    this.clearMarkerHighlight();

    // Check if marker already exists for this location
    let marker = this.locationMarkerMap.get(location.name);

    if (!marker) {
      // Create a new marker for this location
      const locationIcon = this.getMarkerIconByType(location.type || 'default');
      marker = this.L.marker([location.latitude, location.longitude], {
        icon: locationIcon,
        interactive: true,
        bubblingMouseEvents: false
      }).addTo(this.map);

      // Add click event to marker
      marker.on('click', (e: any) => {
        this.L.DomEvent.stop(e);
        this.ngZone.run(() => {
          const locationInfo = {
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            type: location.type || 'default',
            description: location.description || location.name
          };
          this.showLocationDetailsPanel(locationInfo, marker);
        });
      });

      // Store the marker
      this.locationMarkers.push(marker);
      this.locationMarkerMap.set(location.name, marker);
    }

    // Center map on location
    this.map.setView([location.latitude, location.longitude], 13, {
      animate: true,
      duration: 0.5
    });

    // Highlight the marker
    this.selectedMarker = marker;
    this.highlightMarker(marker);

    // Update the location panel with the actual marker (panel already shown in centerOnLocation)
    this.ngZone.run(() => {
      const locationInfo = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        type: location.type || 'default',
        description: location.description || location.name
      };
      // Only update if panel isn't already showing this location
      const currentLocation = this.selectedLocation();
      if (!this.showLocationDetails() || !currentLocation || currentLocation.name !== locationInfo.name) {
        this.showLocationDetailsPanel(locationInfo, marker);
      } else {
        // Just update the marker reference
        this.selectedMarker = marker;
        this.highlightMarker(marker);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
    // Select district and mouza if provided (after panel is shown)
    if (districtName) {
      // Small delay to ensure panel is rendered first
      setTimeout(() => {
        // Find and highlight the district
        if (this.districtLayerMap.has(districtName)) {
          const district = this.districtLayerMap.get(districtName);
          this.highlightDistrict(district.layer, districtName, mouzaName);
        } else {
          // Try to find the district in the geojson layer
          if (this.geojsonLayer) {
            this.geojsonLayer.eachLayer((layer: any) => {
              const feature = layer.feature;
              const name = feature.properties["District N"] || feature.properties.district;
              if (name === districtName) {
                this.highlightDistrict(layer, districtName, mouzaName);
                return;
              }
            });
          }
        }
        // Re-ensure panel is still visible after district selection
        // Store the location info before district operations
        const savedLocation = this.selectedLocation();
        const savedShowLocation = this.showLocationDetails();
        
        setTimeout(() => {
          this.ngZone.run(() => {
            // Restore location panel if it was showing
            if (savedShowLocation && savedLocation) {
              this.showLocationDetails.set(true);
              this.selectedLocation.set(savedLocation);
            }
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            this.appRef.tick();
          });
        }, 100);
      }, 300);
    }
  }
}