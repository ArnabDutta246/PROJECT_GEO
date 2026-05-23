# Data Model: Interactive Map with Project Pins

**Feature**: `003-interactive-map-pins`  
**Date**: 2026-05-23  
**Authority**: [spec.md](./spec.md), [architecture.md](../../architecture.md) §5.1  
**Extends**: Platform entities from `specs/002-geo-monitoring-platform/data-model.md`

US-03 reuses existing `Project`, `Coordinates`, `Jurisdiction`, `User`, and `GeoBoundary` entities. This document defines **additions and extensions** for map pin plotting.

---

## Value Objects

### ProjectPin (`domain/value-objects/project-pin.vo.ts`) — NEW

Lightweight map-layer representation of a project. Not a duplicate entity — derived from `Project`.

| Field | Type | Validation |
|-------|------|------------|
| id | `string` | Required, stable for marker identity |
| projectName | `string` | Required |
| activityName | `string` | Required |
| schemeType | `string` | Required |
| locationName | `string` | Required (may be empty string → tooltip shows "Location unavailable") |
| coordinates | `Coordinates` | Required, valid lat/lng |
| districtName | `string` | Required for filter sync |
| blockName | `string` | Required for filter sync |

**Factory:** `ProjectPin.fromProject(project: Project): ProjectPin | null` — returns `null` if coordinates invalid.

**Used by:** `LeafletMapAdapter.setProjectMarkers()`, `MapFacade`, summary panel ViewModel.

---

### MapBounds (`domain/value-objects/map-bounds.vo.ts`) — NEW

| Field | Type | Description |
|-------|------|-------------|
| southWest | `Coordinates` | SW corner |
| northEast | `Coordinates` | NE corner |

**Factory:** `MapBounds.fromGeoJsonFeatures(features: GeoBoundary[]): MapBounds`

**Used by:** `MapAdapter.fitBounds()`.

---

### CensusAttributes (`domain/value-objects/census-attributes.vo.ts`) — NEW (optional read)

| Field | Type | GeoJSON source |
|-------|------|----------------|
| totalPopulation | `number` | `TOT_P` |
| malePopulation | `number` | `TOT_M` |
| femalePopulation | `number` | `TOT_F` |
| scPopulation | `number` | `P_SC` |
| stPopulation | `number` | `P_ST` |
| households | `number` | `No_HH` |

**Note:** Read from block GeoJSON for future US-04a; not displayed in US-03 summary panel.

---

## Entities (Extensions)

### GeoBoundary — EXTEND existing entity

| Field | Type | Notes |
|-------|------|-------|
| id | `string` | `CENSUS_COD` or `OBJECTID` as string |
| name | `string` | Block name from `Mouza Name` |
| displayName | `string` | From `NAME` (mixed case label) |
| level | `'block'` | Always `block` for this file |
| districtName | `string` | From `DISTRICT_N` |
| stateId | `string` | From `SID` (e.g. `"12"`) |
| censusAttributes | `CensusAttributes \| null` | Parsed census fields |
| geometry | `GeoJsonGeometry` | Raw polygon for adapter (Infrastructure DTO boundary) |

**Rules:**
- One `GeoBoundary` per Feature in `ARUNACHAL_PRADESH_BLOCK.geojson`
- Filter by `districtName` / `name` using case-insensitive match

---

### Project — REUSE (no schema change)

Existing `Project` entity supplies pin data. US-03 reads only; no mutations.

| Relevant fields | Map usage |
|-----------------|-----------|
| `coordinates` | Marker position |
| `projectName`, `activityName`, `schemeType`, `locationName` | Tooltip + summary |
| `jurisdiction.districts[0]`, `jurisdiction.blocks[0]` | Filter consistency with dropdowns |

---

## Presentation View Models

### ProjectSummaryViewModel (`presentation/features/map/models/project-summary.view-model.ts`)

| Field | Type | Source |
|-------|------|--------|
| id | `string` | ProjectPin.id |
| projectName | `string` | |
| schemeType | `string` | |
| locationName | `string` | |
| districtName | `string` | |
| blockName | `string` | |
| latitude | `number` | Display only |
| longitude | `number` | Display only |

**Factory:** `ProjectSummaryViewModel.fromPin(pin: ProjectPin)`

---

### MapStateViewModel (signals in `MapFacade`)

| Signal | Type | Description |
|--------|------|-------------|
| `loading` | `boolean` | GeoJSON or projects loading |
| `error` | `string \| null` | User-friendly error |
| `pins` | `ProjectPin[]` | Current visible markers |
| `selectedPinId` | `string \| null` | Highlighted marker |
| `summaryOpen` | `boolean` | Summary panel visibility |
| `blockLayerReady` | `boolean` | GeoJSON rendered |

---

## Repository Ports

### GeoBoundaryRepository (`domain/repositories/geo-boundary.repository.ts`) — NEW

```typescript
abstract class GeoBoundaryRepository {
  abstract loadBlockBoundaries(): Observable<GeoBoundary[]>;
  abstract getBlocksByDistrict(districtName: string): Observable<GeoBoundary[]>;
  abstract getBlockByName(districtName: string, blockName: string): Observable<GeoBoundary | null>;
}
```

**Implementation:** `GeoJsonFileRepository` → fetches `/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`

---

## State Transitions

### Map Selection State (`MapSelectionStore` extensions)

| Event | Store update | Map effect |
|-------|--------------|------------|
| `selectProject(id)` | `selectedProjectId = id` | Center pin, open summary |
| `clearProjectSelection()` | `selectedProjectId = null` | Close summary, clear highlight |
| `selectDistrict(...)` | Existing | Filter block layer + pins, fit bounds |
| `selectBlock(...)` | Existing | Highlight block, fit bounds |

**Invariant:** Geographic filter state MUST NOT reset when summary panel opens/closes (FR-008).

---

## Validation Rules

| Rule | Layer | Enforcement |
|------|-------|-------------|
| Pin requires valid coordinates | Domain | `Coordinates.create()` |
| Pin within user jurisdiction | Application | `GetMappableProjectsUseCase` + `Jurisdiction.includes*` |
| No pins before auth | Presentation | `MapFacade` waits for `currentUser` signal |
| GeoJSON fetch failure | Infrastructure | Catch HTTP error → `ApplicationError`; map shows base tiles only |
| Block name match | Infrastructure mapper | `normalizeGeoName()` on both sides |

---

## Entity Relationship Diagram

```text
User ──has──▶ Jurisdiction
                │
Project ──has──▶ Coordinates ──plotted as──▶ ProjectPin
   │                                              │
   └── filtered by ──▶ Geographic Filter ◀── MapSelectionStore
                              │
GeoBoundary (from ARUNACHAL_PRADESH_BLOCK.geojson)
   └── provides viewport bounds + block polygon layer
```

---

## File → Domain Mapping (`ARUNACHAL_PRADESH_BLOCK.geojson`)

| GeoJSON `properties` | Domain field |
|----------------------|--------------|
| `Mouza Name` | `GeoBoundary.name` |
| `NAME` | `GeoBoundary.displayName` |
| `DISTRICT_N` | `GeoBoundary.districtName` |
| `SID` | `GeoBoundary.stateId` |
| `CENSUS_COD` / `OBJECTID` | `GeoBoundary.id` |
| `TOT_P`, `TOT_M`, `TOT_F`, `P_SC`, `P_ST`, `No_HH` | `CensusAttributes` |
| `geometry` | `GeoBoundary.geometry` |

See [contracts/geojson-block-layer.md](./contracts/geojson-block-layer.md) for full schema.
