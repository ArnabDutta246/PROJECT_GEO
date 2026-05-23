# Implementation Plan: Area Summary on Geographic Click

**Branch**: `004-area-summary-geo-click` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/004-area-summary-geo-click/spec.md`  
**Architecture authority**: [`architecture.md`](../../architecture.md) §8.3 — Map + Analytics data flow  
**GeoJSON authority**: [`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`](../../src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson) — census fallback for block/district population

## Summary

Deliver **US-04** — a **selected-area card** in the home dashboard **Regional Statistics** sidebar that updates when an authorized user clicks a district or block on the map, showing scoped state/district/block metadata and total population, without disturbing map viewport or filter state.

**User journey (Epic E-04 entry):**

```text
Login (US-01) → Home dashboard (US-02) → Map with boundaries (US-03/03a)
  → Click district or block → Regional Statistics card updates (US-04)
  → [Future] Charts load (US-04a) → Water/soil reports (US-04b)
```

**Technical approach:**

- Extend `MapFacade` with geographic selection handlers (`onBlockClick`, `onDistrictClick`, `onMapClick`) wired from `LeafletMapAdapter`; block click uses existing adapter hook.
- Introduce `GetAreaSummaryUseCase` orchestrating `AnalyticsRepository` with **census GeoJSON fallback** (`TOT_P` aggregation) until analytics API ships.
- Refactor `GeoScope` to name-based hierarchy (`stateName`, `districtName`, `blockName?`, `level`) aligned with boundary properties and GEOAPI labels.
- Add `AreaSummaryCardComponent` in the **Regional Statistics** sidebar — compact card with selected area metadata; **no map overlay** for area summary (project detail panel remains on map).
- Jurisdiction enforcement in use case via `User.jurisdiction` + `normalizeGeoName()` — not template-only checks.

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict: true`)  
**Primary Dependencies**: Angular 20.3, Leaflet 1.9.4, Bootstrap 5.3, RxJS 7.8  
**Storage**: Analytics API (pending); census fallback from `ARUNACHAL_PRADESH_BLOCK.geojson` via `GeoJsonFileRepository`; session via existing auth stack  
**Testing**: Jasmine + Karma (optional per story — not a plan gate)  
**Target Platform**: Browser (Chrome, Edge, Firefox); SSR shell only; map/panel logic browser-only  
**Project Type**: Angular SPA feature slice extending existing `MapFacade` + home dashboard  
**Performance Goals**: Panel visible ≤ 2s after geographic click (SC-001); census fallback synchronous from in-memory block cache  
**Constraints**: No analytics before auth (BR-05); area summary in sidebar only (no map modal); Leaflet only in adapter; district population = sum of block `TOT_P` when API unavailable  
**Scale/Scope**: 3 user stories (US-04 core); extends `MapFacade`, `AreaAnalytics` domain; 1 sidebar card component; no charts in this slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Jurisdiction | ✅ Pass | `GetAreaSummaryUseCase` validates scope against `User.jurisdiction`; out-of-scope clicks rejected |
| Clean Architecture | ✅ Pass | Use case in Application; `AnalyticsRepository` port in Domain; panel in Presentation via `MapFacade` |
| Domain model | ✅ Pass | `AreaSummary` entity + refactored `GeoScope` VO; census fallback mapped in Infrastructure |
| Use cases | ✅ Pass | `GetAreaSummaryUseCase` single `execute(GeoScope)` entry point |
| API-backed data | ✅ Pass | `AnalyticsApiRepository` target; `CensusFallbackAnalyticsRepository` dev/fallback only |
| Geo-spatial | ✅ Pass | Geographic triggers via `MapAdapter` events; point-in-polygon in adapter only |
| UI | ✅ Pass | Sidebar card in Regional Statistics section; Figma polish deferred to US-07 |
| Stack | ✅ Pass | Angular 20, Leaflet 1.9, Bootstrap 5 |
| Performance/NFR | ✅ Pass | Block cache reused from `MapFacade.currentBlocks`; loading signal on panel |

**Post-design re-check:** All gates pass. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-area-summary-geo-click/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── area-summary-card.md       # Sidebar card UI contract
│   ├── analytics-repository.md  # Analytics port + fallback
│   └── map-geographic-events.md # MapAdapter geographic events
├── spec.md
└── checklists/
```

### Source Code (repository root)

```text
src/app/
├── domain/
│   ├── entities/
│   │   └── area-summary.entity.ts           # NEW — metadata + population
│   ├── value-objects/
│   │   └── geo-scope.vo.ts                  # EXTEND — name-based hierarchy
│   └── repositories/
│       └── analytics.repository.ts          # EXTEND — getAreaSummary(GeoScope)
├── application/
│   └── analytics/
│       └── get-area-summary.use-case.ts     # NEW
├── infrastructure/
│   ├── analytics/
│   │   ├── census-fallback-analytics.repository.ts  # NEW
│   │   └── mappers/area-summary.mapper.ts           # NEW
│   └── geo/
│       ├── map-adapter.ts                   # EXTEND — onDistrictClick, onMapClick
│       └── leaflet-map.adapter.ts           # EXTEND — point-in-polygon, district handler
├── presentation/
│   ├── features/
│   │   ├── map/
│   │   │   ├── map.facade.ts                # EXTEND — area summary signals + handlers
│   │   │   └── models/
│   │   │       └── area-summary.view-model.ts  # NEW
│   │   └── home/
│   │       ├── home.page.html               # Wire area-summary-card in Regional Statistics
│   │       └── components/
│   │           └── area-summary-card.component.ts  # NEW
│   └── state/
│       └── map-selection.store.ts           # EXTEND — areaSelection signal (optional)
└── core/providers/
    └── infrastructure.providers.ts          # Bind ANALYTICS_REPOSITORY
```

**Structure Decision**: Single Angular SPA; US-04 extends the existing `MapFacade` rather than a separate analytics page. Area summary card lives in the **Regional Statistics** sidebar; project detail panel remains a map overlay.

## Implementation Roadmap

### Phase 1 — Domain & Analytics Port (Foundation)

| Task | Layer | Output |
|------|-------|--------|
| Create `AreaSummary` entity | Domain | `stateName`, `districtName`, `blockName`, `totalPopulation`, `populationAvailable`, `scopeLevel` |
| Refactor `GeoScope` VO | Domain | `level: 'district' \| 'block'`, name fields; factory `GeoScope.block(...)`, `GeoScope.district(...)` |
| Extend `AnalyticsRepository` | Domain | `getAreaSummary(scope: GeoScope): Observable<AreaSummary \| null>` |
| Implement `CensusFallbackAnalyticsRepository` | Infrastructure | Block: `TOT_P`; District: sum block populations in district |
| Register `ANALYTICS_REPOSITORY` | Core | Bind fallback repo until API ready |
| `GetAreaSummaryUseCase` | Application | Jurisdiction check → repository → `AreaSummary` |

**Population fallback rules:**

| Selection level | Primary source | Fallback |
|-----------------|----------------|----------|
| Block | `GET /analytics/demographics?scope=block` | `GeoBoundary.censusAttributes.totalPopulation` |
| District | `GET /analytics/demographics?scope=district` | Sum of `TOT_P` for all blocks where `DISTRICT_N` matches |

### Phase 2 — Map Geographic Events (US-03a bridge)

| Task | Layer | Output |
|------|-------|--------|
| Wire `onBlockClick` in `MapFacade.initialize` | Presentation | Block click → `openAreaSummary(blockScope)` |
| Add `onDistrictClick` to `MapAdapter` | Infrastructure | Fired when US-03a district layer click lands; interim: derive from district filter + block click at district zoom |
| Add `onMapClick(lat, lng)` to `MapAdapter` | Infrastructure | Point-in-polygon against visible block features → block scope |
| Highlight selected geography | Infrastructure | Reuse `highlightBlock`; district highlight via all blocks in district (interim) |
| `ResolveGeographicSelectionUseCase` (optional) | Application | Normalize click → `GeoScope` with jurisdiction guard |

**Event priority (FR-012):**

```text
Block/district click → close project summary → open area summary
Project pin click    → close area summary   → open project summary
Panel close          → dismiss only; preserve map/filters
```

### Phase 3 — Area Summary Card (US-04 Core)

| Task | Layer | Output |
|------|-------|--------|
| `AreaSummaryViewModel` | Presentation | Formats names (title case), population with locale, unavailable state |
| `AreaSummaryCardComponent` | Presentation | Compact sidebar card: title, metadata, population KPI, clear button, loading state |
| Extend `MapFacade` signals | Presentation | `areaSummary`, `areaSummaryLoading`, `hasAreaSelection` |
| Wire `home.page.html` | Presentation | `<app-area-summary-card>` at top of Regional Statistics; placeholder when empty |
| `closeAreaSummary()` | Presentation | Clears card signals; no `refreshMap()` |

**Panel content (US-04 scope only):**

| Field | District selection | Block selection |
|-------|-------------------|-----------------|
| State | ✅ | ✅ |
| District | ✅ | ✅ |
| Block | — (hidden or "All blocks") | ✅ |
| Total population | District aggregate | Block only |

**Placeholder slots (empty, for US-04a/04b):**

```html
<!-- Reserved sections — not implemented in US-04 -->
<section aria-hidden="true" class="area-summary-panel__charts-slot"></section>
```

### Phase 4 — Scoping, Jurisdiction & Filter Sync

| Task | Notes |
|------|-------|
| Jurisdiction guard in use case | Block/District Manager cannot open summary for out-of-scope geography |
| Case-insensitive name match | Reuse `normalizeGeoName()` for scope vs boundary vs dropdown |
| Filter preservation | Opening/closing panel does NOT call `MapSelectionStore.selectDistrict` unless US-03a sync requires |
| Re-select geography | New block/district click updates panel in place (`areaSummaryLoading` → refresh) |
| BR-05 guard | No `GetAreaSummaryUseCase` call until `GetCurrentUserUseCase` returns user |

**Data flow:**

```text
HomeMapComponent → MapFacade.onBlockClick(blockId)
  → resolve GeoBoundary from currentBlocks
  → GeoScope.block(state, district, block)
  → GetAreaSummaryUseCase.execute(scope)
    → AnalyticsRepository.getAreaSummary(scope)
      → [API] or CensusFallbackAnalyticsRepository
  → AreaSummaryViewModel.fromEntity(summary)
  → areaSummaryOpen = true; summaryOpen = false
```

### Phase 5 — Polish & Empty States

| Task | Notes |
|------|-------|
| Population unavailable UI | Show metadata + "Population data unavailable" message (FR-010) |
| Out-of-scope click | Toast or silent no-op; no panel |
| Loading indicator | Spinner in panel header while use case runs |
| Accessibility | `aria-label="Area summary"`, focus trap optional P2 |
| SSR safety | Panel renders only in browser; no analytics on server |

## Out of Scope (this feature)

- Gender/caste distribution charts (US-04a / FR-ANLY-02, FR-ANLY-03)
- Water and soil report sections with charts (US-04b / FR-ANLY-04, FR-ANLY-05)
- Graphical chart rendering (FR-ANLY-06)
- District GeoJSON layer creation (US-03a — US-04 consumes events when available)
- Sidebar "Regional Statistics" static placeholders → future sync with area summary
- Standalone `/map` route legacy component

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
| Area summary card contract | [contracts/area-summary-card.md](./contracts/area-summary-card.md) | 1 |
| Analytics repository contract | [contracts/analytics-repository.md](./contracts/analytics-repository.md) | 1 |
| Map geographic events contract | [contracts/map-geographic-events.md](./contracts/map-geographic-events.md) | 1 |
| Quickstart | [quickstart.md](./quickstart.md) | 1 |

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md` for US-04 implementation.
