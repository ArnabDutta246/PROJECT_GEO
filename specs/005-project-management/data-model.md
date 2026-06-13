# Data Model: Project Management (Epic E-05)

**Feature**: `005-project-management`  
**Date**: 2026-06-13  
**Authority**: [spec.md](./spec.md), [api.md](../../api.md) §6, existing `src/app/domain/entities/project.entity.ts`

---

## Entity Extensions

### Project (`domain/entities/project.entity.ts`) — EXTEND

Production project record mapped from `GeoProjectListItemDto` and wizard submit.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| id | `string` | `gpbi_id` stringified | Primary key for UI/routing |
| numericId | `number` | `gpbi_id` | Submit/update |
| projectCode | `string` | `gpbi_project_code` | Display in list optional |
| projectName | `string` | `gpbi_project_name` | |
| projectTypeCode | `string` | `gpbi_project_type` | e.g. `GPT_02` |
| projectTypeName | `string` | `gpbi_project_type_name` | List display |
| activityName | `string` | wizard / fallback to projectName | Legacy map pin key |
| schemeTypeCode | `string` | `gpbi_project_scheme_type` | |
| schemeTypeName | `string` | `gpbi_project_scheme_type_name` | Sidebar + filter |
| locationName | `string` | `gpbi_location_name` | |
| nearestLandmark | `string` | `gpbi_nearest_landmark` | |
| coordinates | `Coordinates` | lat/long strings | |
| geoLocationType | `string` | `gpbi_geo_location_type` | Default `POINT` |
| geoAccuracy | `string` | `gpbi_geo_location_accuracy` | |
| jurisdiction | `Jurisdiction` | state/district/block **names** from API | IDs stored separately |
| stateId | `number` | `gpbi_state_id` | Submit |
| districtId | `number` | `gpbi_district_id` | Submit |
| blockId | `number` | `gpbi_block_id` | Submit |
| assignedToUserId | `string` | `gpbi_project_assigned_to` | |
| assignedToUserName | `string` | `gpbi_project_assigned_to_user_name` | |
| contactName | `string` | `gpbi_contact_name` | |
| contactNumber | `string` | `gpbi_contact_number` | |
| contactEmail | `string` | `gpbi_contact_email_id` | |
| status | `string` | `gpbi_project_status` | |
| remarks | `string` | `gpbi_project_remarks` | |
| active | `boolean` | `gpbi_active === 'Y'` | |
| createdOn | `string` | `gpbi_project_created_on` | |
| plannedStartDate | `string` | `gpbi_planned_start_date` | |
| actualStartDate | `string \| null` | `gpbi_actual_start_date` | |
| plannedEndDate | `string` | `gpbi_planned_end_date` | |
| actualEndDate | `string \| null` | `gpbi_actual_end_date` | |
| estimatedCost | `Money \| null` | wizard only v1 | Not in basic-info API |
| finalCost | `Money \| null` | wizard only v1 | |
| fundType | `string` | wizard only v1 | |
| beneficiaryName | `string` | wizard only v1 | |
| beneficiaryDetails | `string` | wizard only v1 | |
| aoiFileRef | `string \| null` | session | |
| documentRefs | `readonly string[]` | session | |
| mediaRefs | `readonly string[]` | session | |

**Invariants:**
- `numericId > 0` for updates; `0` only in create payload builder
- `coordinates` required for map pin; nullable when API returns empty strings
- `stateId`, `districtId`, `blockId` required before submit

---

## Value Objects

### ProjectWizardState (`domain/value-objects/project-wizard-state.vo.ts`) — NEW

In-memory 5-step form aggregate (not persisted to API except basic-info subset).

| Step | Fields |
|------|--------|
| 1 | projectTypeSelection, projectName, activityName, schemeType, locationName, nearestLandmark, lat, lng, stateId, districtId, blockId, aoiFilesMeta, assignedTo, contact*, dates* |
| 2 | beneficiaryName, estimatedCost, finalCost, beneficiaryDetails |
| 3 | fundType, beneficiaryDocs, planFiles, tenderFiles, otherDocs |
| 4 | mediaFiles |
| 5 | read-only projection of 1–4 |

**Rules:** Forward navigation validates current step; `toBasicInfoPayload(userId)` produces submit DTO.

---

### ProjectCreateContext (`domain/value-objects/project-create-context.vo.ts`) — NEW

| Field | Type |
|-------|------|
| stateId | `number \| null` |
| districtId | `number \| null` |
| blockId | `number \| null` |
| mode | `'create' \| 'edit'` |
| projectId | `number \| null` |

Passed from home dashboard to wizard on navigation.

---

## Catalogs

### project-type.catalog.ts — NEW

Maps UI labels (from existing `projectNames` array) → `apiCode` (`GPT_*`).

| UI label (example) | apiCode (seed) |
|--------------------|----------------|
| FOREST & HORTICULTURE | `GPT_02` |
| MGNRGA | `GPT_01` (TBD confirm) |
| MISC. (Create new) | user-defined → default `GPT_99` or prompt |

### scheme-type.catalog.ts — EXTEND

Add optional `apiCode?: string` per `SchemeTypeDefinition`.

| label | apiCode (seed) |
|-------|----------------|
| Plantation | `GPS_01` |
| … | TBD per backend |

---

## Repository Port

### ProjectRepository (`domain/repositories/project.repository.ts`) — EXTEND

```typescript
abstract listForUser(query: ProjectListQuery): Observable<Project[]>;
abstract submitBasicInfo(payload: ProjectBasicInfoPayload): Observable<void>;
abstract getByNumericId(id: number): Observable<Project | null>;
```

Retain `getAllForUser` as alias to `listForUser` default query for backward compatibility during migration.

**ProjectListQuery:**

| Field | Default |
|-------|---------|
| loginUserId | from session |
| currentPageNo | 1 |
| noOfPagesToGet | 50 |
| activeYn | `'Y'` |

**ProjectBasicInfoPayload:** mirrors `GeoProjectBasicInfoRequestDto` fields as domain types.

---

## Application Use Cases — NEW

| Use Case | Input | Output |
|----------|-------|--------|
| `GetProjectListUseCase` | `ProjectListQuery?` | `Project[]` |
| `SubmitProjectBasicInfoUseCase` | `ProjectWizardState` + user | `void` |
| `GetProjectForEditUseCase` | `numericId` | `ProjectWizardState` |

Existing `GetProjectsByJurisdictionUseCase` — refactor to call `GetProjectListUseCase` + jurisdiction filter service.

---

## Presentation View Models

### ProjectSidebarItem (`presentation/features/home/models/project-sidebar-item.vm.ts`) — NEW

| Field | Maps from |
|-------|-----------|
| id | `project.id` |
| title | `project.projectName` |
| subtitle | `project.locationName` |
| schemeLabel | `project.schemeTypeName` |
| schemeIcon | catalog by label |
| schemeColor | catalog by label |
| code | `project.projectCode` |

### ProjectFormFacade signals

`currentStep`, `wizardState`, `submitting`, `errors`, `isEditMode`

---

## State Transitions

```text
[Home] --load--> GetProjectListUseCase --> projects signal
[Home] --Create+--> /projects (create context)
[Wizard step 1..4] --next/back--> ProjectWizardState updated
[Wizard step 5] --SUBMIT--> SubmitProjectBasicInfoUseCase --> API
  --success--> navigate /home --> refresh list
  --failure--> stay on step 5, show message
```

---

## Migration Notes

| Legacy | Replacement |
|--------|-------------|
| `localStorage.projectData` | `GetGeoProjectList` |
| `IProjectData` | `ProjectSidebarItem` + mapper |
| `insert-update-project` localStorage submit | `SubmitProjectBasicInfoUseCase` |
| `projectService.initializeDummyData()` | Remove from `HomePage` when API bound |
| `HomeFacade` `instanceof LocalProjectRepository` branch | Remove after API repo |
