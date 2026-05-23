import {
  BlockLayerInput,
  MapAdapter,
  MapBoundsInput,
  MapInitOptions,
  ProjectMarkerInput,
} from './map-adapter';

type LeafletModule = typeof import('leaflet');

export class LeafletMapAdapter extends MapAdapter {
  private L: LeafletModule | null = null;
  private map: import('leaflet').Map | null = null;
  private blockLayer: import('leaflet').GeoJSON | null = null;
  private markerLayer: import('leaflet').LayerGroup | null = null;
  private baseTileLayer: import('leaflet').TileLayer | null = null;
  private satelliteTileLayer: import('leaflet').TileLayer | null = null;
  private markerIndex = new Map<string, import('leaflet').Marker>();
  private markerClickHandler: ((projectId: string) => void) | null = null;
  private blockClickHandler: ((blockId: string, blockName: string) => void) | null = null;
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

    this.baseTileLayer = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    this.satelliteTileLayer = this.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    );
    this.baseTileLayer.addTo(this.map);
    this.markerLayer = this.L.layerGroup().addTo(this.map);
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
          layer.on('click', () => {
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
      const icon = this.L!.divIcon({
        className: useCompactMarkers ? 'project-pin-compact' : 'project-map-pin',
        html: '<div class="project-pin-marker"></div>',
        iconSize: useCompactMarkers ? [10, 10] : [14, 14],
        iconAnchor: useCompactMarkers ? [5, 5] : [7, 7],
      });

      const leafletMarker = this.L!.marker([marker.latitude, marker.longitude], { icon });
      leafletMarker.bindTooltip(marker.tooltip, {
        direction: 'top',
        opacity: 0.95,
      });
      leafletMarker.on('click', () => this.markerClickHandler?.(marker.id));
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

  setBaseLayer(layerId: 'osm' | 'satellite'): void {
    if (!this.map || !this.baseTileLayer || !this.satelliteTileLayer) {
      return;
    }
    if (layerId === 'satellite') {
      this.map.removeLayer(this.baseTileLayer);
      this.satelliteTileLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.satelliteTileLayer);
      this.baseTileLayer.addTo(this.map);
    }
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
    this.baseTileLayer = null;
    this.satelliteTileLayer = null;
    this.L = null;
  }

  private blockStyle(highlight: boolean): import('leaflet').PathOptions {
    return highlight
      ? { color: '#ff7800', weight: 2, fillColor: '#ff7800', fillOpacity: 0.35 }
      : { color: '#3388ff', weight: 2, fillColor: '#3388ff', fillOpacity: 0.1 };
  }
}
