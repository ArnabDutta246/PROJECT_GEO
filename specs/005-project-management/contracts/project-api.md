# Contract: Project API (GEOAPI)

**Feature**: `005-project-management`  
**Source**: [`api.md`](../../api.md) §6  
**Infrastructure:** `infrastructure/http/project-api.repository.ts`  
**Use cases:** `GetProjectListUseCase`, `SubmitProjectBasicInfoUseCase`, `GetProjectsByJurisdictionUseCase`

**Base URL:** `https://webgap.in/GEOAPI/api`

---

## Common Rules

- `loginUserId` / `gpbi_login_user` = logged-in `usp_user_id`
- Jurisdiction IDs from `GetUserApplicable*` endpoints — never hardcoded
- `gpbi_id = 0` on create; existing numeric id on update
- Send `Authorization: Bearer <token>` on all calls (recommended)
- Inspect body `success` and `statusCode`; HTTP 200 may still fail
- Date format: `YYYY-MM-DD`
- Lat/long sent as **strings** in API

---

## GET /UserDetails/GetGeoProjectList

**Query parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| loginUserId | string | Yes | session user id |
| currentPageNo | number | Yes | 1 |
| noOfPagesToGet | number | Yes | 50 |
| activeYn | `'Y' \| 'N'` | Yes | `Y` |

### Response DTO

```typescript
interface GeoProjectListResponseDto {
  geoProjectList: GeoProjectListItemDto[];
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

interface GeoProjectListItemDto {
  gpbi_id: number;
  gpbi_project_code: string;
  gpbi_project_type: string;
  gpbi_project_type_name: string;
  gpbi_project_name: string;
  gpbi_project_scheme_type: string;
  gpbi_project_scheme_type_name: string;
  gpbi_state_id: number;
  gpbi_state_name: string;
  gpbi_district_id: number;
  gpbi_district_name: string;
  gpbi_block_id: number;
  gpbi_block_name: string;
  gpbi_location_name: string;
  gpbi_nearest_landmark: string;
  gpbi_geo_location_type: string;
  gpbi_geo_location_lat: string;
  gpbi_geo_location_long: string;
  gpbi_geo_location_accuracy: string;
  gpbi_geo_location_length_area_vol: number;
  gpbi_project_assigned_to: string;
  gpbi_project_assigned_to_user_name: string;
  gpbi_contact_name: string;
  gpbi_contact_number: string;
  gpbi_contact_email_id: string;
  gpbi_project_status: string;
  gpbi_project_remarks: string;
  gpbi_project_created_on: string;
  gpbi_planned_start_date: string;
  gpbi_actual_start_date: string;
  gpbi_planned_end_date: string;
  gpbi_actual_end_date: string;
  gpbi_active: string;
}
```

### Domain mapping

`GeoProjectListItemDto` → `Project` entity via `project.mapper.ts`

**Sidebar display fields:**
- Title: `gpbi_project_name`
- Subtitle: `gpbi_location_name`
- Scheme: `gpbi_project_scheme_type_name` (fallback `gpbi_project_type_name`)
- Code (optional): `gpbi_project_code`

**Map pin fields:**
- `gpbi_geo_location_lat`, `gpbi_geo_location_long`
- Label: `gpbi_project_name` + `gpbi_location_name`

### Empty result

`geoProjectList: []` + `success: true` → valid; show empty state.

---

## POST /UserDetails/InsertUpdateGeoProjectBasicInfo

**Content-Type:** `application/json`  
**Accept:** `text/plain`

### Request DTO

```typescript
interface GeoProjectBasicInfoRequestDto {
  gpbi_id: number;
  gpbi_project_type: string;
  gpbi_project_name: string;
  gpbi_project_scheme_type: string;
  gpbi_state_id: number;
  gpbi_district_id: number;
  gpbi_block_id: number;
  gpbi_location_name: string;
  gpbi_nearest_landmark: string;
  gpbi_geo_location_type: string;
  gpbi_geo_location_lat: string;
  gpbi_geo_location_long: string;
  gpbi_geo_location_accuracy: string;
  gpbi_geo_location_length_area_vol: number;
  gpbi_project_assigned_to: string;
  gpbi_contact_name: string;
  gpbi_contact_number: string;
  gpbi_contact_email_id: string;
  gpbi_project_status: string;
  gpbi_login_user: string;
  gpbi_active: string;
  gpbi_planned_start_date: string;
  gpbi_actual_start_date?: string;
  gpbi_planned_end_date: string;
  gpbi_actual_end_date?: string;
}
```

### Success response

```typescript
interface GeoProjectSubmitResponseDto {
  statusCode: number;
  message: string; // "Data submitted successfully."
  success: boolean;
}
```

### Wizard → API field mapping

| Wizard / existing form field | API field | Notes |
|------------------------------|-----------|-------|
| `numericId` (0 create) | `gpbi_id` | |
| Project type catalog `apiCode` | `gpbi_project_type` | From `projectNames` dropdown |
| `getFinalProjectName()` | `gpbi_project_name` | |
| Scheme catalog `apiCode` | `gpbi_project_scheme_type` | |
| `selectedStateId` | `gpbi_state_id` | **New form control** |
| `selectedDistrictId` | `gpbi_district_id` | **New form control** |
| `selectedBlockId` | `gpbi_block_id` | **New form control** |
| `locationName` | `gpbi_location_name` | |
| `nearestLandmark` | `gpbi_nearest_landmark` | **New form control** |
| — | `gpbi_geo_location_type` | Default `POINT` |
| `latitude` | `gpbi_geo_location_lat` | `String(lat)` |
| `longitude` | `gpbi_geo_location_long` | `String(lng)` |
| `geoAccuracy` or default | `gpbi_geo_location_accuracy` | Default `"100"` |
| — | `gpbi_geo_location_length_area_vol` | `0` for point |
| `assignedToUserId` | `gpbi_project_assigned_to` | **New**; default reportee or self |
| `contactName` | `gpbi_contact_name` | **New**; default from profile |
| `contactNumber` | `gpbi_contact_number` | **New** |
| `contactEmail` | `gpbi_contact_email_id` | **New** |
| — | `gpbi_project_status` | Default `PENDING` |
| session `usp_user_id` | `gpbi_login_user` | |
| — | `gpbi_active` | Default `Y` |
| `plannedStartDate` | `gpbi_planned_start_date` | **New** |
| `actualStartDate` | `gpbi_actual_start_date` | Optional |
| `plannedEndDate` | `gpbi_planned_end_date` | **New** |
| `actualEndDate` | `gpbi_actual_end_date` | Optional |

**Not sent in v1 (session-only):** `activityName` (unless merged into name), beneficiary fields, costs, fund type, file uploads.

---

## Infrastructure binding

```typescript
// infrastructure.providers.ts
{
  provide: PROJECT_REPOSITORY,
  deps: [ProjectApiRepository, LocalProjectRepository],
  useFactory: (api, local) =>
    environment.useLocalData ? local : api,
}
```

---

## Error handling

| Condition | UX |
|-----------|-----|
| `success === false` | Show `message`; preserve wizard state |
| Network error | `ApplicationError` with retry hint |
| List failure on home | `projectsError` signal; retry button |
| Empty list | "No projects match your filters." |
