import {
  BlockLayerInput,
  MapAdapter,
  MapBaseLayerId,
  MapBoundsInput,
  MapClickEvent,
  MapInitOptions,
  ProjectMarkerInput,
  ResolvedBlockClick,
} from './map-adapter';
import { pointInGeoJsonGeometry } from './point-in-polygon.util';

type LeafletModule = typeof import('leaflet');

export class LeafletMapAdapter extends MapAdapter {
  private L: LeafletModule | null = null;
  private map: import('leaflet').Map | null = null;
  private blockLayer: import('leaflet').GeoJSON | null = null;
  private markerLayer: import('leaflet').LayerGroup | null = null;
  private tileLayers = new Map<MapBaseLayerId, import('leaflet').TileLayer>();
  private activeLayerId: MapBaseLayerId = 'streets';
  private markerIndex = new Map<string, import('leaflet').Marker>();
  private markerClickHandler: ((projectId: string) => void) | null = null;
  private blockClickHandler: ((blockId: string, blockName: string) => void) | null = null;
  private districtClickHandler: ((districtName: string) => void) | null = null;
  private mapClickHandler: ((event: MapClickEvent) => void) | null = null;
  private highlightedBlockId: string | null = null;
  private blockFeatures = new Map<string, BlockLayerInput>();

  async initialize(container: HTMLElement, options: MapInitOptions): Promise<void> {
    this.L = await import('leaflet');
    this.map = this.L.map(container, {
      center: options.center,
      zoom: options.zoom,
      minZoom: options.minZoom ?? 6,
      maxZoom: options.maxZoom ?? 18,
    });

    this.tileLayers.set(
      'streets',
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      })
    );
    this.tileLayers.set(
      'satellite',
      this.L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
        }
      )
    );
    this.tileLayers.set(
      'light',
      this.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      })
    );
    this.tileLayers.set(
      'terrain',
      this.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution:
          'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
        maxZoom: 17,
      })
    );

    this.tileLayers.get('streets')?.addTo(this.map);
    this.activeLayerId = 'streets';
    this.markerLayer = this.L.layerGroup().addTo(this.map);

    this.map.on('click', (event: import('leaflet').LeafletMouseEvent) => {
      this.mapClickHandler?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    });

    this.map.invalidateSize();
  }

  setBlockLayer(blocks: BlockLayerInput[]): void {
    if (!this.L || !this.map) {
      return;
    }

    this.blockFeatures.clear();
    blocks.forEach((block) => this.blockFeatures.set(block.id, block));

    if (this.blockLayer) {
      this.blockLayer.remove();
    }

    const features = blocks.map((block) => ({
      type: 'Feature' as const,
      properties: {
        id: block.id,
        name: block.name,
        districtName: block.districtName,
        style: block.style ?? 'default',
      },
      geometry: block.geometry,
    }));

    this.blockLayer = this.L.geoJSON(
      { type: 'FeatureCollection', features } as GeoJSON.FeatureCollection,
      {
        style: (feature) => this.blockStyle(feature?.properties?.['style'] === 'highlight'),
        onEachFeature: (feature, layer) => {
          const pathLayer = layer as import('leaflet').Path;
          pathLayer.on('mouseover', () => {
            if (this.highlightedBlockId === String(feature.properties?.['id'] ?? '')) {
              return;
            }
            pathLayer.setStyle(this.blockStyle(true, true));
          });
          pathLayer.on('mouseout', () => {
            const id = String(feature.properties?.['id'] ?? '');
            const isHighlighted = this.highlightedBlockId != null && id === this.highlightedBlockId;
            pathLayer.setStyle(this.blockStyle(isHighlighted));
          });
          layer.on('click', (event: import('leaflet').LeafletMouseEvent) => {
            this.L?.DomEvent.stopPropagation(event);
            const id = String(feature.properties?.['id'] ?? '');
            const name = String(feature.properties?.['name'] ?? '');
            this.blockClickHandler?.(id, name);
          });
        },
      }
    ).addTo(this.map);
  }

  setProjectMarkers(markers: ProjectMarkerInput[]): void {
    if (!this.L || !this.map || !this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();
    this.markerIndex.clear();

    const useCompactMarkers = markers.length > 50;

    markers.forEach((marker) => {
      const iconSize = useCompactMarkers ? 26 : 36;
      const iconClass = useCompactMarkers ? 'project-pin-compact' : 'project-map-pin';
      const icon = this.L!.divIcon({
        className: iconClass,
        html: `<div class="project-pin-marker" style="background-color:${marker.color};">
          <span class="material-icons project-pin-icon">${marker.materialIcon}</span>
        </div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const leafletMarker = this.L!.marker([marker.latitude, marker.longitude], { icon });
      leafletMarker.bindTooltip(marker.tooltip, {
        direction: 'top',
        opacity: 0.95,
      });
      leafletMarker.on('click', (event: import('leaflet').LeafletMouseEvent) => {
        this.L?.DomEvent.stopPropagation(event);
        this.markerClickHandler?.(marker.id);
      });
      leafletMarker.addTo(this.markerLayer!);
      this.markerIndex.set(marker.id, leafletMarker);
    });
  }

  focusMarker(projectId: string, zoom = 14): void {
    const marker = this.markerIndex.get(projectId);
    if (!this.map || !marker) {
      return;
    }
    const latLng = marker.getLatLng();
    this.map.flyTo(latLng, zoom, { duration: 0.75 });
  }

  fitBounds(bounds: MapBoundsInput): void {
    if (!this.L || !this.map) {
      return;
    }
    const leafletBounds = this.L.latLngBounds(
      [bounds.southWest[0], bounds.southWest[1]],
      [bounds.northEast[0], bounds.northEast[1]]
    );
    this.map.fitBounds(leafletBounds, { padding: [20, 20] });
  }

  highlightBlock(blockId: string | null): void {
    this.highlightedBlockId = blockId;
    if (!this.blockLayer) {
      return;
    }
    this.blockLayer.eachLayer((layer) => {
      const feature = (layer as import('leaflet').GeoJSON).feature as {
        properties?: { id?: string; style?: string };
      };
      const id = String(feature?.properties?.id ?? '');
      const isHighlighted = blockId != null && id === blockId;
      (layer as import('leaflet').Path).setStyle(this.blockStyle(isHighlighted));
    });
  }

  onMarkerClick(handler: (projectId: string) => void): void {
    this.markerClickHandler = handler;
  }

  onBlockClick(handler: (blockId: string, blockName: string) => void): void {
    this.blockClickHandler = handler;
  }

  onDistrictClick(handler: (districtName: string) => void): void {
    this.districtClickHandler = handler;
  }

  onMapClick(handler: (event: MapClickEvent) => void): void {
    this.mapClickHandler = handler;
  }

  resolveBlockAt(latitude: number, longitude: number): ResolvedBlockClick | null {
    for (const block of this.blockFeatures.values()) {
      if (pointInGeoJsonGeometry(latitude, longitude, block.geometry)) {
        return { blockId: block.id, blockName: block.name };
      }
    }
    return null;
  }

  setBaseLayer(layerId: MapBaseLayerId): void {
    if (!this.map || layerId === this.activeLayerId) {
      return;
    }

    const currentLayer = this.tileLayers.get(this.activeLayerId);
    const nextLayer = this.tileLayers.get(layerId);
    if (!nextLayer) {
      return;
    }

    if (currentLayer) {
      this.map.removeLayer(currentLayer);
    }
    nextLayer.addTo(this.map);
    this.activeLayerId = layerId;
    this.refreshBlockLayerStyles();
  }

  invalidateSize(): void {
    this.map?.invalidateSize();
  }

  destroy(): void {
    this.markerIndex.clear();
    this.blockFeatures.clear();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.blockLayer = null;
    this.markerLayer = null;
    this.tileLayers.clear();
    this.activeLayerId = 'streets';
    this.L = null;
    this.markerClickHandler = null;
    this.blockClickHandler = null;
    this.districtClickHandler = null;
    this.mapClickHandler = null;
  }

  private refreshBlockLayerStyles(): void {
    this.highlightBlock(this.highlightedBlockId);
  }

  private usesHighContrastBoundaries(): boolean {
    return this.activeLayerId === 'satellite' || this.activeLayerId === 'terrain';
  }

  private blockStyle(
    highlight: boolean,
    hover = false
  ): import('leaflet').PathOptions {
    const highContrast = this.usesHighContrastBoundaries();

    if (highlight) {
      if (highContrast) {
        return {
          color: '#ffffff',
          weight: hover ? 4 : 3.5,
          opacity: 1,
          fillColor: '#5141e0',
          fillOpacity: hover ? 0.45 : 0.38,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      return {
        color: hover ? '#6254e3' : '#5141e0',
        weight: hover ? 3.5 : 3,
        opacity: 1,
        fillColor: '#5141e0',
        fillOpacity: hover ? 0.24 : 0.18,
        lineJoin: 'round',
        lineCap: 'round',
      };
    }

    if (highContrast) {
      return {
        color: '#7dd3fc',
        weight: 2.75,
        opacity: 1,
        fillColor: '#2563eb',
        fillOpacity: 0.3,
        lineJoin: 'round',
        lineCap: 'round',
      };
    }

    return {
      color: '#004ac6',
      weight: 1.25,
      opacity: 0.5,
      fillColor: '#004ac6',
      fillOpacity: 0.04,
      dashArray: '6 8',
      lineJoin: 'round',
      lineCap: 'round',
    };
  }
}
