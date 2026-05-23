---
description: "Task list for US-04 Area Summary on Geographic Click"
---

# Tasks: Area Summary on Geographic Click

**Input**: Design documents from `specs/004-area-summary-geo-click/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `004-area-summary-geo-click`  
**Depends on**: US-01 auth, US-02c filters, US-03 interactive map (`MapFacade`, `HomeMapComponent`, block layer)

**Organization**: Tasks grouped by user story (US1–US3 from spec.md). Tests omitted (not requested in spec).

**UX revision (2026-05-23):** Area summary implemented as `AreaSummaryCardComponent` in **Regional Statistics sidebar** — not `AreaSummaryPanelComponent` on the map. Task descriptions referencing the panel reflect the original plan; implementation uses the card pattern per updated [spec.md](./spec.md).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Analytics module scaffolding for area summary feature

- [X] T001 Create `src/app/application/analytics/` and `src/app/infrastructure/analytics/mappers/` directories per `specs/004-area-summary-geo-click/plan.md`
- [X] T002 [P] Confirm `ANALYTICS_REPOSITORY` injection token exists in `src/app/infrastructure/tokens/repository.tokens.ts` (add export alias if missing)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain entities, analytics repository, use case, and view model — MUST complete before user story phases

**⚠️ CRITICAL**: No user story work until this phase completes

- [X] T003 [P] Create `src/app/domain/entities/area-summary.entity.ts` with `scope`, `stateName`, `districtName`, `blockName`, `totalPopulation`, `populationAvailable` per `specs/004-area-summary-geo-click/data-model.md`
- [X] T004 Refactor `src/app/domain/value-objects/geo-scope.vo.ts` to name-based hierarchy (`level`, `stateName`, `districtName`, `blockName`) with `GeoScope.district()` and `GeoScope.block()` factories per `specs/004-area-summary-geo-click/research.md` R-02
- [X] T005 Update `src/app/domain/repositories/analytics.repository.ts` — change `getAreaSummary(scope: GeoScope)` return type to `Observable<AreaSummary | null>` per `specs/004-area-summary-geo-click/contracts/analytics-repository.md`
- [X] T006 [P] Create `src/app/infrastructure/analytics/mappers/area-summary.mapper.ts` mapping census/API payloads to `AreaSummary` entity
- [X] T007 Implement `src/app/infrastructure/analytics/census-fallback-analytics.repository.ts` — block scope uses `TOT_P`; district scope sums block populations by `DISTRICT_N` with `normalizeGeoName()` per `specs/004-area-summary-geo-click/contracts/analytics-repository.md`
- [X] T008 Bind `CensusFallbackAnalyticsRepository` → `ANALYTICS_REPOSITORY` and `AnalyticsRepository` in `src/app/core/providers/infrastructure.providers.ts`
- [X] T009 Implement `src/app/application/analytics/get-area-summary.use-case.ts` with `execute(scope: GeoScope)` orchestrating repository lookup per `architecture.md` §8.3
- [X] T010 [P] Create `src/app/presentation/features/map/models/area-summary.view-model.ts` with `fromEntity()` factory per `specs/004-area-summary-geo-click/data-model.md`

**Checkpoint**: Foundation ready — use case returns `AreaSummary` from census fallback for valid block/district scope

---

## Phase 3: User Story 1 — Open Area Summary on Geographic Selection (Priority: P1) 🎯 MVP

**Goal**: Click district, block, or map area opens a dismissible area summary side panel without blocking the map

**Independent Test**: Log in → `/home` → click block polygon → area summary panel opens on the right within ~2s; panel is side overlay, map remains partially visible (see `specs/004-area-summary-geo-click/quickstart.md` Scenario 1)

### Implementation for User Story 1

- [X] T011 [US1] Extend `src/app/infrastructure/geo/map-adapter.ts` with `onDistrictClick(handler)` and `onMapClick(handler)` per `specs/004-area-summary-geo-click/contracts/map-geographic-events.md`
- [X] T012 [US1] Implement `onDistrictClick`, `onMapClick`, and `resolveBlockAt(lat, lng)` point-in-polygon in `src/app/infrastructure/geo/leaflet-map.adapter.ts` — marker clicks MUST NOT propagate to map click
- [X] T013 [US1] Add `areaSummaryOpen`, `areaSummary`, and `areaSummaryLoading` signals to `src/app/presentation/features/map/map.facade.ts`
- [X] T014 [US1] Register `onBlockClick`, `onDistrictClick`, and `onMapClick` handlers in `MapFacade.initialize()` in `src/app/presentation/features/map/map.facade.ts`
- [X] T015 [US1] Implement `handleBlockSelection`, `handleDistrictSelection`, `handleMapAreaClick`, and `openAreaSummary(scope)` in `src/app/presentation/features/map/map.facade.ts` — resolve `GeoBoundary` from `currentBlocks`, build `GeoScope`, call `GetAreaSummaryUseCase`
- [X] T016 [P] [US1] Create `src/app/presentation/features/home/components/area-summary-panel.component.ts`, `.html`, and `.scss` — dismissible side panel shell matching `project-summary-panel` layout per `specs/004-area-summary-geo-click/contracts/area-summary-panel.md`
- [X] T017 [US1] Wire `<app-area-summary-panel>` in `src/app/presentation/features/home/home.page.html` bound to `MapFacade` area summary signals
- [X] T018 [US1] Register `AreaSummaryPanelComponent` in `src/app/presentation/features/home/home.page.ts` imports
- [X] T019 [US1] Enforce BR-05 in `src/app/presentation/features/map/map.facade.ts` — skip `GetAreaSummaryUseCase` when `GetCurrentUserUseCase.execute()` returns null

**Checkpoint**: Block click (and map-area click inside polygon) opens area summary panel; district click handler registered for US-03a integration

---

## Phase 4: User Story 2 — View Scoped Geography Metadata and Population (Priority: P1)

**Goal**: Panel displays state, district, block names (when applicable) and total population scoped strictly to selected geography

**Independent Test**: Open summary for Block A → population matches block `TOT_P` only; open for district → block row hidden, population is district aggregate; names shown in readable format (see `specs/004-area-summary-geo-click/quickstart.md` Scenarios 3–4)

### Implementation for User Story 2

- [X] T020 [US2] Complete district population aggregation in `src/app/infrastructure/analytics/census-fallback-analytics.repository.ts` — sum only blocks matching `normalizeGeoName(scope.districtName)`
- [X] T021 [US2] Add jurisdiction guard in `src/app/application/analytics/get-area-summary.use-case.ts` — District Manager and Block Manager cannot load out-of-scope summaries per `specs/004-area-summary-geo-click/research.md` R-08
- [X] T022 [US2] Render state, district, block (conditional on scope level), and total population in `src/app/presentation/features/home/components/area-summary-panel.component.html`
- [X] T023 [US2] Format title-case geography names and locale-formatted population in `src/app/presentation/features/map/models/area-summary.view-model.ts`
- [X] T024 [US2] Show loading skeleton/spinner in `src/app/presentation/features/home/components/area-summary-panel.component.html` while `areaSummaryLoading()` is true
- [X] T025 [US2] Assert block scope never returns district/state aggregate in `src/app/infrastructure/analytics/census-fallback-analytics.repository.ts` — filter lookup to single block by id/name

**Checkpoint**: Panel shows correct hierarchy labels and scoped population for block and district selections

---

## Phase 5: User Story 3 — Dismiss Summary Panel Without Losing Map Context (Priority: P1)

**Goal**: Close panel or switch geography without resetting map viewport, filters, boundary highlights, or project pins; only one contextual panel visible at a time

**Independent Test**: Zoom/pan + set filters → open area summary → close → map unchanged; open area summary → click project pin → project panel replaces area panel (see `specs/004-area-summary-geo-click/quickstart.md` Scenarios 2 and 6)

### Implementation for User Story 3

- [X] T026 [US3] Implement `closeAreaSummary()` in `src/app/presentation/features/map/map.facade.ts` — clear area signals only, do NOT call `refreshMap()`
- [X] T027 [US3] Wire `(closed)="closeAreaSummary()"` handler on `<app-area-summary-panel>` in `src/app/presentation/features/home/home.page.html` and delegate from `src/app/presentation/features/home/home.page.ts`
- [X] T028 [US3] Enforce FR-012 mutual exclusivity in `src/app/presentation/features/map/map.facade.ts` — `openAreaSummary()` calls `closeSummary()`; `openSummary()` calls `closeAreaSummary()`
- [X] T029 [US3] Update area summary in place when user clicks a different block/district while panel is open in `src/app/presentation/features/map/map.facade.ts` — set `areaSummaryLoading`, refresh content, preserve map viewport
- [X] T030 [US3] Ensure open/close area summary does not mutate `MapSelectionStore` district/block filter signals in `src/app/presentation/features/map/map.facade.ts` per FR-007

**Checkpoint**: Panel dismisses cleanly; project and area panels never shown together; filter dropdowns preserved

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Empty states, edge cases, accessibility, and manual validation

- [X] T031 [P] Add population unavailable message in `src/app/presentation/features/home/components/area-summary-panel.component.html` when `populationAvailable` is false per FR-010
- [X] T032 Handle out-of-scope geographic click — return null from use case and skip panel open in `src/app/presentation/features/map/map.facade.ts`
- [X] T033 [P] Add `aria-label="Area summary"`, close button label, and `aria-live="polite"` loading region in `src/app/presentation/features/home/components/area-summary-panel.component.html`
- [X] T034 Reserve empty `area-summary-panel__charts-slot` section in `src/app/presentation/features/home/components/area-summary-panel.component.html` for US-04a/04b extension
- [X] T035 Run manual verification scenarios from `specs/004-area-summary-geo-click/quickstart.md` and document any gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP geographic click + panel open
- **User Story 2 (Phase 4)**: Depends on Foundational; integrates with US1 panel shell
- **User Story 3 (Phase 5)**: Depends on US1 panel being wired; can parallel with US2 after US1
- **Polish (Phase 6)**: Depends on US1–US3 complete

### User Story Dependencies

```text
Phase 2 (Foundational)
    ↓
Phase 3 (US1) — MVP: panel opens on geographic click
    ↓
Phase 4 (US2) — metadata + population content
Phase 5 (US3) — dismiss + mutual exclusivity (can start after US1)
    ↓
Phase 6 (Polish)
```

| Story | Depends on | Delivers independently |
|-------|------------|------------------------|
| US1 | Phase 2 | Panel opens on block/map click |
| US2 | Phase 2, US1 shell | Scoped population + geography labels |
| US3 | US1 | Close preserves map; one panel at a time |

### Within Each User Story

- Domain/repository before use case (Phase 2 before Phase 3)
- MapAdapter events before MapFacade handlers
- Panel component before home template wiring
- Use case before panel population display

### Parallel Opportunities

- **Phase 1**: T001 and T002 in parallel
- **Phase 2**: T003, T006, T010 in parallel; T007 after T003–T006
- **Phase 3**: T016 (panel component) parallel with T011–T012 (adapter events)
- **Phase 4**: T022 and T023 in parallel after T020–T021
- **Phase 6**: T031 and T033 in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch in parallel:
Task T011: Extend map-adapter.ts with onDistrictClick/onMapClick
Task T012: Implement handlers in leaflet-map.adapter.ts
Task T016: Create area-summary-panel component files

# Then sequentially:
Task T013–T015: MapFacade signals and openAreaSummary flow
Task T017–T018: Wire panel in home.page
```

---

## Parallel Example: Foundational Phase

```bash
# Launch together:
Task T003: area-summary.entity.ts
Task T006: area-summary.mapper.ts
Task T010: area-summary.view-model.ts

# Then:
Task T004 → T005 → T007 → T008 → T009
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Block click opens panel — quickstart Scenario 1
5. Demo MVP before population polish

### Incremental Delivery

1. Setup + Foundational → analytics pipeline ready
2. Add US1 → panel opens on geographic click (MVP shell)
3. Add US2 → population + metadata scoped correctly
4. Add US3 → dismiss behavior + project panel exclusivity
5. Polish → empty states, accessibility, quickstart validation

### Suggested MVP Scope

**Minimum shippable increment:** Phase 1 + Phase 2 + Phase 3 (T001–T019)  
Delivers: block click → area summary panel opens with geography context.

---

## Task Summary

| Phase | Task range | Count | Story |
|-------|------------|-------|-------|
| Setup | T001–T002 | 2 | — |
| Foundational | T003–T010 | 8 | — |
| US1 — Open panel | T011–T019 | 9 | US1 |
| US2 — Metadata + population | T020–T025 | 6 | US2 |
| US3 — Dismiss + exclusivity | T026–T030 | 5 | US3 |
| Polish | T031–T035 | 5 | — |
| **Total** | T001–T035 | **35** | |

---

## Notes

- `onBlockClick` already exists in `LeafletMapAdapter` — US-04 wires it in `MapFacade.initialize()` (T014)
- `onDistrictClick` fires when US-03a district layer lands; register handler now, layer attachment is US-03a
- Do not implement gender/caste charts or water/soil sections — reserved slot only (T034)
- Census fallback is dev/production-degraded path until Analytics API documented in root `api.md`
- Commit after each phase checkpoint; run `npm start` and quickstart scenarios after Phase 3 minimum
