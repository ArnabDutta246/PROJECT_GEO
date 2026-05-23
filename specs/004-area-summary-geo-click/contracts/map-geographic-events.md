# Contract: Map Geographic Events

**Feature**: `004-area-summary-geo-click`  
**Extends**: [map-adapter.md](../../003-interactive-map-pins/contracts/map-adapter.md)  
**Implementation**: `src/app/infrastructure/geo/leaflet-map.adapter.ts`  
**Consumer**: `MapFacade` (`presentation/features/map/map.facade.ts`)

---

## Extended MapAdapter Interface

```typescript
export interface MapClickEvent {
  latitude: number;
  longitude: number;
}

export abstract class MapAdapter {
  // ... existing methods from US-03 ...

  /** Fired when user clicks a block polygon (existing — wire in MapFacade) */
  abstract onBlockClick(handler: (blockId: string, blockName: string) => void): void;

  /** Fired when user clicks a district polygon (US-03a layer) */
  abstract onDistrictClick(handler: (districtName: string) => void): void;

  /** Fired when user clicks map background (not marker); excludes marker clicks */
  abstract onMapClick(handler: (event: MapClickEvent) => void): void;
}
```

---

## Event Behavior

| Event | When fired | Payload | US-04 action |
|-------|------------|---------|--------------|
| `onBlockClick` | Click block polygon | `blockId`, `blockName` | Open block-scoped area summary |
| `onDistrictClick` | Click district polygon (US-03a) | `districtName` | Open district-scoped area summary |
| `onMapClick` | Click map tile/background | `{ latitude, longitude }` | PIP → block scope if inside polygon |
| `onMarkerClick` | Click project pin (existing) | `projectId` | Close area summary; open project summary |

**Click precedence:** Marker click MUST NOT propagate to `onMapClick`. Block polygon click MUST NOT fire `onMapClick`.

---

## LeafletMapAdapter Implementation Notes

### onBlockClick (existing)

Already attached in `onEachFeature` for block layer. **US-04 task:** Register handler in `MapFacade.initialize()`:

```typescript
this.mapAdapter.onBlockClick((blockId, blockName) => {
  void this.openAreaSummaryFromBlock(blockId, blockName);
});
```

### onDistrictClick (new)

Attach when district GeoJSON layer added (US-03a). Until then, register no-op or defer layer creation.

```typescript
onDistrictClick(handler: (districtName: string) => void): void {
  this.districtClickHandler = handler;
}
```

### onMapClick (new)

```typescript
onMapClick(handler: (event: MapClickEvent) => void): void {
  this.map?.on('click', (e: L.LeafletMouseEvent) => {
    if (this.clickTargetIsMarkerOrBoundary(e)) return;
    handler({ latitude: e.latlng.lat, longitude: e.latlng.lng });
  });
}
```

**Point-in-polygon:** Resolve click against `blockFeatures` cache:

```typescript
resolveBlockAt(lat: number, lng: number): { id: string; name: string } | null
```

Use ray-casting on polygon rings from stored GeoJSON coordinates.

---

## MapFacade Handler Registry

```typescript
// map.facade.ts — initialize()
this.mapAdapter.onBlockClick((id, name) => this.handleBlockSelection(id, name));
this.mapAdapter.onDistrictClick((district) => this.handleDistrictSelection(district));
this.mapAdapter.onMapClick(({ latitude, longitude }) =>
  this.handleMapAreaClick(latitude, longitude)
);
this.mapAdapter.onMarkerClick((projectId) => this.openSummary(projectId));
```

### handleBlockSelection

1. Find `GeoBoundary` in `currentBlocks` by id
2. Build `GeoScope.block(stateName, districtName, blockName)`
3. Call `openAreaSummary(scope)`
4. `highlightBlock(id)` — visual feedback

### handleDistrictSelection

1. Build `GeoScope.district(stateName, districtName)`
2. Call `openAreaSummary(scope)`
3. Highlight all blocks in district (interim) or district layer (US-03a)

### handleMapAreaClick

1. `resolveBlockAt(lat, lng)` via adapter or facade using `currentBlocks`
2. If null → card does not update
3. Else → same as block selection

---

## Area Summary vs Project Panel

Area summary renders in the **Regional Statistics sidebar**; project detail panel renders on the **map**. Both MAY be visible simultaneously.

```typescript
private async openAreaSummary(scope: GeoScope): Promise<void> {
  this.areaSummaryLoading.set(true);
  // ... use case → updates sidebar card ...
}

private openSummary(projectId: string): void {
  // Does not clear area summary card
  this.summaryOpen.set(true);
}
```

---

## Sync with Dashboard Filters

**US-04 requirement:** Opening/closing area summary MUST NOT reset geographic filter dropdowns.

| Action | MapSelectionStore | Filter dropdowns |
|--------|-------------------|------------------|
| Open area summary | Optional: set `selectedAreaScope` | Unchanged |
| Close area summary | Clear `selectedAreaScope` | Unchanged |
| Block click highlight | May call `highlightBlock` only | Unchanged unless US-03a sync spec says otherwise |

**US-03a future sync:** District boundary click may also call `selectDistrict()` — coordinated in US-03a plan, not US-04.

---

## Browser Guard

All handler registration occurs inside `MapFacade.initialize()` after `isPlatformBrowser` check — same as US-03.

---

## Contract Tests (manual)

1. Click block polygon → area summary opens with block name and block population
2. Click project pin → project summary replaces area summary
3. Click map outside all polygons → no panel
4. Click map inside block polygon → same as block click
5. Close area summary → map zoom/filters unchanged
