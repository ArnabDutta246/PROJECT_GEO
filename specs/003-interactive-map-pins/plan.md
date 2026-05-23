# Implementation Plan: Interactive Map with Project Pins

**Branch**: `003-interactive-map-pins` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-interactive-map-pins/spec.md`  
**Architecture authority**: [`architecture.md`](../../architecture.md) — Clean Architecture layers, MapAdapter pattern  
**GeoJSON authority**: [`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`](../../src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson) — authoritative block boundary layer for Leaflet map UI

## Summary

Deliver **US-03** — an interactive Leaflet map on the home dashboard that plots jurisdiction-scoped project pins, supports hover tooltips and click-to-summary, and syncs with sidebar project selection — using **`ARUNACHAL_PRADESH_BLOCK.geojson`** as the geographic canvas for viewport auto-fit and block boundary rendering.

**Technical approach:**

- Introduce `LeafletMapAdapter` (Infrastructure) behind a `MapAdapter` port; Presentation consumes `MapFacade` only — no direct Leaflet imports outside the adapter.
- Load block boundaries via HTTP fetch from `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` (served at `/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` after `angular.json` asset mapping); filter features by `DISTRICT_N` / `Mouza Name` with case-insensitive matching to GEOAPI dropdown labels.
- Plot project markers from `GetProjectsByJurisdictionUseCase` / `HomeFacade.projects()`; exclude projects with invalid coordinates.
- Role-based viewport: fit bounds of filtered block polygons (state = all AP blocks, district = district blocks, block = single block).
- Replace legacy `map.ts` district/mouza `.js` script loading on the home map path with the GeoJSON-based adapter (legacy `map.ts` remains for `/map` route until US-03a full migration).

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict: true`)  
**Primary Dependencies**: Angular 20.3, Leaflet 1.9.4, Bootstrap 5.3, RxJS 7.8  
**Storage**: GEOAPI REST (auth + jurisdiction); projects via `LocalProjectRepository` until API (`environment.useLocalData`); block GeoJSON static file at `src/app/geojson/`  
**Testing**: Jasmine + Karma (optional per story — not a plan gate)  
**Target Platform**: Browser (Chrome, Edge, Firefox); SSR shell only; map logic browser-only via `isPlatformBrowser`  
**Project Type**: Angular SPA feature slice within existing Clean Architecture refactor  
**Performance Goals**: Map + pins visible ≤ 5s (NFR-01); summary panel ≤ 2s (SC-003); cluster markers when > 50 pins in viewport  
**Constraints**: Leaflet only in `LeafletMapAdapter`; GeoJSON ~2MB — fetch once, filter in memory; no jurisdiction pins before auth  
**Scale/Scope**: 3 user stories (US-03 core); 1 GeoJSON file (~150 block features); integrates with existing `HomeFacade` + `MapSelectionStore`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Jurisdiction | ✅ Pass | Pins filtered by `Jurisdiction` in use case + `HomeFacade`; backend scope when API ready |
| Clean Architecture | ✅ Pass | `MapAdapter` port in Infrastructure; `MapFacade` in Presentation; no Leaflet in domain |
| Domain model | ✅ Pass | `Project`, `Coordinates`, `GeoBoundary`, `ProjectPin` in data-model.md |
| Use cases | ✅ Pass | `LoadBlockBoundariesUseCase`, `GetMappableProjectsUseCase`; existing jurisdiction use cases reused |
| API-backed data | ✅ Pass | Projects from repository port; local adapter dev-only; GeoJSON is static reference data |
| Geo-spatial | ✅ Pass | Browser-only init; `LeafletMapAdapter`; block layer from `ARUNACHAL_PRADESH_BLOCK.geojson` |
| UI | ✅ Pass | Summary panel + tooltips; Figma alignment deferred to US-07; existing home layout preserved |
| Stack | ✅ Pass | Angular 20, Leaflet 1.9, Bootstrap 5 |
| Performance/NFR | ✅ Pass | Lazy fetch GeoJSON; marker clustering; filtered layer rendering |

**Post-design re-check:** All gates pass. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-interactive-map-pins/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── map-adapter.md   # MapAdapter + UI events
│   ├── geojson-block-layer.md  # ARUNACHAL_PRADESH_BLOCK schema
│   └── projects-for-map.md     # Pin data contract
├── spec.md
└── checklists/
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── geojson/
│   │   └── ARUNACHAL_PRADESH_BLOCK.geojson    # Authoritative block layer (user-specified path)
│   ├── domain/
│   │   ├── entities/geo-boundary.entity.ts    # Extend with districtName, censusAttributes
│   │   ├── value-objects/project-pin.vo.ts    # NEW — mappable pin DTO for map layer
│   │   └── repositories/geo-boundary.repository.ts  # NEW port
│   ├── application/
│   │   ├── geo/load-block-boundaries.use-case.ts    # NEW
│   │   └── map/get-mappable-projects.use-case.ts    # NEW — filters valid coordinates
│   ├── infrastructure/
│   │   └── geo/
│   │       ├── leaflet-map.adapter.ts         # NEW — Leaflet wrapper
│   │       ├── geo-json-file.repository.ts    # NEW — fetch + parse GeoJSON
│   │       └── mappers/geojson-block.mapper.ts
│   ├── presentation/
│   │   ├── features/
│   │   │   ├── home/
│   │   │   │   ├── home.page.ts               # Wire MapFacade + HomeMapComponent
│   │   │   │   ├── home.facade.ts             # Extend: selectProject, map sync signals
│   │   │   │   └── components/
│   │   │   │       ├── home-map.component.ts  # NEW — map container + lifecycle
│   │   │   │       └── project-summary-panel.component.ts  # NEW
│   │   │   └── map/
│   │   │       └── map.facade.ts              # NEW — orchestrates adapter + use cases
│   │   └── state/
│   │       └── map-selection.store.ts         # Extend: selectedProjectId signal
│   └── core/providers/infrastructure.providers.ts  # Bind MapAdapter, GeoBoundaryRepository
└── angular.json                               # Asset: src/app/geojson → /geojson/
```

**Structure Decision**: Single Angular SPA; US-03 adds a `home-map` component + `MapFacade` rather than extending the 2400-line legacy `map.ts`. Block boundaries come exclusively from `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` for the home dashboard map.

## Implementation Roadmap

### Phase 1 — GeoJSON Asset & Repository (Foundation)

| Task | Layer | Output |
|------|-------|--------|
| Add `angular.json` asset mapping `src/app/geojson` → `/geojson/` | Config | HTTP URL `/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` |
| Implement `GeoJsonFileRepository` | Infrastructure | Fetch + parse FeatureCollection |
| Implement `geojson-block.mapper` | Infrastructure | Map properties → `GeoBoundary` entities |
| Extend `GeoBoundary` entity | Domain | `districtName`, `censusAttributes`, `featureBounds` |
| `LoadBlockBoundariesUseCase` | Application | Returns block boundaries filtered by district/block name |

**GeoJSON property mapping:**

| GeoJSON property | Domain field | Match key |
|------------------|--------------|-----------|
| `Mouza Name` | `name` (block) | Block dropdown (case-insensitive) |
| `DISTRICT_N` | `districtName` | District dropdown |
| `NAME` | `displayName` | Tooltip / label fallback |
| `TOT_P`, `TOT_M`, `TOT_F` | census attrs | US-04a fallback (read-only here) |

### Phase 2 — LeafletMapAdapter (Map Engine)

| Task | Layer | Output |
|------|-------|--------|
| Define `MapAdapter` abstract class | Infrastructure | See [contracts/map-adapter.md](./contracts/map-adapter.md) |
| Implement `LeafletMapAdapter` | Infrastructure | Init map, base tile layer, block GeoJSON layer, markers |
| Block layer styling | Infrastructure | Default stroke/fill; highlight selected block |
| `fitBounds(scope)` | Infrastructure | Compute bounds from filtered GeoJSON features |
| Marker tooltips | Infrastructure | `bindTooltip(projectName + location)` |
| Marker clustering | Infrastructure | When pin count > 50 (Leaflet.markercluster or manual) |
| `destroy()` lifecycle | Infrastructure | Clean up on component destroy |

**Browser guard:** `HomeMapComponent` initializes adapter only when `isPlatformBrowser(platformId)`.

### Phase 3 — MapFacade & Home Integration (US-03 Core)

| Task | Layer | Output |
|------|-------|--------|
| `MapFacade` | Presentation | Signals: `pins`, `loading`, `selectedProject`, `summaryOpen` |
| `GetMappableProjectsUseCase` | Application | Filter projects with valid `Coordinates`; map to `ProjectPin` |
| Wire `HomeFacade` → `MapFacade` | Presentation | React to filter changes; reload pins |
| `HomeMapComponent` | Presentation | `#mapContainer` div; delegates to `MapFacade.initialize()` |
| `ProjectSummaryPanelComponent` | Presentation | Name, scheme, location, district, block; dismissible |
| Sidebar `selectProject()` | Presentation | `MapFacade.focusProject(id)` — center + open panel |
| Pin click handler | Presentation | Same as sidebar selection |
| BR-05 guard | Presentation | No pin render until `GetCurrentUserUseCase` returns user |

**Data flow:**

```text
HomePage → HomeFacade (filters) → MapFacade
  → GetMappableProjectsUseCase → ProjectRepository
  → LoadBlockBoundariesUseCase → GeoJsonFileRepository → /geojson/ARUNACHAL_PRADESH_BLOCK.geojson
  → LeafletMapAdapter.setBlockLayer(filtered)
  → LeafletMapAdapter.setProjectMarkers(pins)
  → LeafletMapAdapter.fitBounds(roleScope)
```

### Phase 4 — Role Viewport & Filter Sync (FR-MAP-07, FR-MAP-08)

| Role | Viewport source | Visible pins |
|------|-----------------|--------------|
| State Manager | Bounds of all AP block features (or selected district blocks) | State scope + filter |
| District Manager | Bounds of assigned district's block features | District scope only |
| Block Manager | Bounds of assigned block feature | Block scope only |

| Event | Map behavior |
|-------|--------------|
| District dropdown change | Filter block layer + pins; `fitBounds(district)` |
| Block dropdown change | Highlight block polygon; `fitBounds(block)` |
| Sidebar project select | `panTo(coordinates)`; open summary panel |
| Summary panel close | No filter/viewport change |

### Phase 5 — Polish & Legacy Bridge

| Task | Notes |
|------|-------|
| Deprecate home → legacy `MapSelectionService` sync | Keep until full US-03a migration |
| Loading/error states | Spinner overlay on map; friendly message on GeoJSON fetch failure |
| Empty pin state | Message when zero mappable projects in scope |
| Overlapping pins | Accept clustering; verify all pins reachable |

## Out of Scope (this feature)

- District-level GeoJSON from separate files (US-03a)
- Full tabbed detail panel — beneficiaries, docs, media (US-03b)
- Base layer switcher UI (US-03c) — adapter MAY expose `setBaseLayer` stub
- Area summary analytics panel (US-04)
- Full replacement of standalone `/map` route legacy component

## Complexity Tracking

> No constitution violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Generated Artifacts

| Artifact | Path | Phase |
|----------|------|-------|
| Research | [research.md](./research.md) | 0 |
| Data model | [data-model.md](./data-model.md) | 1 |
| Map adapter contract | [contracts/map-adapter.md](./contracts/map-adapter.md) | 1 |
| GeoJSON contract | [contracts/geojson-block-layer.md](./contracts/geojson-block-layer.md) | 1 |
| Projects-for-map contract | [contracts/projects-for-map.md](./contracts/projects-for-map.md) | 1 |
| Quickstart | [quickstart.md](./quickstart.md) | 1 |

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md` for US-03 implementation.
