import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type * as L from 'leaflet';

// ─── Domain types ────────────────────────────────────────────────────────────

export type MeasurementMode = 'area' | 'distance';
export type DrawingState = 'idle' | 'drawing' | 'complete';

export interface AreaResult {
  readonly sqMeters: number;
  readonly hectares: number;
  readonly sqKilometers: number;
}

export interface DistanceResult {
  readonly totalKm: number;
  readonly straightKm: number;
}

type LeafletModule = typeof L;

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-measurement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './measurement.component.html',
  styleUrl: './measurement.component.scss',
})
export class MeasurementComponent implements AfterViewInit, OnDestroy {
  // ─── Public signals (template-bound) ──────────────────────────────────────
  readonly activeMode = signal<MeasurementMode | null>(null);
  readonly drawingState = signal<DrawingState>('idle');
  readonly areaResult = signal<AreaResult | null>(null);
  readonly distanceResult = signal<DistanceResult | null>(null);
  readonly sidebarCollapsed = signal(false);
  readonly currentLayer = signal('streets');
  readonly statusMessage = signal(
    'Select a measurement type and draw on the map to calculate area or distance.',
  );

  readonly isDrawing = computed(() => this.drawingState() === 'drawing');
  readonly isComplete = computed(() => this.drawingState() === 'complete');

  readonly availableLayers: ReadonlyArray<{ label: string; key: string }> = [
    { label: 'Streets', key: 'streets' },
    { label: 'Satellite', key: 'satellite' },
    { label: 'Light', key: 'light' },
    { label: 'Terrain', key: 'terrain' },
  ];

  // ─── Private Leaflet references ───────────────────────────────────────────
  private _L: LeafletModule | null = null;
  private _map: L.Map | null = null;
  private _baseLayers: Record<string, L.TileLayer> = {};
  private _currentTileLayer: L.TileLayer | null = null;

  private _drawnPoints: L.LatLng[] = [];
  private _tempMarkers: L.CircleMarker[] = [];
  private _tempPolyline: L.Polyline | null = null;
  private _finalShape: L.Polygon | L.Polyline | null = null;
  private _finalVertexMarkers: L.CircleMarker[] = [];
  private _measurementPopup: L.Popup | null = null;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ─── Public template API ─────────────────────────────────────────────────

  selectMode(mode: MeasurementMode): void {
    if (this.activeMode() === mode && this.drawingState() === 'idle') {
      return;
    }
    this.clearMeasurement();
    this.activeMode.set(mode);

    if (mode === 'area') {
      this.enableAreaMode();
    } else {
      this.enableDistanceMode();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    // Reflow the map after sidebar animation completes
    setTimeout(() => this._map?.invalidateSize(), 320);
  }

  switchMapLayer(key: string): void {
    if (!this._L || !this._map) return;
    if (this._currentTileLayer) {
      this._map.removeLayer(this._currentTileLayer);
    }
    const layer = this._baseLayers[key];
    if (layer) {
      layer.addTo(this._map);
      this._currentTileLayer = layer;
    }
    this.currentLayer.set(key);
  }

  clearMeasurement(): void {
    this._removeTempElements();
    this._removeFinalShape();
    this._removePopup();
    this._drawnPoints = [];
    this.areaResult.set(null);
    this.distanceResult.set(null);
    this.drawingState.set('idle');

    const mode = this.activeMode();
    if (mode && this._map) {
      this._unbindMapEvents();
      if (mode === 'area') {
        this.enableAreaMode();
      } else {
        this.enableDistanceMode();
      }
    }
  }

  resetMeasurement(): void {
    this._unbindMapEvents();
    this._removeTempElements();
    this._removeFinalShape();
    this._removePopup();
    this._drawnPoints = [];
    this.areaResult.set(null);
    this.distanceResult.set(null);
    this.activeMode.set(null);
    this.drawingState.set('idle');
    this.statusMessage.set(
      'Select a measurement type and draw on the map to calculate area or distance.',
    );
    if (this._map) {
      this._map.getContainer().style.cursor = '';
    }
  }

  // ─── Map initialisation ───────────────────────────────────────────────────

  private async initializeMap(): Promise<void> {
    const mod = await import('leaflet');
    this._L =
      (mod as unknown as { default?: LeafletModule }).default ??
      (mod as unknown as LeafletModule);

    // Fix default Leaflet marker paths for Angular / Webpack asset pipeline
    delete (this._L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
    this._L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/images/marker-icon-2x.png',
      iconUrl: '/assets/images/marker-icon.png',
      shadowUrl: '/assets/images/marker-shadow.png',
    });

    this._map = this._L.map('measurement-map', {
      center: [28.2, 94.5],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: false, // Handled manually to close drawing
      boxZoom: true,
      keyboard: true,
      dragging: true,
    });

    this._buildBaseLayers();
    this._baseLayers['streets'].addTo(this._map);
    this._currentTileLayer = this._baseLayers['streets'];

    this._L.control.scale({ imperial: false }).addTo(this._map);

    // Let the DOM settle before telling Leaflet its size
    setTimeout(() => this._map?.invalidateSize(), 150);
  }

  private _buildBaseLayers(): void {
    if (!this._L) return;
    this._baseLayers = {
      streets: this._L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        },
      ),
      satellite: this._L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 18 },
      ),
      light: this._L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '© CartoDB', maxZoom: 20 },
      ),
      terrain: this._L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenTopoMap', maxZoom: 17 },
      ),
    };
  }

  // ─── Mode activation ─────────────────────────────────────────────────────

  private enableAreaMode(): void {
    if (!this._map) return;
    this.drawingState.set('idle');
    this.statusMessage.set(
      'Click on the map to add polygon vertices. Double-click to finish drawing.',
    );
    this._map.getContainer().style.cursor = 'crosshair';
    this._map.on('click', this._onMapClick);
    this._map.on('dblclick', this._onMapDblClick);
  }

  private enableDistanceMode(): void {
    if (!this._map) return;
    this.drawingState.set('idle');
    this.statusMessage.set(
      'Click on the map to add points. Double-click on the last point to finish.',
    );
    this._map.getContainer().style.cursor = 'crosshair';
    this._map.on('click', this._onMapClick);
    this._map.on('dblclick', this._onMapDblClick);
  }

  // ─── Map event handlers (arrow-fn to preserve `this`) ────────────────────

  private readonly _onMapClick = (evt: L.LeafletMouseEvent): void => {
    if (this.drawingState() === 'complete') return;
    this.drawingState.set('drawing');
    this._drawnPoints.push(evt.latlng);
    this._addVertexMarker(evt.latlng);
    this._refreshPreviewLine();
    this.cdr.detectChanges();
  };

  private readonly _onMapDblClick = (_evt: L.LeafletMouseEvent): void => {
    if (this.drawingState() !== 'drawing') return;

    // The single click that fired just before dblclick added an extra point – undo it
    if (this._drawnPoints.length > 0) {
      this._drawnPoints.pop();
      // Remove the temp marker that corresponds to the popped point
      const lastMarker = this._tempMarkers.pop();
      if (lastMarker && this._map) {
        this._map.removeLayer(lastMarker);
      }
    }

    const mode = this.activeMode();
    const minPoints = mode === 'area' ? 3 : 2;

    if (this._drawnPoints.length < minPoints) {
      this.statusMessage.set(
        `At least ${minPoints} points are needed to measure ${mode === 'area' ? 'area' : 'distance'}.`,
      );
      // Restore drawing state
      this.drawingState.set(this._drawnPoints.length === 0 ? 'idle' : 'drawing');
      this.cdr.detectChanges();
      return;
    }

    this._finishDrawing();
    this.cdr.detectChanges();
  };

  // ─── Drawing helpers ──────────────────────────────────────────────────────

  private _addVertexMarker(latlng: L.LatLng): void {
    if (!this._L || !this._map) return;
    const m = this._L
      .circleMarker(latlng, {
        radius: 5,
        color: '#004ac6',
        weight: 2,
        fillColor: '#ffffff',
        fillOpacity: 1,
      })
      .addTo(this._map);
    this._tempMarkers.push(m);
  }

  private _refreshPreviewLine(): void {
    if (!this._L || !this._map || this._drawnPoints.length < 2) return;
    if (this._tempPolyline) {
      this._map.removeLayer(this._tempPolyline);
    }
    this._tempPolyline = this._L
      .polyline(this._drawnPoints, {
        color: '#004ac6',
        weight: 2,
        dashArray: '6 4',
        opacity: 0.75,
      })
      .addTo(this._map);
  }

  private _finishDrawing(): void {
    this._removeTempElements();
    this._unbindMapEvents();
    if (this._map) this._map.getContainer().style.cursor = '';
    this.drawingState.set('complete');

    const mode = this.activeMode();
    if (mode === 'area') {
      this._renderFinalPolygon();
      this._computeAndShowArea();
    } else if (mode === 'distance') {
      this._renderFinalPolyline();
      this._computeAndShowDistance();
    }
  }

  private _renderFinalPolygon(): void {
    if (!this._L || !this._map) return;
    this._finalShape = this._L
      .polygon(this._drawnPoints, {
        color: '#004ac6',
        weight: 2,
        fillColor: '#004ac6',
        fillOpacity: 0.18,
      })
      .addTo(this._map);
    this._renderFinalVertices();
  }

  private _renderFinalPolyline(): void {
    if (!this._L || !this._map) return;
    this._finalShape = this._L
      .polyline(this._drawnPoints, { color: '#004ac6', weight: 3 })
      .addTo(this._map);
    this._renderFinalVertices();
  }

  private _renderFinalVertices(): void {
    if (!this._L || !this._map) return;
    this._drawnPoints.forEach((pt) => {
      const m = this._L!
        .circleMarker(pt, {
          radius: 5,
          color: '#004ac6',
          weight: 2,
          fillColor: '#ffffff',
          fillOpacity: 1,
        })
        .addTo(this._map!);
      this._finalVertexMarkers.push(m);
    });
  }

  // ─── Calculations ─────────────────────────────────────────────────────────

  private _computeAndShowArea(): void {
    const pts = this._drawnPoints;
    if (pts.length < 3) return;

    const sqM = this._sphericalPolygonAreaM2(pts);
    const result: AreaResult = {
      sqMeters: sqM,
      hectares: sqM / 10_000,
      sqKilometers: sqM / 1_000_000,
    };
    this.areaResult.set(result);

    const centroid = this._centroid(pts);
    this._showPopup(centroid, this._buildAreaPopupHtml(result));
    this.statusMessage.set('Area measurement complete. Click Clear to draw a new shape.');
  }

  private _computeAndShowDistance(): void {
    const pts = this._drawnPoints;
    if (pts.length < 2) return;

    let totalM = 0;
    for (let i = 1; i < pts.length; i++) {
      totalM += this._haversineMeters(pts[i - 1], pts[i]);
    }
    const straightM = this._haversineMeters(pts[0], pts[pts.length - 1]);

    const result: DistanceResult = {
      totalKm: totalM / 1000,
      straightKm: straightM / 1000,
    };
    this.distanceResult.set(result);

    this._showPopup(pts[pts.length - 1], this._buildDistancePopupHtml(result));
    this.statusMessage.set('Distance measurement complete. Click Clear to draw a new line.');
  }

  /**
   * Spherical excess (Girard's theorem) – accurate geodesic polygon area.
   * Returns area in square metres.
   */
  private _sphericalPolygonAreaM2(pts: L.LatLng[]): number {
    const R = 6_371_008.8; // mean Earth radius (metres)
    const n = pts.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const φ1 = (a.lat * Math.PI) / 180;
      const φ2 = (b.lat * Math.PI) / 180;
      const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
      sum += Δλ * (2 + Math.sin(φ1) + Math.sin(φ2));
    }
    return Math.abs((R * R * sum) / 2);
  }

  /** Haversine distance between two LatLng points in metres. */
  private _haversineMeters(a: L.LatLng, b: L.LatLng): number {
    const R = 6_371_008.8;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = φ2 - φ1;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const h =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  private _centroid(pts: L.LatLng[]): L.LatLng {
    const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
    return this._L!.latLng(lat, lng);
  }

  // ─── Popup ────────────────────────────────────────────────────────────────

  private _showPopup(latlng: L.LatLng, content: string): void {
    if (!this._L || !this._map) return;
    this._removePopup();
    this._measurementPopup = this._L
      .popup({
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        className: 'meas-popup',
        maxWidth: 220,
      })
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this._map);
  }

  private _buildAreaPopupHtml(r: AreaResult): string {
    return `
      <div class="meas-popup__body">
        <p class="meas-popup__title">Area</p>
        <p class="meas-popup__primary">${this._fmt(r.sqKilometers, 2)} km²</p>
        <p class="meas-popup__secondary">(${this._fmt(r.hectares, 0)} ha)</p>
      </div>`;
  }

  private _buildDistancePopupHtml(r: DistanceResult): string {
    return `
      <div class="meas-popup__body">
        <p class="meas-popup__title">Total Distance</p>
        <p class="meas-popup__primary">${this._fmt(r.totalKm, 2)} km</p>
        <p class="meas-popup__secondary">Straight&nbsp;line: ${this._fmt(r.straightKm, 2)} km</p>
      </div>`;
  }

  private _fmt(value: number, decimals: number): string {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // ─── Cleanup helpers ──────────────────────────────────────────────────────

  private _unbindMapEvents(): void {
    this._map?.off('click', this._onMapClick);
    this._map?.off('dblclick', this._onMapDblClick);
  }

  private _removeTempElements(): void {
    this._tempMarkers.forEach((m) => this._map?.removeLayer(m));
    this._tempMarkers = [];
    if (this._tempPolyline) {
      this._map?.removeLayer(this._tempPolyline);
      this._tempPolyline = null;
    }
  }

  private _removeFinalShape(): void {
    if (this._finalShape) {
      this._map?.removeLayer(this._finalShape);
      this._finalShape = null;
    }
    this._finalVertexMarkers.forEach((m) => this._map?.removeLayer(m));
    this._finalVertexMarkers = [];
  }

  private _removePopup(): void {
    if (this._measurementPopup && this._map) {
      this._map.removeLayer(this._measurementPopup);
      this._measurementPopup = null;
    }
  }

  private cleanup(): void {
    this._unbindMapEvents();
    this._removeTempElements();
    this._removeFinalShape();
    this._removePopup();
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    this._L = null;
  }
}
