# Contract: Jurisdiction API (GEOAPI)

**Feature**: `002-geo-monitoring-platform`  
**Source**: [`api.md`](../../api.md) §4  
**Infrastructure:** `infrastructure/http/jurisdiction-api.repository.ts`  
**Use cases:** `GetApplicableStatesUseCase`, `GetApplicableDistrictsUseCase`, `GetApplicableBlocksUseCase` (US-02c)

**Base URL:** `https://webgap.in/GEOAPI/api`

---

## Common Rules

- `userId` = logged-in `usp_user_id`
- ID params use `0` for "all applicable" at that level
- Send `Authorization: Bearer <token>` (recommended until backend confirms)
- Empty array + `"No Records found!"` is valid — not an HTTP error (EC-02)

---

## GET /UserDetails/GetUserApplicableState

**Query:** `userId`, `stateId` (0 = all)

### Response

```typescript
interface ApplicableStateResponseDto {
  state: StateItemDto[];
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

interface StateItemDto {
  tsm_state_id: number;
  tsm_state_name: string;
}
```

**Domain:** `StateOption[]`

---

## GET /UserDetails/GetUserApplicableDistrict

**Query:** `userId`, `stateId`, `districtId` (0 = all in state)

### Response

```typescript
interface ApplicableDistrictResponseDto {
  district: DistrictItemDto[];
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

interface DistrictItemDto {
  tdm_district_id: number;
  tdm_district_name: string;
}
```

**Domain:** `DistrictOption[]`

---

## GET /UserDetails/GetUserApplicableBlock

**Query:** `userId`, `stateId`, `districtId`, `blockId` (0 = all in district)

### Response

```typescript
interface ApplicableBlockResponseDto {
  block: BlockItemDto[];
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

interface BlockItemDto {
  tbm_block_id: number;
  tbm_block_name: string;
}
```

**Domain:** `BlockOption[]`

---

## Presentation Contract (HomeFacade)

Cascading behavior (US-02c):

1. Load states on home init
2. On state select → reload districts, reset blocks
3. On district select → reload blocks, sync map highlight
4. On block select → filter projects + map viewport

**Map sync:** Case-insensitive match district/block names to GeoJSON properties (EC-04).

---

## Domain → ViewModel

| Domain | ViewModel field |
|--------|-----------------|
| `StateOption.name` | Dropdown label |
| `DistrictOption.name` | Dropdown label + map layer key |
| `BlockOption.name` | Dropdown label + summary scope |
