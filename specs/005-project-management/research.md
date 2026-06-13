# Research: Project Management (Epic E-05)

**Feature**: `005-project-management`  
**Date**: 2026-06-13  
**Scope**: Project list on dashboard + create entry + 5-step wizard wired to GEOAPI §6

---

## R-01: Production data source for projects

**Decision:** Replace `LocalProjectRepository` / `localStorage` with `ProjectApiRepository` when `environment.useLocalData === false`.

**Rationale:** Constitution Principle V requires API-backed production data. Auth and jurisdiction already use API/local factory pattern in `infrastructure.providers.ts`.

**Alternatives considered:**
- Keep localStorage and sync to API on submit — rejected (dual source of truth, violates SC-06).
- New standalone service bypassing `ProjectRepository` — rejected (breaks Clean Architecture).

---

## R-02: Repository port shape

**Decision:** Extend `ProjectRepository` with `listForUser(params)` and `submitBasicInfo(payload)`; map `getAllForUser` implementation to `GetGeoProjectList`.

**Rationale:** Existing `GetProjectsByJurisdictionUseCase` and `HomeFacade` already inject `PROJECT_REPOSITORY`. Minimal churn vs new port.

**Alternatives considered:**
- Separate `GeoProjectRepository` port — rejected for v1; can split later if upload APIs add distinct domain.

---

## R-03: Legacy `IProjectData` vs domain `Project`

**Decision:** Phase 1 — introduce `ProjectListItem` view model + mapper from API DTO → domain `Project` → sidebar VM. Deprecate `IProjectData` in `HomeFacade` gradually; keep wizard session model separate (`ProjectWizardState`).

**Rationale:** `HomePage` and `MapFacade.focusLegacyProject` still expect legacy shape. Mapper bridge avoids big-bang map refactor.

**Alternatives considered:**
- Rewrite map pins to use domain `Project` only — correct end state; scheduled Phase 3 after list API stable.

---

## R-04: Figma vs existing form fields

**Decision:** **Figma layout is authoritative for visual structure** (rail, stepper, upload zones, review). **Existing source fields are authoritative for data capture** — retain all fields in `insert-update-project` that are not in Figma, placed in logical steps:

| Field / section | Source location | Figma | Plan |
|-----------------|-----------------|-------|------|
| Project Name dropdown + MISC | Step 1 HTML | Text input | **Keep dropdown**; style per Figma |
| Map pick (`MapForInsert`) | Step 1 HTML | Not shown | **Keep** below coords or side panel |
| State/District/Block IDs | Not in form today | Not in Figma | **Add** jurisdiction row (API required) |
| Nearest landmark | Not in form | Not in Figma | **Add** on step 1 (API required) |
| Contact + dates | Not in form | Not in Figma | **Add** "Project scheduling & contact" subsection step 1 |
| Assigned engineer | Not in form | Not in Figma | **Add** step 1; default from user profile |
| Other Documents upload | Step 3 HTML | Not in Figma | **Keep** as 4th upload card |
| Review step | Not in old UI | Step 5 Figma | **Add**; move submit here only |
| Per-step submit button | Old UI | Review only | **Remove** early submit; SUBMIT on step 5 |

**Rationale:** User explicitly asked to keep source-code fields missing from Figma.

---

## R-05: Project type & scheme type API codes

**Decision:** Add `domain/catalog/project-type.catalog.ts` mapping UI labels (`FOREST & HORTICULTURE`, etc.) → `GPT_*` codes; extend `scheme-type.catalog.ts` with optional `apiCode` (`GPS_*`) per entry.

**Rationale:** API requires codes not labels. Sample response shows `GPT_02` / `GPS_01` with display names in list response.

**Alternatives considered:**
- Hardcode in mapper only — rejected; catalog keeps forms and API aligned.

**Assumption:** Initial code table seeded from [`api.md`](../../api.md) sample + existing `projectNames` array; backend team confirms full enum (Open Item Q-05).

---

## R-06: Submit payload mapping

**Decision:** `SubmitProjectBasicInfoUseCase` maps wizard step-1 + jurisdiction + contact/date fields to `GeoProjectBasicInfoRequestDto`. Steps 2–4 remain session-only for v1.

**Mapping highlights:**

| Wizard / domain | API field |
|-----------------|-----------|
| `gpbi_id` | `0` create; existing id on edit |
| Final project name | `gpbi_project_name` |
| Project type catalog code | `gpbi_project_type` |
| Scheme catalog code | `gpbi_project_scheme_type` |
| Selected state/district/block ids | `gpbi_state_id`, `gpbi_district_id`, `gpbi_block_id` |
| `locationName` | `gpbi_location_name` |
| `nearestLandmark` | `gpbi_nearest_landmark` |
| `latitude` / `longitude` | `gpbi_geo_location_lat/long` (strings) |
| Default / form | `gpbi_geo_location_type` = `POINT`, `gpbi_geo_location_accuracy` = `100`, `gpbi_geo_location_length_area_vol` = `0` |
| Contact fields | `gpbi_contact_*` |
| Dates | `gpbi_planned_*`, `gpbi_actual_*` |
| `assignedToUserId` | `gpbi_project_assigned_to` |
| Session user id | `gpbi_login_user` |
| Default | `gpbi_project_status` = `PENDING`, `gpbi_active` = `Y` |

**Note:** `activityName` maps to `gpbi_project_name` when distinct activity field empty, or both sent per product rule — default: `gpbi_project_name` = final project name; activity stored in review only until API supports extension.

---

## R-07: Dashboard list filtering

**Decision:** Fetch full user list (`currentPageNo=1`, `noOfPagesToGet=50`, `activeYn=Y`); apply district/block/scheme filters **client-side** using API name fields (`gpbi_district_name`, `gpbi_block_name`, `gpbi_project_scheme_type_name`) + `normalizeGeoName()`.

**Rationale:** API has no filter query params; matches current `HomeFacade.filterLegacyBySelection` behavior.

**Alternatives considered:**
- Refetch on every filter change — same payload; no benefit until API supports scoped queries.

---

## R-08: Create entry navigation

**Decision:** Pass dashboard context via `Router` state or `sessionStorage` key `projectCreateContext` `{ stateId, districtId, blockId }` when navigating `/projects?mode=create`.

**Rationale:** Query params leak IDs in URL; sessionStorage already used for edit project (`selectedProjectData`).

---

## R-09: Role gating for create

**Decision:** Show create controls when `user.role` is `DistrictManager`, `BlockManager`, or `Admin`; hide for `StateManager` until backend confirms (per spec assumption).

**Rationale:** Matches user-story role matrix; configurable via `canCreateProject(user)` in domain service.

---

## R-10: Error & loading UX

**Decision:** Reuse `ApplicationError` + `assertApiSuccess` pattern from jurisdiction repo; `HomeFacade` signals: `projectsLoading`, `projectsError`; wizard facade: `submitting`, `submitError`.

**Rationale:** Consistent with US-06a; avoids silent empty list (EC-13).
