---
description: "Task list for ProjectGeo geo-monitoring platform revamp"
---

# Tasks: ProjectGeo Government Monitoring Platform

**Input**: Design documents from `specs/002-geo-monitoring-platform/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, [`api.md`](../../api.md)  
**Branch**: `002-geo-monitoring-platform`

**Organization**: Tasks grouped by user story (US-01–US-07b). GEOAPI integration follows [`api.md`](../../api.md) §1.2–§7. Tests omitted (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Clean Architecture folder structure, path aliases, GEOAPI environment wiring

- [X] T001 Create layer directories per `architecture.md` §4 under `src/app/core/`, `domain/`, `application/`, `infrastructure/`, `presentation/`
- [X] T002 [P] Add path aliases `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@core/*` in `tsconfig.app.json`
- [X] T003 [P] Configure `environment.ts` and `environment.prod.ts` with `apiBaseUrl: 'https://webgap.in/GEOAPI/api'` and `useLocalData` flag per `api.md` §7.5
- [X] T004 [P] Create `src/app/infrastructure/http/api-client.service.ts` with `url(path)` helper per `api.md` §7.5
- [X] T005 [P] Move block GeoJSON to `src/assets/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` (copy from `src/app/geojson/` if needed) and update `angular.json` assets
- [X] T006 Register `provideHttpClient(withInterceptors([authInterceptor]))` in `src/app/app.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain layer, repository ports, GEOAPI shared infrastructure — MUST complete before user story phases

**⚠️ CRITICAL**: No user story work until this phase completes

- [X] T007 [P] Create `src/app/domain/errors/domain.error.ts` and `src/app/application/errors/application.error.ts` per `architecture.md` §7.5
- [X] T008 [P] Create `src/app/domain/value-objects/role.enum.ts` with `UserRole` enum and `GROUP_CODE_TO_ROLE` map per `api.md` §3.2
- [X] T009 [P] Create `src/app/domain/value-objects/coordinates.vo.ts` per `data-model.md`
- [X] T010 [P] Create `src/app/domain/value-objects/jurisdiction.vo.ts` with `includesDistrict`, `includesBlock`, `isInside` per `architecture.md` §5.1.2
- [X] T011 [P] Create `src/app/domain/value-objects/money.vo.ts` and `src/app/domain/value-objects/geo-scope.vo.ts`
- [X] T012 [P] Create `src/app/domain/entities/user.entity.ts` with `can`, `canAccessDistrict`, `canAccessBlock` per `data-model.md`
- [X] T013 [P] Create `src/app/domain/entities/session.entity.ts`, `applicable-area.entity.ts` (State/District/Block options)
- [X] T014 [P] Create `src/app/domain/entities/project.entity.ts`, `geo-boundary.entity.ts`, `area-analytics.entity.ts`, `scheme-catalog.entity.ts`
- [X] T015 [P] Create `src/app/domain/services/jurisdiction-filter.service.ts` and `project-validation.service.ts`
- [X] T016 [P] Create repository ports in `src/app/domain/repositories/`: `auth.repository.ts`, `session.repository.ts`, `applicable-area.repository.ts`, `project.repository.ts`, `geo.repository.ts`, `analytics.repository.ts`
- [X] T017 Create `src/app/infrastructure/tokens/repository.tokens.ts` with injection tokens for all repository ports
- [X] T018 Create `src/app/infrastructure/http/dto/api-envelope.dto.ts` with `ApiEnvelope<T>` per `api.md` §2.3
- [X] T019 Create `src/app/infrastructure/http/mappers/api-response.mapper.ts` with `assertApiSuccess()` per `api.md` §6.3
- [X] T020 [P] Create `src/app/infrastructure/http/mappers/user.mapper.ts` mapping `UserProfileDto` → `User` (discard `usp_pswd`, map `usp_group_code`) per `api.md` §3.1
- [X] T021 [P] Create `src/app/infrastructure/http/mappers/jurisdiction.mapper.ts` mapping `StateItemDto`, `DistrictItemDto`, `BlockItemDto` per `api.md` §4–§5
- [X] T022 Create `src/app/infrastructure/persistence/session-storage.repository.ts` with keys `geo_auth_token`, `geo_user_profile` per `api.md` §7.3
- [X] T023 [P] Create `src/app/infrastructure/util/device-uuid.util.ts` with `getOrCreateDeviceUuid()` storing in `localStorage` key `geo_device_uuid` per `api.md` §7.3
- [X] T024 Create `src/app/core/interceptors/auth.interceptor.ts` attaching `Authorization: Bearer <token>` to GEOAPI requests per `api.md` §7.4
- [X] T025 Create `src/app/core/guards/auth.guard.ts` protecting `/home`, `/projects`, `/map` routes
- [X] T026 Create `src/app/core/providers/infrastructure.providers.ts` binding repository tokens to implementations per `architecture.md` §5.3.1
- [X] T027 Wire `infrastructureProviders` into `src/app/app.config.ts`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story US-01 — Secure Login (Priority: P1)

**Goal**: Login with User ID + password via GEOAPI `ValidateUserLogin`; role from `usp_group_code`; navigate to home

**Independent Test**: Submit valid credentials on `/login` → JWT stored → redirect `/home` with role-scoped session; invalid credentials show API message

### Implementation for US-01

- [X] T028 [P] [US01] Create `src/app/infrastructure/http/dto/login.dto.ts` with `LoginRequestDto`, `LoginResponseDto`, `UserProfileDto` per `api.md` §3.1
- [X] T029 [US01] Implement `src/app/infrastructure/http/auth-api.repository.ts` calling `POST /UserDetails/ValidateUserLogin` with `user_id`, `password`, `device_uuid` per `api.md` §3.1
- [X] T030 [US01] Handle login failure when HTTP 200 but `success: false` or body `statusCode: 400` per `api.md` §2.6 and EC-01
- [X] T031 [US01] Block login when `usp_active_yn !== 'Y'` with inactive-account message per `api.md` §3.1 and EC-12
- [X] T032 [US01] Implement `src/app/application/auth/login.use-case.ts` orchestrating AuthRepository → SessionRepository save
- [X] T033 [US01] Implement `src/app/presentation/features/login/login.presenter.ts` exposing signals for form state, loading, error
- [X] T034 [US01] Refactor `src/app/presentation/features/login/login.page.ts` (migrate from `src/app/login/login.ts`) using presenter; label field **User ID** not email per `api.md` §8
- [X] T035 [US01] Update `src/app/presentation/features/login/login.page.html` for User ID + password + hidden device_uuid generation
- [X] T036 [US01] Update `src/app/app.routes.ts` to route `/login` to new LoginPage

**Checkpoint**: US-01 login journey works against GEOAPI

---

## Phase 4: User Story US-01a — Session Restore (Priority: P1)

**Goal**: Session persists across browser refresh; expired JWT redirects to login

**Independent Test**: Login → refresh page → remain authenticated; expired token → login with session-expired message

### Implementation for US-01a

- [X] T037 [US01a] Implement `src/app/application/auth/get-current-user.use-case.ts` restoring user from SessionRepository
- [X] T038 [US01a] Add JWT `exp` claim validation in `get-current-user.use-case.ts`; redirect path on expiry per `api.md` §9
- [X] T039 [US01a] Initialize session restore in `src/app/app.ts` or app initializer before protected routes render
- [X] T040 [US01a] Handle EC-03 expired-session redirect to `/login` with message in login presenter

**Checkpoint**: US-01a session restore works

---

## Phase 5: User Story US-01b — Logout (Priority: P1)

**Goal**: Logout clears token, profile, jurisdiction cache; back button cannot access protected routes

**Independent Test**: Logout → redirected to login → back button blocked

### Implementation for US-01b

- [X] T041 [US01b] Implement `src/app/application/auth/logout.use-case.ts` clearing SessionRepository and jurisdiction cache
- [X] T042 [US01b] Wire logout action in `src/app/presentation/shared/layout/header/header.component.ts` (migrate from `src/app/header/header.ts`)
- [X] T043 [US01b] Verify AuthGuard blocks back-navigation to protected routes after logout

**Checkpoint**: US-01b logout journey complete

---

## Phase 6: User Story US-02c — Cascading Filters (Priority: P1)

**Goal**: State → District → Block dropdowns populated from GEOAPI GetUserApplicable* endpoints

**Independent Test**: Login → state dropdown loads → select AP → districts load → select CHANGLANG → blocks load; empty arrays show graceful empty state

### Implementation for US-02c

- [X] T044 [P] [US02c] Create jurisdiction DTOs in `src/app/infrastructure/http/dto/jurisdiction.dto.ts` per `api.md` §4.1–§4.3
- [X] T045 [US02c] Implement `src/app/infrastructure/http/jurisdiction-api.repository.ts` with `getStates(userId, 0)`, `getDistricts(userId, stateId, 0)`, `getBlocks(userId, stateId, districtId, 0)` per `api.md` §4
- [X] T046 [US02c] Handle empty array responses with `message: "No Records found!"` without throwing per `api.md` §2.5 and EC-02
- [X] T047 [P] [US02c] Implement `src/app/application/geo/get-applicable-states.use-case.ts`, `get-applicable-districts.use-case.ts`, `get-applicable-blocks.use-case.ts` per `api.md` §7.2
- [X] T048 [US02c] Create `src/app/presentation/state/map-selection.store.ts` (migrate from `src/app/map-selection.service.ts`) for selected state/district/block IDs
- [X] T049 [US02c] Add cascading dropdown handlers in `src/app/presentation/features/home/home.facade.ts` resetting child dropdowns on parent change per `api.md` §5

**Checkpoint**: US-02c cascading GEOAPI filters work

---

## Phase 7: User Story US-02 — State-Wide Overview (Priority: P1)

**Goal**: State Manager sees all in-scope projects; can select any applicable district

**Independent Test**: Login as State Manager → full state map + all applicable districts selectable → filter by CHANGLANG updates sidebar and map

### Implementation for US-02

- [X] T050 [P] [US02] Implement `src/app/infrastructure/persistence/local-project.repository.ts` wrapping `src/app/data/dummy-project-data.ts` behind ProjectRepository port
- [X] T051 [US02] Implement `src/app/application/projects/get-projects-by-jurisdiction.use-case.ts` using JurisdictionFilterService per `architecture.md` §5.2
- [X] T052 [US02] Create `src/app/presentation/features/home/home.facade.ts` and `models/home.view-model.ts`
- [X] T053 [US02] Migrate `src/app/presentation/features/home/home.page.ts` from `src/app/home/home.ts` with project sidebar and count badge
- [X] T054 [US02] Scope State Manager district dropdown to all `GetUserApplicableDistrict` results (not locked) in home template via facade computed signals

**Checkpoint**: US-02 State Manager dashboard works

---

## Phase 8: User Story US-02a — District-Scoped Dashboard (Priority: P1)

**Goal**: District Manager lands on pre-selected district; no cross-district data

**Independent Test**: District Manager login → map auto-zooms to district → only own districts in dropdown

### Implementation for US-02a

- [X] T055 [US02a] Add role-based viewport auto-fit logic in `home.facade.ts` using applicable district from GEOAPI per FR-MAP-08
- [X] T056 [US02a] Pre-select and lock district dropdown for District Manager via facade (no full state list)
- [X] T057 [US02a] Ensure GetProjectsByJurisdictionUseCase filters to district scope; verify EC-05 cross-district leak prevention

**Checkpoint**: US-02a district scope enforced

---

## Phase 9: User Story US-02b — Block-Scoped Dashboard (Priority: P1)

**Goal**: Block Manager sees only block projects; block dropdown scoped

**Independent Test**: Block Manager login → auto-zoom to block → sidebar shows block projects only

### Implementation for US-02b

- [X] T058 [US02b] Extend `home.facade.ts` for Block Manager pre-selected district + block from `GetUserApplicableBlock`
- [X] T059 [US02b] Filter project list and map markers to block scope in GetProjectsByJurisdictionUseCase path

**Checkpoint**: US-02b block scope enforced

---

## Phase 10: User Story US-06 — API-Backed Production Data (Priority: P1)

**Goal**: Auth and jurisdiction use GEOAPI HTTP repositories; no localStorage for operational data in production

**Independent Test**: Production env uses HTTP repos; `useLocalData` only toggles project repo

### Implementation for US-06

- [ ] T060 [US06] Bind `AuthApiRepository` and `JurisdictionApiRepository` in `infrastructure.providers.ts` for all environments
- [ ] T061 [US06] Ensure `environment.prod.ts` sets `useLocalData: false` and production `apiBaseUrl` per `api.md` §7.5
- [ ] T062 [US06] Remove direct `localStorage` usage from legacy `src/app/services/auth/auth.ts` and `src/app/services/project/project.ts` after migration
- [ ] T063 [US06] Document GEOAPI integration checklist in `specs/002-geo-monitoring-platform/quickstart.md` cross-ref `api.md` §10.1 manual cURL steps

**Checkpoint**: US-06 production data path via GEOAPI for auth/jurisdiction

---

## Phase 11: User Story US-03 — Interactive Map with Project Pins (Priority: P1)

**Goal**: In-scope project markers on map; pin click and sidebar selection open detail without losing filter state

**Independent Test**: Home map shows jurisdiction-scoped pins; hover tooltip; sidebar selection centers map

### Implementation for US-03

- [ ] T064 [P] [US03] Create `src/app/infrastructure/geo/map-adapter.ts` abstract class per `architecture.md` §5.3.3
- [ ] T065 [US03] Implement `src/app/infrastructure/geo/leaflet-map.adapter.ts` with `setProjectMarkers`, `onMarkerClick` (only file importing `leaflet`)
- [ ] T066 [US03] Create `src/app/presentation/features/map/map.facade.ts` and `models/map.view-model.ts`
- [ ] T067 [US03] Guard map init with `isPlatformBrowser` in `map.facade.ts`; show loader until auth completes (EC-06)
- [ ] T068 [US03] Wire project markers from GetProjectsByJurisdictionUseCase into LeafletMapAdapter
- [ ] T069 [US03] Embed map in home page; sync sidebar project selection to center pin per FR-DASH-07

**Checkpoint**: US-03 map pins render in jurisdiction scope

---

## Phase 12: User Story US-03a — Boundary Layers (Priority: P1)

**Goal**: District/block GeoJSON boundaries; click triggers highlight, zoom, summary flow

**Independent Test**: District boundaries render; click district → zoom + load blocks; case-insensitive name match with API dropdowns

### Implementation for US-03a

- [ ] T070 [P] [US03a] Implement `src/app/infrastructure/geo/geojson-file.repository.ts` loading from `src/assets/geojson/`
- [ ] T071 [US03a] Add `setDistrictLayer`, `setBlockLayer`, `onDistrictClick`, `onBlockClick` to LeafletMapAdapter
- [ ] T072 [US03a] Implement case-insensitive name normalization in `jurisdiction.mapper.ts` per `api.md` §5.2 and EC-04
- [ ] T073 [US03a] Parse census attributes (`TOT_P`, `TOT_M`, `TOT_F`, `P_SC`, `P_ST`) from block GeoJSON into `GeoBoundary` entity
- [ ] T074 [US03a] Lazy-load block layer per selected district per `architecture.md` §10 and EC-08

**Checkpoint**: US-03a boundaries and click handlers work

---

## Phase 13: User Story US-03b — Project Detail Panel (Priority: P1)

**Goal**: Tabbed detail panel on pin click (Info, Beneficiaries, Documentation, Photo/Video)

**Independent Test**: Click pin → panel opens with tabs; close preserves map state; "View Project Details" opens new tab

### Implementation for US-03b

- [ ] T075 [P] [US03b] Create `src/app/presentation/features/map/components/project-detail-panel/project-detail-panel.component.ts`
- [ ] T076 [US03b] Wire tab content to ProjectViewModel; link to `/projects` in new tab per FR-PROJ-09
- [ ] T077 [US03b] Handle EC-10 clean panel close while dragging

**Checkpoint**: US-03b detail panel complete

---

## Phase 14: User Story US-04 — Area Summary Panel (Priority: P1)

**Goal**: Summary panel on district/block click with geography metadata and population

**Independent Test**: Click boundary → panel shows state/district/block names + total population; close preserves map

### Implementation for US-04

- [ ] T078 [P] [US04] Create `src/app/presentation/features/map/components/area-summary-panel/area-summary-panel.component.ts`
- [ ] T079 [US04] Implement `src/app/application/analytics/get-area-summary.use-case.ts` per `architecture.md` §8.3
- [ ] T080 [US04] Wire boundary click in map.facade.ts to open area summary scoped to selection (FR-ANLY-07)

**Checkpoint**: US-04 summary panel shell works

---

## Phase 15: User Story US-04a — Gender & Caste Charts (Priority: P1)

**Goal**: Gender and caste/community charts in summary panel; census GeoJSON fallback

**Independent Test**: Summary shows graphical gender and caste charts; fallback from block census when analytics API unavailable

### Implementation for US-04a

- [ ] T081 [P] [US04a] Migrate pie chart to `src/app/presentation/shared/components/pie-chart/` from `src/app/shared/pie-chart/`
- [ ] T082 [US04a] Create `src/app/presentation/shared/components/bar-chart/bar-chart.component.ts` for caste distribution
- [ ] T083 [US04a] Implement census fallback in `get-area-summary.use-case.ts` using GeoBoundary census attributes per `api.md` pending §Analytics and EC-09
- [ ] T084 [US04a] Bind charts in area-summary-panel via AreaSummaryViewModel

**Checkpoint**: US-04a demographic charts render

---

## Phase 16: User Story US-04b — Water & Soil Reports (Priority: P1)

**Goal**: Water and soil report sections with charts or empty states

**Independent Test**: Water/soil sections render when data available; clear empty state when not (no broken charts)

### Implementation for US-04b

- [ ] T085 [P] [US04b] Create stub `src/app/infrastructure/http/analytics-api.repository.ts` returning null water/soil until `api.md` §1.3 endpoints ship
- [ ] T086 [US04b] Add water/soil sections with empty-state UI in area-summary-panel component
- [ ] T087 [US04b] Register AnalyticsRepository binding in `infrastructure.providers.ts`

**Checkpoint**: US-04b water/soil sections with graceful empty states

---

## Phase 17: User Story US-05 — Create Project (Priority: P1)

**Goal**: 5-step project form with map location; Block Manager jurisdiction validation

**Independent Test**: District/Block Manager completes form → project appears on map and sidebar; out-of-block submission rejected

### Implementation for US-05

- [ ] T088 [P] [US05] Implement `src/app/application/projects/create-project.use-case.ts` with jurisdiction check before save (BR-06)
- [ ] T089 [US05] Create `src/app/presentation/features/project/project-form/project-form.facade.ts` migrating from `src/app/project/insert-update-project/`
- [ ] T090 [US05] Migrate map picker to `src/app/presentation/features/project/project-map-picker/` from `src/app/project/map-for-insert/`
- [ ] T091 [US05] Wire LocalProjectRepository create path; block State Manager from create in use case per spec
- [ ] T092 [US05] Lazy-load `/projects` route in `src/app/app.routes.ts`

**Checkpoint**: US-05 project creation works (local repo until GEOAPI projects API)

---

## Phase 18: User Story US-05a — Edit Project (Priority: P1)

**Goal**: Edit in-scope projects; deny cross-district edits

**Independent Test**: Edit saves and reflects on map; District Manager denied outside district

### Implementation for US-05a

- [ ] T093 [US05a] Implement `src/app/application/projects/update-project.use-case.ts` with jurisdiction authorization
- [ ] T094 [US05a] Add edit mode pre-fill in project-form facade
- [ ] T095 [US05a] Refresh home map/sidebar after save via facade communication or shared store

**Checkpoint**: US-05a edit journey works

---

## Phase 19: User Story US-07 — Figma-Aligned UI (Priority: P1)

**Goal**: Login, dashboard, map panels, project form match approved designs ≥90%

**Independent Test**: Visual review against Figma; Orbitron branding and navbar gradient preserved

### Implementation for US-07

- [ ] T096 [P] [US07] Align login page SCSS in `src/app/presentation/features/login/login.page.scss` to Figma spec
- [ ] T097 [P] [US07] Align home dashboard layout/styles in `src/app/presentation/features/home/home.page.scss`
- [ ] T098 [P] [US07] Style map panels in `src/app/presentation/features/map/components/*/` using theme variables from `src/styles/_theme-variables.scss`
- [ ] T099 [US07] Preserve Orbitron "Project Geo" branding in header component

**Checkpoint**: US-07 design parity pass on P1 screens

---

## Phase 20: User Story US-03c — Map Base Layer Switcher (Priority: P2)

**Goal**: Switch Satellite/Streets/Hybrid without losing markers or boundaries

**Independent Test**: Change basemap preserves zoom, center, pins, and boundary layers

### Implementation for US-03c

- [ ] T100 [US03c] Add `setBaseLayer(layerId)` to LeafletMapAdapter per `contracts/pending-apis.md`
- [ ] T101 [US03c] Add base layer control UI in map page template wired through map.facade.ts

**Checkpoint**: US-03c layer switcher works

---

## Phase 21: User Story US-05b — Upload Documents & Media (Priority: P2)

**Goal**: AOI, documents, media attach to project; validation on type/size

**Independent Test**: Upload on form → visible in detail panel tabs; invalid file shows error before upload

### Implementation for US-05b

- [ ] T102 [US05b] Add file upload steps to project-form; validate type/size in ProjectValidationService before infrastructure call
- [ ] T103 [US05b] Create stub `src/app/infrastructure/http/file-api.repository.ts` pending `api.md` §1.3 file upload endpoint
- [ ] T104 [US05b] Display uploaded files in project-detail-panel Documentation and Photo/Video tabs

**Checkpoint**: US-05b upload UI ready (stub until GEOAPI files API)

---

## Phase 22: User Story US-05c — Search Project List (Priority: P2)

**Goal**: Sidebar search filters within 1 second by name, location, scheme, beneficiary

**Independent Test**: Type in search → list filters instantly; empty shows "no projects found"

### Implementation for US-05c

- [ ] T105 [US05c] Add client-side search filter in `home.facade.ts` computed signal over projects list
- [ ] T106 [US05c] Add search input to home sidebar template with empty-state message

**Checkpoint**: US-05c search works

---

## Phase 23: User Story US-06a — Errors & Loading States (Priority: P2)

**Goal**: Loading indicators during API calls; user-friendly errors including login `message` field

**Independent Test**: Slow network shows loader; failed request shows friendly message not raw HTTP error

### Implementation for US-06a

- [ ] T107 [P] [US06a] Migrate loader to `src/app/presentation/shared/components/loader/` from `src/app/services/loader/`
- [ ] T108 [US06a] Map HTTP 401/5xx to ApplicationError in `api-response.mapper.ts` per `api.md` §6.2
- [ ] T109 [US06a] Surface API `message` on login failure in login.presenter.ts
- [ ] T110 [US06a] Add loading/error signals to home.facade.ts and map.facade.ts for jurisdiction and project fetches

**Checkpoint**: US-06a loading and error UX complete

---

## Phase 24: User Story US-06b — IIS Production Deployment (Priority: P2)

**Goal**: Production build deploys to IIS with deep-link routing and HTTPS

**Independent Test**: `npm run build:prod` → deploy `dist/ProjectGeo/browser` + `web.config` → `/home` and `/projects` resolve

### Implementation for US-06b

- [ ] T111 [US06b] Verify `web.config` SPA rewrite rules and `npm run build:prod` script in `package.json`
- [ ] T112 [US06b] Confirm production environment uses HTTPS GEOAPI base URL only per `api.md` §2.1

**Checkpoint**: US-06b IIS deployment verified

---

## Phase 25: User Story US-07a — App Navigation & Header (Priority: P2)

**Goal**: Header with Home, Projects links, user name, theme toggle, logout

**Independent Test**: Navigate Home ↔ Projects; theme persists across pages

### Implementation for US-07a

- [ ] T113 [P] [US07a] Migrate header to `src/app/presentation/shared/layout/header/` with Home and Projects links
- [ ] T114 [US07a] Migrate theme toggle to `src/app/presentation/shared/theme/` from `src/app/theme-toggle/` and `theme.service.ts`

**Checkpoint**: US-07a navigation complete

---

## Phase 26: User Story US-07b — Responsive Layout (Priority: P2)

**Goal**: Dashboard and forms usable at viewport ≥768px

**Independent Test**: Tablet width — map/sidebar layout intact; project stepper readable

### Implementation for US-07b

- [ ] T115 [P] [US07b] Add responsive breakpoints to `home.page.scss` for map + sidebar at ≥768px
- [ ] T116 [US07b] Add responsive styles to project-form SCSS for tablet tap targets

**Checkpoint**: US-07b responsive layout complete

---

## Phase 27: Polish & Cross-Cutting Concerns

**Purpose**: Legacy cleanup, pending GEOAPI swap hooks, marker clustering

- [ ] T117 [P] Implement `src/app/infrastructure/http/project-api.repository.ts` stub aligned with `api.md` §1.3 pending projects endpoints
- [ ] T118 Swap ProjectRepository to ProjectApiRepository when backend delivers projects API; set `useLocalData: false`
- [ ] T119 [P] Add marker clustering in LeafletMapAdapter when >50 pins per `architecture.md` §10
- [ ] T120 Delete legacy files after parity: `src/app/services/auth/auth.ts`, `src/app/services/project/project.ts`, `src/app/map/map.ts`, `src/app/map-selection.service.ts`
- [ ] T121 Run quickstart.md manual verification checklist for all P1 user stories
- [ ] T122 [P] Sync root `api.md` when backend confirms DM/BM/AD group codes and jurisdiction auth header (open items §12)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US-01 (Phase 3)**: Depends on Phase 2 — MVP entry point
- **US-01a/01b (Phases 4–5)**: Depends on US-01
- **US-02c (Phase 6)**: Depends on US-01 — GEOAPI jurisdiction required for dashboard
- **US-02/02a/02b (Phases 7–9)**: Depends on US-02c + project repo
- **US-06 (Phase 10)**: Can parallel after US-01; completes auth/jurisdiction production binding
- **US-03* (Phases 11–13)**: Depends on US-02 project list + US-02c filters
- **US-04* (Phases 14–16)**: Depends on US-03a boundary clicks
- **US-05* (Phases 17–18)**: Depends on US-01 auth + jurisdiction
- **P2 stories (Phases 20–26)**: After related P1 stories
- **Polish (Phase 27)**: After desired P1+P2 stories

### User Story Dependency Graph

```text
Phase 2 (Foundation)
    ↓
US-01 → US-01a → US-01b
    ↓
US-02c → US-02 / US-02a / US-02b
    ↓
US-03 → US-03a → US-03b → US-04 → US-04a → US-04b
    ↓
US-05 → US-05a
US-06 (parallel after US-01)
US-07 (parallel after home exists)
P2: US-03c, US-05b, US-05c, US-06a, US-06b, US-07a, US-07b
```

### Parallel Opportunities

- **Phase 1**: T002–T005 parallel
- **Phase 2**: T007–T016 domain entities parallel; T020–T021 mappers parallel
- **US-03 + US-04 components**: T075, T078, T081 parallel after map facade exists
- **US-07 styling**: T096–T098 parallel

---

## Parallel Example: Phase 2 Domain Layer

```bash
# Launch together:
T008 role.enum.ts
T009 coordinates.vo.ts
T010 jurisdiction.vo.ts
T012 user.entity.ts
T014 project.entity.ts
```

---

## Parallel Example: GEOAPI Integration (US-01 + US-02c)

```bash
# After T018 api-envelope.dto.ts:
T028 login.dto.ts
T044 jurisdiction.dto.ts
T020 user.mapper.ts
T021 jurisdiction.mapper.ts
```

---

## Implementation Strategy

### MVP First (User Story US-01 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US-01 Login via GEOAPI
4. **STOP and VALIDATE**: `POST ValidateUserLogin` per `api.md` §10.1 cURL checklist
5. Continue US-01a → US-01b → US-02c for auth + jurisdiction MVP

### Incremental Delivery

1. Foundation → Login (US-01*) → Jurisdiction filters (US-02c) → Dashboard (US-02*) → Map (US-03*) → Analytics (US-04*) → Projects (US-05*) → Polish (P2)
2. Each story independently verifiable via `quickstart.md`

### GEOAPI Integration Notes (`api.md`)

| Endpoint | Task IDs | Repository |
|----------|----------|--------------|
| `POST /UserDetails/ValidateUserLogin` | T028–T032 | AuthApiRepository |
| `GET /UserDetails/GetUserApplicableState` | T044–T047 | JurisdictionApiRepository |
| `GET /UserDetails/GetUserApplicableDistrict` | T044–T047 | JurisdictionApiRepository |
| `GET /UserDetails/GetUserApplicableBlock` | T044–T047 | JurisdictionApiRepository |
| Projects CRUD (pending) | T117–T118 | ProjectApiRepository |
| Analytics (pending) | T085–T087 | AnalyticsApiRepository |
| File upload (pending) | T103 | FileApiRepository |

---

## Task Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 122 |
| **Phase 1 Setup** | 6 |
| **Phase 2 Foundational** | 21 |
| **P1 user story tasks** | ~75 |
| **P2 user story tasks** | ~17 |
| **Polish** | 6 |

### Tasks per User Story

| Story | Task IDs | Count |
|-------|----------|-------|
| US-01 | T028–T036 | 9 |
| US-01a | T037–T040 | 4 |
| US-01b | T041–T043 | 3 |
| US-02c | T044–T049 | 6 |
| US-02 | T050–T054 | 5 |
| US-02a | T055–T057 | 3 |
| US-02b | T058–T059 | 2 |
| US-06 | T060–T063 | 4 |
| US-03 | T064–T069 | 6 |
| US-03a | T070–T074 | 5 |
| US-03b | T075–T077 | 3 |
| US-04 | T078–T080 | 3 |
| US-04a | T081–T084 | 4 |
| US-04b | T085–T087 | 3 |
| US-05 | T088–T092 | 5 |
| US-05a | T093–T095 | 3 |
| US-07 | T096–T099 | 4 |
| US-03c | T100–T101 | 2 |
| US-05b | T102–T104 | 3 |
| US-05c | T105–T106 | 2 |
| US-06a | T107–T110 | 4 |
| US-06b | T111–T112 | 2 |
| US-07a | T113–T114 | 2 |
| US-07b | T115–T116 | 2 |

**Suggested MVP scope**: Phase 1 + Phase 2 + Phases 3–6 (US-01*, US-02c) — login and jurisdiction GEOAPI integration.

**Format validation**: ✅ All 122 tasks use `- [ ] T### [P?] [US??] Description with file path` format.
