# Contract: MapAdapter (Internal)

**Feature**: `003-interactive-map-pins`  
**Layer**: Infrastructure → Presentation boundary  
**Implementation**: `src/app/infrastructure/geo/leaflet-map.adapter.ts`  
**Consumer**: `MapFacade` (`presentation/features/map/map.facade.ts`)

Only `LeafletMapAdapter` MAY import the `leaflet` package (Constitution Principle VI).

---

## MapAdapter Interface

```typescript
export interface MapInitOptions {
  center: [number, number];       // Default [28.2, 94.5] — AP centroid fallback
  zoom: number;                   // Default 8
  minZoom?: number;
  maxZoom?: number;
}

export interface ProjectMarkerInput {
  id: string;
  latitude: number;
  longitude: number;
  label: string;                  // projectName for tooltip title
  tooltip: string;                // "projectName — locationName"
}

export interface BlockLayerInput {
  id: string;
  geometry: GeoJSON.Geometry;
  name: string;
  districtName: string;
  style?: 'default' | 'highlight';
}

export abstract class MapAdapter {
  abstract initialize(container: HTMLElement, options: MapInitOptions): Promise<void>;

  /** Render block polygons from ARUNACHAL_PRADESH_BLOCK.geojson (filtered subset) */
  abstract setBlockLayer(blocks: BlockLayerInput[]): void;

  /** Replace all project markers; cluster when count > 50 */
  abstract setProjectMarkers(markers: ProjectMarkerInput[]): void;

  /** Pan/zoom to show a single project pin */
  abstract focusMarker(projectId: string, zoom?: number): void;

  /** Fit viewport to geographic scope bounds */
  abstract fitBounds(bounds: { southWest: [number, number]; northEast: [number, number] }): void;

  /** Highlight one block polygon by id */
  abstract highlightBlock(blockId: string | null): void;

  /** Register event handlers */
  abstract onMarkerClick(handler: (projectId: string) => void): void;
  abstract onBlockClick(handler: (blockId: string, blockName: string) => void): void;

  /** Optional — stub for US-03c */
  abstract setBaseLayer(layerId: 'osm' | 'satellite'): void;

  abstract invalidateSize(): void;
  abstract destroy(): void;
}
```

---

## LeafletMapAdapter Behavior

| Method | Leaflet implementation |
|--------|------------------------|
| `initialize` | `L.map(container, options)` + default OSM tile layer |
| `setBlockLayer` | `L.geoJSON(features, { style, onEachFeature })` — replace previous layer |
| `setProjectMarkers` | `L.marker` or `L.markerClusterGroup` when > 50 |
| `focusMarker` | `map.setView([lat, lng], zoom)` with fly animation |
| `fitBounds` | `map.fitBounds(L.latLngBounds(sw, ne), { padding: [20, 20] })` |
| `highlightBlock` | Reset styles; set `fillOpacity: 0.4` on selected feature |
| `onMarkerClick` | `marker.on('click', () => handler(id))` |
| `destroy` | `map.remove()` + clear layer refs |

---

## Default Styles

| Layer | stroke | fill | fillOpacity |
|-------|--------|------|-------------|
| Block default | `#3388ff` | `#3388ff` | 0.1 |
| Block highlight | `#ff7800` | `#ff7800` | 0.35 |
| Project marker | Leaflet default pin | — | — |

---

## SSR Safety

- `MapFacade.initialize()` MUST no-op when `!isPlatformBrowser(platformId)`
- `HomeMapComponent` template shows placeholder div with loading state during SSR

---

## Events Emitted to MapFacade

| User action | Adapter callback | Facade response |
|-------------|------------------|-----------------|
| Click marker | `onMarkerClick(id)` | Set `selectedPinId`, open summary |
| Click block polygon | `onBlockClick(id, name)` | Forward to `MapSelectionStore` (US-02c sync) |
| (none) | — | Sidebar select → `focusMarker(id)` |

---

## Lifecycle

```text
HomeMapComponent.ngAfterViewInit
  → MapFacade.initialize(containerEl)
    → MapAdapter.initialize()
    → LoadBlockBoundariesUseCase
    → GetMappableProjectsUseCase
    → setBlockLayer + setProjectMarkers + fitBounds

HomeMapComponent.ngOnDestroy
  → MapFacade.destroy()
    → MapAdapter.destroy()
```
