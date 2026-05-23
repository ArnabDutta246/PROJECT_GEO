# Research: Interactive Map with Project Pins (US-03)

**Feature**: `003-interactive-map-pins`  
**Date**: 2026-05-23  
**Authority**: [spec.md](./spec.md), [architecture.md](../../architecture.md), user directive to use `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`

---

## R-01: Block GeoJSON Source Path

**Decision:** Use **`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`** as the single authoritative block boundary file for the home dashboard Leaflet map.

**Rationale:** User explicitly specified this path. File contains ~150 block/circle polygons for Arunachal Pradesh with census attributes (`TOT_P`, `Mouza Name`, `DISTRICT_N`, etc.) required for viewport fitting and future analytics fallback. Constitution names this file as authoritative block layer.

**Alternatives considered:**
- **`src/assets/geojson/` copy:** Duplicate exists but user pointed to `src/app/geojson/` — consolidate serving path via `angular.json` asset mapping rather than maintaining two copies.
- **Legacy `ArunachalPradeshMouza_1.js` scripts:** Rejected — non-standard format, loaded via global window variables, tightly coupled to monolithic `map.ts`.

**Serving strategy:** Add Angular asset entry mapping `src/app/geojson` → `/geojson/`; fetch at runtime with `HttpClient` to avoid bundling 2MB+ into the main chunk.

---

## R-02: GeoJSON Feature Matching

**Decision:** Match dropdown selections to GeoJSON features using **case-insensitive** comparison on:
- District: `properties.DISTRICT_N` ↔ GEOAPI district name (e.g. `CHANGLANG` ↔ `CHANGLANG`)
- Block: `properties['Mouza Name']` ↔ GEOAPI block name (e.g. `MIGGING`)

**Rationale:** US-02c / EC-04; API returns uppercase names; GeoJSON uses mixed case in `NAME` field. Reuse existing `normalizeGeoName()` from `jurisdiction.mapper.ts`.

**Alternatives considered:**
- **Match on `CENSUS_COD` / numeric IDs:** Rejected for MVP — GEOAPI block IDs may not map 1:1 to census codes in all environments; name match is established pattern in legacy code.

---

## R-03: Leaflet Integration Pattern

**Decision:** `MapAdapter` abstract class + `LeafletMapAdapter` in `infrastructure/geo/`; Presentation uses `MapFacade` only.

**Rationale:** Constitution Principle VI, ADR-05; enables SSR safety, testability, and decouples from 2400-line legacy `map.ts`.

**Runtime:** Initialize in `HomeMapComponent.ngAfterViewInit` with `isPlatformBrowser` guard; dynamic `import('leaflet')` to keep initial bundle smaller.

**Alternatives considered:**
- **Extend legacy `map.ts` directly:** Rejected — violates Clean Architecture migration; file already exceeds size guidelines.

---

## R-04: Viewport Auto-Fit by Role

**Decision:** Compute Leaflet `LatLngBounds` from filtered block feature geometries:

| Role | Filter | Fit target |
|------|--------|------------|
| State Manager | All features (or district-filtered) | Combined bounds of matching polygons |
| District Manager | `DISTRICT_N` = assigned district | District block collection bounds |
| Block Manager | `Mouza Name` = assigned block | Single polygon bounds |

**Rationale:** FR-MAP-08; block GeoJSON provides accurate administrative bounds without separate district file for MVP.

**Alternatives considered:**
- **Fixed center `[28.2, 94.5]` zoom 8:** Rejected — poor UX for Block/District managers who need immediate local context.

---

## R-05: Project Pin Data Source

**Decision:** Reuse `GetProjectsByJurisdictionUseCase` + new `GetMappableProjectsUseCase` that filters projects where `Coordinates.create()` succeeds (valid lat/lng).

**Rationale:** Constitution Principle V; projects already loaded in `HomeFacade`; avoid duplicate API calls. Local repo for dev until `ProjectApiRepository` ships.

**Pin identity:** Use project `id` (or generated stable key from name+coords for legacy local data).

**Alternatives considered:**
- **Separate map-only API endpoint:** Not available; pending in `contracts/projects-for-map.md`.

---

## R-06: Marker Clustering & Performance

**Decision:**
- Fetch GeoJSON once per session; cache in `GeoJsonFileRepository`
- Filter features in memory by district/block (150 features — acceptable)
- Enable marker clustering when visible pin count > 50
- Default base tile: OpenStreetMap (US-03c will add switcher)

**Rationale:** NFR-01 (map load ≤ 5s), FR-MAP-11; 2MB fetch is one-time cost on home load.

**Alternatives considered:**
- **Per-district GeoJSON files:** Better for multi-state scale but not needed for AP MVP with single consolidated file.

---

## R-07: Summary Panel vs Full Detail (US-03b)

**Decision:** US-03 delivers **`ProjectSummaryPanelComponent`** with fields: project name, scheme type, location, district, block. No tabs for beneficiaries/docs/media.

**Rationale:** Spec scope boundary; US-03b adds tabbed panel. Pin click and sidebar selection both open the same summary component.

**Alternatives considered:**
- **Embed full legacy detail panel from `map.ts`:** Rejected — couples to monolith; includes out-of-scope tabs.

---

## R-08: Legacy Bridge During Migration

**Decision:** Keep `MapSelectionService` sync from `HomeFacade` until US-03a retires legacy map component on home route. New `HomeMapComponent` becomes primary map on `/home`; legacy `<app-map>` replaced.

**Rationale:** Minimize regression risk during incremental migration; `MapSelectionStore` is the canonical state going forward.

---

## R-09: Angular Asset Configuration

**Decision:** Add to `angular.json` `assets` array:

```json
{
  "glob": "**/*",
  "input": "src/app/geojson",
  "output": "/geojson"
}
```

**Rationale:** GeoJSON at `src/app/geojson/` is not under `src/assets/` by default; explicit mapping required for `HttpClient.get('/geojson/ARUNACHAL_PRADESH_BLOCK.geojson')`.

**All NEEDS CLARIFICATION items resolved.**
