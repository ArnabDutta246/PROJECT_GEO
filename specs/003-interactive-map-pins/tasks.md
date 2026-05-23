---
description: "Task list for US-03 Interactive Map with Project Pins"
---

# Tasks: Interactive Map with Project Pins

**Input**: Design documents from `specs/003-interactive-map-pins/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `003-interactive-map-pins`  
**Depends on**: US-01 auth, US-02c filters (implemented in `002-geo-monitoring-platform` foundation)

**Organization**: Tasks grouped by user story (US1–US3 from spec.md). Tests omitted (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: GeoJSON asset serving and map infrastructure scaffolding

- [X] T001 Add `src/app/geojson` asset mapping to `/geojson/` in `angular.json` per `specs/003-interactive-map-pins/contracts/geojson-block-layer.md`
- [X] T002 [P] Create `src/app/infrastructure/geo/` directory and `src/app/presentation/features/map/` directory per `specs/003-interactive-map-pins/plan.md`
- [X] T003 [P] Add `MAP_ADAPTER` and `GEO_BOUNDARY_REPOSITORY` injection tokens in `src/app/infrastructure/tokens/repository.tokens.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain types, GeoJSON repository, Leaflet adapter, and use cases — MUST complete before user story phases

**⚠️ CRITICAL**: No user story work until this phase completes

- [X] T004 [P] Extend `src/app/domain/entities/geo-boundary.entity.ts` with `displayName`, `districtName`, `stateId`, `censusAttributes`, and `geometry` per `specs/003-interactive-map-pins/data-model.md`
- [X] T005 [P] Create `src/app/domain/value-objects/census-attributes.vo.ts` mapping `TOT_P`, `TOT_M`, `TOT_F`, `P_SC`, `P_ST`, `No_HH` per `specs/003-interactive-map-pins/contracts/geojson-block-layer.md`
- [X] T006 [P] Create `src/app/domain/value-objects/project-pin.vo.ts` with `ProjectPin.fromProject()` factory per `specs/003-interactive-map-pins/data-model.md`
- [X] T007 [P] Create `src/app/domain/value-objects/map-bounds.vo.ts` with `fromGeoBoundaries()` factory per `specs/003-interactive-map-pins/data-model.md`
- [X] T008 [P] Create `src/app/domain/repositories/geo-boundary.repository.ts` port with `loadBlockBoundaries()`, `getBlocksByDistrict()`, `getBlockByName()` per `specs/003-interactive-map-pins/data-model.md`
- [X] T009 Create `src/app/infrastructure/geo/mappers/geojson-block.mapper.ts` mapping `ARUNACHAL_PRADESH_BLOCK.geojson` properties (`Mouza Name`, `DISTRICT_N`, `NAME`) using `normalizeGeoName()` from `src/app/infrastructure/http/mappers/jurisdiction.mapper.ts`
- [X] T010 Implement `src/app/infrastructure/geo/geo-json-file.repository.ts` fetching `/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` with in-memory session cache per `specs/003-interactive-map-pins/contracts/geojson-block-layer.md`
- [X] T011 Implement `src/app/application/geo/load-block-boundaries.use-case.ts` filtering blocks by district/block name per `specs/003-interactive-map-pins/plan.md` Phase 1
- [X] T012 Implement `src/app/application/map/get-mappable-projects.use-case.ts` filtering by jurisdiction, geographic selection, and valid `Coordinates` per `specs/003-interactive-map-pins/contracts/projects-for-map.md`
- [X] T013 Create `src/app/infrastructure/geo/map-adapter.ts` abstract class per `specs/003-interactive-map-pins/contracts/map-adapter.md`
- [X] T014 Implement `src/app/infrastructure/geo/leaflet-map.adapter.ts` with `initialize`, `setBlockLayer`, `setProjectMarkers`, `fitBounds`, `focusMarker`, `highlightBlock`, `destroy` — only file that imports `leaflet`
- [X] T015 Bind `GeoJsonFileRepository` → `GEO_BOUNDARY_REPOSITORY` and `LeafletMapAdapter` → `MAP_ADAPTER` in `src/app/core/providers/infrastructure.providers.ts`
- [X] T016 Create `src/app/presentation/features/map/map.facade.ts` skeleton with signals: `loading`, `error`, `pins`, `blockLayerReady` and browser guard via `isPlatformBrowser`

**Checkpoint**: Foundation ready — GeoJSON loads, adapter initializes, use cases return filtered data

---

## Phase 3: User Story 1 — View In-Scope Project Pins on Map (Priority: P1) 🎯 MVP

**Goal**: Interactive Leaflet map on `/home` renders block outlines from `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` and jurisdiction-scoped project pins with role-based viewport auto-fit

**Independent Test**: Log in as State/District/Block Manager → `/home` shows map with block layer + in-scope pins only; Block Manager sees block-level viewport and no statewide pins (see `specs/003-interactive-map-pins/quickstart.md` § Manual Verification steps 1 and 5)

### Implementation for User Story 1

- [X] T017 [US1] Create `src/app/presentation/features/home/components/home-map.component.ts` with `#mapContainer` div, `ngAfterViewInit` init, `ngOnDestroy` cleanup, SSR placeholder
- [X] T018 [US1] Create `src/app/presentation/features/home/components/home-map.component.html` and `home-map.component.scss` with full-height map container matching existing home layout
- [X] T019 [US1] Implement `MapFacade.initialize()` in `src/app/presentation/features/map/map.facade.ts` — load blocks via `LoadBlockBoundariesUseCase`, load pins via `GetMappableProjectsUseCase`, call adapter methods
- [X] T020 [US1] Implement role-based `fitBounds` in `src/app/presentation/features/map/map.facade.ts` — State Manager: all AP blocks; District Manager: district blocks; Block Manager: single block per `specs/003-interactive-map-pins/plan.md` Phase 4
- [X] T021 [US1] Enforce BR-05 in `src/app/presentation/features/map/map.facade.ts` — skip pin render until `GetCurrentUserUseCase.execute()` returns authenticated user
- [X] T022 [US1] Wire `HomeMapComponent` to `MapFacade` and inject `MapSelectionStore` for filter context in `src/app/presentation/features/home/components/home-map.component.ts`
- [X] T023 [US1] Replace `<app-map>` with `<app-home-map>` in `src/app/home/home.html` (or `src/app/presentation/features/home/home.page.html` if migrated)
- [X] T024 [US1] Register `HomeMapComponent` in `src/app/presentation/features/home/home.page.ts` imports and remove legacy map component dependency from home route
- [X] T025 [US1] React `MapFacade` to filter changes — subscribe to `MapSelectionStore` district/block signals and reload block layer + pins in `src/app/presentation/features/map/map.facade.ts`
- [X] T026 [US1] Render block polygon layer from filtered `GeoBoundary` features in `src/app/infrastructure/geo/leaflet-map.adapter.ts` using default style from `specs/003-interactive-map-pins/contracts/map-adapter.md`

**Checkpoint**: Map renders with block GeoJSON layer and role-scoped pins; viewport auto-fits by role

---

## Phase 4: User Story 2 — Discover Projects via Pin Hover and Click (Priority: P1)

**Goal**: Hover shows project name + location tooltip; click opens dismissible summary panel without resetting geographic filters

**Independent Test**: Hover pin → tooltip visible; click pin → summary panel with name, scheme, location, district, block; close panel → filters unchanged (see `specs/003-interactive-map-pins/quickstart.md` steps 2–3)

### Implementation for User Story 2

- [X] T027 [US2] Implement marker tooltips in `src/app/infrastructure/geo/leaflet-map.adapter.ts` — `bindTooltip` with project name and location; show "Location unavailable" when address empty per FR-006
- [X] T028 [US2] Wire `onMarkerClick` callback in `src/app/infrastructure/geo/leaflet-map.adapter.ts` and connect to `MapFacade` in `src/app/presentation/features/map/map.facade.ts`
- [X] T029 [P] [US2] Create `src/app/presentation/features/map/models/project-summary.view-model.ts` with `fromPin()` factory per `specs/003-interactive-map-pins/data-model.md`
- [X] T030 [US2] Create `src/app/presentation/features/home/components/project-summary-panel.component.ts` displaying project name, scheme type, location, district, block
- [X] T031 [US2] Create `src/app/presentation/features/home/components/project-summary-panel.component.html` and `.scss` — dismissible overlay/side panel matching existing Bootstrap theme
- [X] T032 [US2] Add `selectedPinId` and `summaryOpen` signals to `src/app/presentation/features/map/map.facade.ts`; open panel on pin click without mutating `MapSelectionStore` filter state per FR-008
- [X] T033 [US2] Embed `<app-project-summary-panel>` in home template bound to `MapFacade` summary signals in `src/app/home/home.html`
- [X] T034 [US2] Implement summary panel close handler in `src/app/presentation/features/map/map.facade.ts` — clear selection, preserve viewport and filter state

**Checkpoint**: Pin hover tooltips and click-to-summary panel work independently of filter state

---

## Phase 5: User Story 3 — Select Projects from Sidebar with Map Sync (Priority: P1)

**Goal**: Sidebar project selection centers map on pin and opens summary panel; pin visibility stays consistent with sidebar list when filters change

**Independent Test**: Select sidebar project → map centers + panel opens; change district filter → pins and list match; active filters preserved on sidebar select (see `specs/003-interactive-map-pins/quickstart.md` step 4)

### Implementation for User Story 3

- [X] T035 [US3] Extend `src/app/presentation/state/map-selection.store.ts` with `selectedProjectId` signal, `selectProject(id)`, and `clearProjectSelection()` per `specs/003-interactive-map-pins/data-model.md`
- [X] T036 [US3] Implement `MapFacade.focusProject(projectId)` calling `LeafletMapAdapter.focusMarker()` with fly animation in `src/app/presentation/features/map/map.facade.ts`
- [X] T037 [US3] Add `selectProject(project)` method to `src/app/presentation/features/home/home.facade.ts` delegating to `MapFacade.focusProject()` and updating `MapSelectionStore`
- [X] T038 [US3] Wire sidebar `(click)="selectProject(project)"` and "Locate" button in `src/app/home/home.html` to `HomeFacade.selectProject()` / `MapFacade.focusProject()`
- [X] T039 [US3] Ensure `HomeFacade.loadProjectsForSelection()` and `MapFacade` pin reload share same filter logic — pins MUST match sidebar list per FR-011 in `src/app/presentation/features/map/map.facade.ts`
- [X] T040 [US3] Close or update summary panel when geographic filter changes while panel is open in `src/app/presentation/features/map/map.facade.ts` per spec edge case
- [X] T041 [US3] Implement `highlightBlock()` on block dropdown selection in `src/app/infrastructure/geo/leaflet-map.adapter.ts` and wire from `MapFacade` filter change handler

**Checkpoint**: Full bidirectional sidebar ↔ map sync; filter-driven pin visibility consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Loading states, error handling, performance, and validation

- [X] T042 [P] Add map loading spinner overlay and GeoJSON fetch error banner in `src/app/presentation/features/home/components/home-map.component.html`
- [X] T043 [P] Add empty-state message when zero mappable projects in scope in `src/app/presentation/features/home/components/home-map.component.html`
- [X] T044 Implement marker clustering in `src/app/infrastructure/geo/leaflet-map.adapter.ts` when pin count exceeds 50 per `specs/003-interactive-map-pins/research.md` R-06
- [X] T045 Add friendly project-load error message in `src/app/presentation/features/map/map.facade.ts` without breaking base map per FR-014
- [X] T046 [P] Stub `setBaseLayer()` on `MapAdapter` for future US-03c in `src/app/infrastructure/geo/leaflet-map.adapter.ts`
- [X] T047 Run manual verification checklist in `specs/003-interactive-map-pins/quickstart.md` and fix any gaps
- [X] T048 Remove or gate legacy `MapSelectionService` sync from `src/app/presentation/features/home/home.facade.ts` once `HomeMapComponent` is stable (keep legacy service for `/map` route only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — MVP deliverable
- **US2 (Phase 4)**: Depends on Phase 3 (requires working map + pins)
- **US3 (Phase 5)**: Depends on Phase 3; integrates with US2 summary panel
- **Polish (Phase 6)**: Depends on Phases 3–5

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US1 — View pins | Foundational | Phase 2 complete |
| US2 — Hover/click | US1 (map + pins render) | Phase 3 checkpoint |
| US3 — Sidebar sync | US1; uses US2 summary panel | Phase 3; full flow after Phase 4 |

### Within Each User Story

- Domain/VO types before use cases (Phase 2)
- Use cases before MapFacade methods
- MapFacade before HomeMapComponent wiring
- Adapter methods before facade orchestration
- Core map before summary panel (US2 before US3 full flow)

### Parallel Opportunities

**Phase 1** (all [P] together):
- T002, T003 parallel with T001

**Phase 2** (after T008 port exists):
- T004, T005, T006, T007 parallel (different domain files)
- T013 parallel with T009–T012 once domain types exist

**Phase 4**:
- T029 parallel with T027–T028 (different files)

**Phase 6**:
- T042, T043, T046 parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2, launch component scaffolding in parallel:
T017: home-map.component.ts
T018: home-map.component.html + .scss

# Adapter styling parallel with facade logic (different files):
T026: leaflet-map.adapter.ts block layer styles
T019: map.facade.ts initialize()
```

---

## Parallel Example: Foundational Phase

```bash
# Domain value objects — all independent files:
T005: census-attributes.vo.ts
T006: project-pin.vo.ts
T007: map-bounds.vo.ts
T004: geo-boundary.entity.ts (extend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T016)
3. Complete Phase 3: User Story 1 (T017–T026)
4. **STOP and VALIDATE**: Map + block layer + role-scoped pins per quickstart steps 1 and 5
5. Demo MVP before hover/click/sidebar sync

### Incremental Delivery

1. Setup + Foundational → GeoJSON + adapter ready
2. US1 → Map with pins and viewport (MVP)
3. US2 → Tooltips + summary panel
4. US3 → Sidebar sync + filter consistency
5. Polish → Clustering, errors, empty states

### Parallel Team Strategy

With multiple developers after Phase 2:

- **Developer A**: T013–T014 LeafletMapAdapter + T026 block layer
- **Developer B**: T011–T012 use cases + T016 MapFacade skeleton
- **Developer C**: T017–T018 HomeMapComponent shell

Then converge for T019–T026 integration.

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1 — Setup | T001–T003 (3) | — |
| Phase 2 — Foundational | T004–T016 (13) | — |
| Phase 3 — US1 View pins | T017–T026 (10) | US1 |
| Phase 4 — US2 Hover/click | T027–T034 (8) | US2 |
| Phase 5 — US3 Sidebar sync | T035–T041 (7) | US3 |
| Phase 6 — Polish | T042–T048 (7) | — |
| **Total** | **48 tasks** | |

### Independent Test Criteria

| Story | Verify |
|-------|--------|
| US1 | Map loads block GeoJSON + jurisdiction-scoped pins; role viewport; no pre-auth pins |
| US2 | Tooltip on hover; click opens summary; close preserves filters |
| US3 | Sidebar select centers pin + opens panel; filters update pin set consistently |

### Suggested MVP Scope

**Phases 1–3 only (T001–T026)** — delivers core map with project pins and role-based viewport.

---

## Notes

- GeoJSON source path: `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` (not `src/assets/geojson/`)
- Leaflet imports ONLY in `src/app/infrastructure/geo/leaflet-map.adapter.ts`
- Reuses existing `HomeFacade`, `MapSelectionStore`, `GetProjectsByJurisdictionUseCase`, `GetCurrentUserUseCase`
- Legacy `src/app/map/map.ts` remains for `/map` route until US-03a migration
- `[P]` tasks = different files, no incomplete dependencies
