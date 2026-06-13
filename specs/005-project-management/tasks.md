---
description: "Task list for Epic E-05 Project Management — list, entry, wizard API submit"
---

# Tasks: Project Management — List, Entry & API Submit

**Input**: Design documents from `specs/005-project-management/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `005-project-management`  
**Depends on**: US-01 auth/session, US-02c jurisdiction dropdowns, US-03 map pins (`MapFacade`)

**Organization**: Tasks grouped by user story (US1–US9 from spec.md). Tests omitted (not requested in spec).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding and catalog foundations for project API integration

- [X] T001 Create `src/app/infrastructure/http/dto/project.dto.ts` with `GeoProjectListResponseDto`, `GeoProjectListItemDto`, `GeoProjectBasicInfoRequestDto`, `GeoProjectSubmitResponseDto` per `specs/005-project-management/contracts/project-api.md`
- [X] T002 [P] Create `src/app/domain/catalog/project-type.catalog.ts` mapping existing `projectNames` labels to `apiCode` (`GPT_*`) per `specs/005-project-management/data-model.md`
- [X] T003 [P] Extend `src/app/domain/catalog/scheme-type.catalog.ts` — add optional `apiCode` (`GPS_*`) on `SchemeTypeDefinition` and seed from `api.md` §6 sample
- [X] T004 [P] Create `src/app/presentation/features/home/models/project-sidebar-item.vm.ts` with `fromProject()` factory per `specs/005-project-management/contracts/home-project-sidebar.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain port, API repository, use cases, and DI — MUST complete before user story phases

**⚠️ CRITICAL**: No user story work until this phase completes

- [X] T005 Extend `src/app/domain/entities/project.entity.ts` with API fields (`numericId`, `projectCode`, `projectTypeCode`, `schemeTypeCode`, jurisdiction IDs, contact, dates, status) per `specs/005-project-management/data-model.md`
- [X] T006 Extend `src/app/domain/repositories/project.repository.ts` with `listForUser(query)`, `submitBasicInfo(payload)`, `getByNumericId(id)` per `specs/005-project-management/data-model.md`
- [X] T007 [P] Create `src/app/infrastructure/http/mappers/project.mapper.ts` — `mapListItemToProject`, `mapProjectToSidebarItem`, `mapWizardToBasicInfoDto` per `specs/005-project-management/contracts/project-api.md`
- [X] T008 Implement `src/app/infrastructure/http/project-api.repository.ts` — `GET /UserDetails/GetGeoProjectList` and `POST /UserDetails/InsertUpdateGeoProjectBasicInfo` with `assertApiSuccess` per `JurisdictionApiRepository` pattern
- [X] T009 Register `ProjectApiRepository` in `src/app/core/providers/infrastructure.providers.ts` and bind `PROJECT_REPOSITORY` factory: API when `!environment.useLocalData`, else `LocalProjectRepository`
- [X] T010 Implement `src/app/application/projects/get-project-list.use-case.ts` with `execute(query?)` returning `Observable<Project[]>` per `specs/005-project-management/plan.md` Phase A3
- [X] T011 Refactor `src/app/application/projects/get-projects-by-jurisdiction.use-case.ts` to delegate list load to `GetProjectListUseCase` then apply jurisdiction/selection filter
- [X] T012 [P] Create `src/app/domain/value-objects/project-create-context.vo.ts` with `mode`, `stateId`, `districtId`, `blockId`, `projectId` per `specs/005-project-management/data-model.md`
- [X] T013 [P] Create `src/app/domain/services/project-permission.service.ts` with `canCreateProject(user)` for District/Block Manager (+ Admin) per `specs/005-project-management/research.md` R-09

**Checkpoint**: `GetProjectListUseCase` returns mapped `Project[]` from GEOAPI when `useLocalData` is false

---

## Phase 3: User Story 1 — View Project List on Dashboard (Priority: P1) 🎯 MVP

**Goal**: Authorized users see API-backed projects in the home dashboard Projects sidebar

**Independent Test**: Login → `/home` → `GetGeoProjectList` network call → rows show project name, location, scheme; empty/error states work (see `specs/005-project-management/quickstart.md` Scenarios 1–2)

### Implementation for User Story 1

- [X] T014 [US1] Add `projectsLoading` and `projectsError` signals to `src/app/presentation/features/home/home.facade.ts`
- [X] T015 [US1] Refactor `loadProjectsForSelection()` in `src/app/presentation/features/home/home.facade.ts` — remove `instanceof LocalProjectRepository` branch; use `GetProjectListUseCase` + client-side district/block/scheme filter via `normalizeGeoName()`
- [X] T016 [US1] Map `Project[]` → `ProjectSidebarItem[]` in `src/app/presentation/features/home/home.facade.ts` using `project-sidebar-item.vm.ts` and scheme catalog icons/colors
- [X] T017 [US1] Update `src/app/presentation/features/home/home.page.html` — bind `@for` project list to `facade.projects()` / sidebar items; add loading spinner and error retry UI in `.sidebar-projects`
- [X] T018 [US1] Remove `projectService.initializeDummyData()` from `src/app/presentation/features/home/home.page.ts` ngOnInit
- [X] T019 [US1] Update `src/app/presentation/features/home/home.page.ts` — use `ProjectSidebarItem` for `filteredProjects`, `selectProject`, `isProjectSelected` instead of raw `IProjectData` where possible
- [X] T020 [US1] Extend `src/app/presentation/features/map/map.facade.ts` with `focusProject(pin)` accepting id + coordinates from API list; keep `focusLegacyProject` as thin wrapper during migration
- [X] T021 [US1] Wire `HomeFacade.selectProject()` to `mapFacade.focusProject()` using `gpbi_geo_location_lat/long` from mapped project

**Checkpoint**: Dashboard sidebar lists GEOAPI projects; selecting a row emphasizes map pin when coordinates exist

---

## Phase 4: User Story 2 — Start Project Create from Dashboard (Priority: P1)

**Goal**: District/Block Managers reach `/projects` create mode via **Create +** and side-nav button with jurisdiction pre-fill

**Independent Test**: Click **Create +** or side-nav create → lands on `/projects` step 1 with dashboard state/district/block pre-selected (see `quickstart.md` Scenarios 3–4)

### Implementation for User Story 2

- [X] T022 [US2] Add underlined **Create +** link/button to `.sidebar-section-header` in `src/app/presentation/features/home/home.page.html` per `specs/005-project-management/contracts/home-project-sidebar.md`
- [X] T023 [US2] Add project-create button (Material `add` icon) to `.nav-rail` in `src/app/presentation/features/home/home.page.html` with `*ngIf` / guard via `canCreateProject`
- [X] T024 [US2] Implement `navigateToCreateProject()` in `src/app/presentation/features/home/home.page.ts` — write `projectCreateContext` to `sessionStorage` and `router.navigate(['/projects'])`
- [X] T025 [US2] Bind both **Create +** and side-nav create to `navigateToCreateProject()` in `src/app/presentation/features/home/home.page.html`
- [X] T026 [US2] Hide create controls when `ProjectPermissionService.canCreateProject()` returns false in `src/app/presentation/features/home/home.page.ts`

**Checkpoint**: Two entry points navigate to wizard; users without permission see no create controls

---

## Phase 5: User Story 3 — Complete Activity & Location — Step 1 (Priority: P1)

**Goal**: Step 1 captures activity, location, coordinates, scheme, AOI, map pick, and API-required jurisdiction/contact/date fields

**Independent Test**: Open `/projects` step 1 → all legacy fields + new API fields visible → validation blocks empty required fields → **GO TO NEXT STEP** retains data (see spec.md US3)

### Implementation for User Story 3

- [X] T027 [US3] Read `projectCreateContext` from `sessionStorage` in `src/app/project/insert-update-project/insert-update-project.ts` ngOnInit and pre-fill state/district/block selections
- [X] T028 [US3] Add jurisdiction cascading dropdowns (state, district, block) to step 1 in `src/app/project/insert-update-project/insert-update-project.html` wired to `GetApplicableStates/Districts/BlocksUseCase`
- [X] T029 [US3] Add API-only fields to step 1 in `src/app/project/insert-update-project/insert-update-project.html` — nearest landmark, contact name/phone/email, assigned engineer, planned/actual dates per `specs/005-project-management/contracts/project-form-wizard.md`
- [X] T030 [US3] Extend `formData` in `src/app/project/insert-update-project/insert-update-project.ts` with new fields and defaults from user profile (`GetCurrentUserUseCase`)
- [X] T031 [US3] Implement step-1 validation in `src/app/project/insert-update-project/insert-update-project.ts` before `nextStep()` — required: project name, scheme, location, lat/lng, jurisdiction IDs, landmark, contact, planned dates
- [X] T032 [US3] Retain existing project name dropdown, `MapForInsert`, and AOI upload in step 1 — do not remove per `specs/005-project-management/research.md` R-04
- [X] T033 [P] [US3] Add step-1 Figma input styles in `src/app/project/insert-update-project/insert-update-project.scss` — `#f6f6f6` inputs, required asterisk, dashed AOI zone per Figma node `133:35`

**Checkpoint**: Step 1 validates and advances with all legacy + API fields captured in component state

---

## Phase 6: User Story 4 — Complete Beneficiary Details — Step 2 (Priority: P1)

**Goal**: Step 2 records beneficiary name (required), costs, and details; session-only for v1

**Independent Test**: Advance from step 1 → fill beneficiary name → step 3; **GO BACK** preserves step 1 data (see spec.md US4)

### Implementation for User Story 4

- [X] T034 [US4] Ensure step 2 fields in `src/app/presentation/features/project/components/step-beneficiaries.component.html` match Figma `133:153` labels and layout (beneficiary name*, estimated/final cost, details textarea)
- [X] T035 [US4] Add step-2 validation in `src/app/project/insert-update-project/insert-update-project.ts` — block `nextStep()` when beneficiary name empty
- [X] T036 [US4] Verify `previousStep()` from step 2 restores step 1 values without reset in `src/app/project/insert-update-project/insert-update-project.ts`
- [X] T037 [P] [US4] Apply Figma step-2 band header and horizontal stepper active state (step 2 purple underline) in `src/app/presentation/features/project/project-form.page.scss`

**Checkpoint**: Step 2 independently testable; data flows forward and back

---

## Phase 7: User Story 7 — Review and Submit Project — Step 5 (Priority: P1)

**Goal**: Step 5 review summarizes wizard data; **SUBMIT** calls `InsertUpdateGeoProjectBasicInfo`; success returns to `/home` with refreshed list

**Independent Test**: Complete steps 1–4 → review shows summaries → SUBMIT → API POST with `gpbi_id: 0` → redirect home → new project in sidebar (see `quickstart.md` Scenario 6)

**Depends on**: US3 (step-1 API fields), Phase 2 foundation

### Implementation for User Story 7

- [X] T038 [P] [US7] Create `src/app/domain/value-objects/project-wizard-state.vo.ts` with step aggregates and `toBasicInfoPayload(userId)` per `specs/005-project-management/data-model.md`
- [X] T039 [US7] Implement `src/app/application/projects/submit-project-basic-info.use-case.ts` — build payload via mapper, call `ProjectRepository.submitBasicInfo`, surface `ApplicationError` on failure
- [X] T040 [US7] Implement `submitBasicInfo` in `src/app/infrastructure/http/project-api.repository.ts` — POST with JSON body and success message handling per `api.md` §6.1
- [X] T041 [US7] Add step 5 **REVIEW DETAILS** section to `src/app/project/insert-update-project/insert-update-project.html` — PROJECT DETAILS, BENEFICIARIES, DOCUMENTATION summary cards with pencil edit links per Figma `133:472`
- [X] T042 [US7] Remove per-step **Submit Application** from stepper sidebar in `src/app/project/insert-update-project/insert-update-project.html` — submit only on step 5 green **SUBMIT** button
- [X] T043 [US7] Replace `storeToLocalStorage()` in `submitForm()` with `SubmitProjectBasicInfoUseCase` when on step 5 in `src/app/project/insert-update-project/insert-update-project.ts`
- [X] T044 [US7] On submit success in `src/app/project/insert-update-project/insert-update-project.ts` — show API `message`, `router.navigate(['/home'])`, trigger list refresh via navigation re-init or shared refresh signal
- [X] T045 [US7] On submit failure — display API `message`, preserve wizard state, remain on step 5 in `src/app/project/insert-update-project/insert-update-project.ts`
- [X] T046 [P] [US7] Style step 5 SUBMIT button green `#07a456` and summary cards `#f8f8f8` grid in `src/app/project/insert-update-project/insert-update-project.scss`

**Checkpoint**: End-to-end create flow persists basic info to GEOAPI and returns user to populated dashboard list

---

## Phase 8: User Story 5 — Complete Documentation Uploads — Step 3 (Priority: P2)

**Goal**: Step 3 captures fund type (required) and document uploads; session-only until upload API

**Independent Test**: Step 3 shows fund type + three Figma upload zones + legacy Other Documents; fund type required to advance (see spec.md US5)

### Implementation for User Story 5

- [X] T047 [US5] Restyle step 3 in `src/app/presentation/features/project/components/step-documentation.component.html` — Fund Type dropdown, three dashed upload zones per Figma `133:261`; retain **Other Documents** fourth column from source
- [ ] T048 [US5] Add step-3 validation in `src/app/project/insert-update-project/insert-update-project.ts` — `fundType` required before step 4
- [ ] T049 [P] [US5] Apply Figma upload zone styles (dashed `#d8dadc`, Browse link `#3b66ff`) in `src/app/project/insert-update-project/insert-update-project.scss` for step 3
- [ ] T050 [US5] Include step 3 file names in step 5 review DOCUMENTATION section in `src/app/project/insert-update-project/insert-update-project.html`

**Checkpoint**: Step 3 uploads appear on review; not sent to API in v1

---

## Phase 9: User Story 6 — Complete Photo & Video — Step 4 (Priority: P2)

**Goal**: Step 4 captures activity photography/videography uploads; **GO FOR REVIEW** advances to step 5

**Independent Test**: Upload media on step 4 → **GO FOR REVIEW** opens step 5 (see spec.md US6)

### Implementation for User Story 6

- [X] T051 [US6] Restyle step 4 in `src/app/presentation/features/project/components/step-media.component.html` — full-width upload zone per Figma `133:368`; retain multi-file media preview from source
- [ ] T052 [US6] Change step 4 primary action label to **GO FOR REVIEW** (not next step) in `src/app/project/insert-update-project/insert-update-project.ts` / template
- [ ] T053 [P] [US6] Apply Figma step-4 stepper active state and upload zone styles in `src/app/project/insert-update-project/insert-update-project.scss`

**Checkpoint**: Step 4 → step 5 navigation works; media listed on review (optional section)

---

## Phase 10: User Story 8 — Search Project List (Priority: P2)

**Goal**: Sidebar search filters API-loaded list by name, location, or scheme in under 1 second

**Independent Test**: Type in search box with 50 projects → list filters instantly (see `quickstart.md` Scenario 5)

### Implementation for User Story 8

- [ ] T054 [US8] Update `matchesKeyword()` in `src/app/presentation/features/home/home.page.ts` to search `projectName`, `locationName`, `schemeLabel`, and `projectCode` on `ProjectSidebarItem`
- [ ] T055 [US8] Show "No projects found" empty state in `src/app/presentation/features/home/home.page.html` when `filteredProjects` is empty but `facade.projects()` has data

**Checkpoint**: Search works on API-backed list without refetch

---

## Phase 11: User Story 9 — Edit Existing Project (Priority: P1)

**Goal**: Open in-scope project in edit mode; save updates via same submit endpoint with `gpbi_id > 0`

**Independent Test**: Open project with numeric id → form pre-fills basic info → SUBMIT sends existing `gpbi_id` → list updates (see spec.md US9)

**Depends on**: US7 submit path

### Implementation for User Story 9

- [ ] T056 [US9] Implement `getByNumericId` in `src/app/infrastructure/http/project-api.repository.ts` — resolve from cached list or single list fetch by id
- [ ] T057 [US9] Add `loadProjectForEdit(gpbiId)` in `src/app/project/insert-update-project/insert-update-project.ts` — map `Project` entity to `formData` and set `isEditMode` + `gpbi_id`
- [ ] T058 [US9] Support opening edit from sidebar/list (e.g. long-press or edit action) — pass `projectId` via `sessionStorage` `projectCreateContext` mode `edit`
- [ ] T059 [US9] Ensure `SubmitProjectBasicInfoUseCase` sends `gpbi_id > 0` on edit in `src/app/infrastructure/http/mappers/project.mapper.ts`

**Checkpoint**: Edit flow updates existing record through GEOAPI

---

## Phase 12: Figma Shell Migration (Cross-Story — US3–US7)

**Purpose**: Shared wizard chrome per Figma mix-design (optional after functional MVP)

- [X] T060 [P] Create `src/app/presentation/features/project/project-form.page.*` — purple left rail, top header per `specs/005-project-management/contracts/project-form-wizard.md`
- [X] T061 [P] Create `src/app/presentation/features/project/components/project-stepper.component.*` — horizontal steps 1–5 with arrows and active underline
- [X] T062 Create `src/app/presentation/features/project/project-form.facade.ts` — extract step navigation and wizard state from `insert-update-project.ts`
- [X] T063 Migrate route `src/app/app.routes.ts` `/projects` to `presentation/features/project/project-form.page.ts`
- [X] T064 [P] Restyle step 1–4 content areas with Figma form band `#f8f8f8` and footer button row (RESET, GO BACK, GO TO NEXT STEP) in project form SCSS

**Checkpoint**: Wizard matches ≥ 90% Figma layout (SC-PM-07) while retaining all source fields

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, map hardening, and manual QA

- [ ] T065 [P] Remove dead `localStorage.projectData` write paths from `src/app/project/insert-update-project/insert-update-project.ts` when `!environment.useLocalData`
- [ ] T066 [P] Update `src/app/infrastructure/persistence/local-project.repository.ts` — implement new port methods as no-op/stub for dev parity
- [ ] T067 Run manual verification checklist in `specs/005-project-management/quickstart.md` (Scenarios 1–8) and record pass/fail
- [ ] T068 [P] Align map pins generation in `src/app/presentation/features/map/map.facade.ts` to use API project list coordinates on home init

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup) → Phase 2 (Foundational) → blocks all user stories
Phase 3 (US1 List) ──┐
Phase 4 (US2 Entry) ─┼→ can start after Phase 2
Phase 5 (US3 Step1) ─┘
Phase 6 (US4 Step2) → after US3
Phase 8 (US5 Step3) → after US4 (P2)
Phase 9 (US6 Step4) → after US5 (P2)
Phase 7 (US7 Submit) → requires US3 + Phase 2; best after US4–US6 for full review
Phase 10 (US8 Search) → after US1
Phase 11 (US9 Edit) → after US7
Phase 12 (Figma) → after US7 functional path
Phase 13 (Polish) → after desired stories complete
```

### User Story Dependencies

| Story | Depends on | Can parallelize with |
|-------|------------|----------------------|
| US1 List | Phase 2 | US2 after T015 |
| US2 Entry | Phase 2, US1 optional | US3 field work |
| US3 Step 1 | Phase 2, US2 context | US4 styling |
| US4 Step 2 | US3 | US5 prep |
| US7 Submit | Phase 2, US3 | — |
| US5 Step 3 | US4 | US6 (P2) |
| US6 Step 4 | US5 | — |
| US8 Search | US1 | US2 |
| US9 Edit | US7 | — |

### Within Each User Story

- Domain/catalog before infrastructure
- Infrastructure before use cases
- Use cases before presentation wiring
- Functional API wire before Figma polish (Phase 12)

---

## Parallel Execution Examples

### After Phase 2 completes

```text
Developer A: T014–T021 (US1 list + map)
Developer B: T027–T033 (US3 step 1 fields)
Developer C: T022–T026 (US2 entry points)
```

### US7 submit track

```text
Parallel: T038 ProjectWizardState + T040 submitBasicInfo in repository
Then sequential: T039 use case → T041–T045 UI wire
```

### Figma polish (Phase 12)

```text
Parallel: T060 shell + T061 stepper + T064 SCSS
Then: T062 facade + T063 route migration
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US7)

1. Complete Phase 1–2 (Foundation)
2. Complete Phase 3 (US1) — **API list on dashboard**
3. Complete Phase 4 (US2) — **create entry points**
4. Complete Phase 5 (US3) — **step 1 with API fields**
5. Complete Phase 7 (US7) — **submit basic info** (steps 2–4 can be minimal/pass-through)
6. **STOP and VALIDATE** — `quickstart.md` Scenarios 1, 3, 6

### Incremental Delivery

1. Foundation → US1 list (monitor projects from API)
2. US2 entry → US3 step 1 → US7 submit (create journey end-to-end)
3. US4–US6 (full wizard steps + review content)
4. US8 search, US9 edit
5. Phase 12 Figma shell polish

### Suggested task counts

| Phase | Tasks | Story |
|-------|-------|-------|
| 1 Setup | 4 | — |
| 2 Foundational | 9 | — |
| 3 US1 | 8 | List |
| 4 US2 | 5 | Entry |
| 5 US3 | 7 | Step 1 |
| 6 US4 | 4 | Step 2 |
| 7 US7 | 9 | Submit |
| 8 US5 | 4 | Step 3 P2 |
| 9 US6 | 3 | Step 4 P2 |
| 10 US8 | 2 | Search P2 |
| 11 US9 | 4 | Edit |
| 12 Figma | 5 | Cross |
| 13 Polish | 4 | Cross |
| **Total** | **68** | |

---

## Notes

- All tasks use checklist format `- [ ] T### [P?] [US?] Description with file path`
- [P] = safe parallel (different files, no incomplete dependency)
- Keep legacy fields in `insert-update-project` until Phase 12 migration completes
- Beneficiary/document/media data stays session-local in v1 (BR-PM-01)
- Confirm `GPT_*` / `GPS_*` code table with backend (api.md Q-05) before production submit
