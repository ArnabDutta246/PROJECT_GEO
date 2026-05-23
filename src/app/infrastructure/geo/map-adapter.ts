import { GeoJsonGeometry } from '@domain/value-objects/geo-json-geometry.vo';

export interface MapInitOptions {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface ProjectMarkerInput {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  tooltip: string;
  schemeType: string;
  materialIcon: string;
  color: string;
}

export interface BlockLayerInput {
  id: string;
  geometry: GeoJsonGeometry;
  name: string;
  districtName: string;
  style?: 'default' | 'highlight';
}

export interface MapBoundsInput {
  southWest: [number, number];
  northEast: [number, number];
}

export interface MapClickEvent {
  latitude: number;
  longitude: number;
}

export interface ResolvedBlockClick {
  blockId: string;
  blockName: string;
}

export abstract class MapAdapter {
  abstract initialize(container: HTMLElement, options: MapInitOptions): Promise<void>;
  abstract setBlockLayer(blocks: BlockLayerInput[]): void;
  abstract setProjectMarkers(markers: ProjectMarkerInput[]): void;
  abstract focusMarker(projectId: string, zoom?: number): void;
  abstract fitBounds(bounds: MapBoundsInput): void;
  abstract highlightBlock(blockId: string | null): void;
  abstract onMarkerClick(handler: (projectId: string) => void): void;
  abstract onBlockClick(handler: (blockId: string, blockName: string) => void): void;
  abstract onDistrictClick(handler: (districtName: string) => void): void;
  abstract onMapClick(handler: (event: MapClickEvent) => void): void;
  abstract resolveBlockAt(latitude: number, longitude: number): ResolvedBlockClick | null;
  abstract setBaseLayer(layerId: 'osm' | 'satellite'): void;
  abstract invalidateSize(): void;
  abstract destroy(): void;
}
