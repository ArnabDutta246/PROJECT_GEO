# Contract: Authentication API (GEOAPI)

**Feature**: `002-geo-monitoring-platform`  
**Source**: [`api.md`](../../api.md) §3  
**Infrastructure**: `infrastructure/http/auth-api.repository.ts`  
**Mapper**: `infrastructure/http/mappers/user.mapper.ts`

**Base URL:** `https://webgap.in/GEOAPI/api`

---

## POST /UserDetails/ValidateUserLogin

**Use case:** `LoginUseCase` (US-01)  
**Auth required:** No

### Request

```typescript
interface LoginRequestDto {
  user_id: string;
  password: string;
  device_uuid: string;
}
```

### Response

```typescript
interface LoginResponseDto {
  token: string | null;
  user: UserProfileDto[] | null;
  statusCode: number;
  message: string;
  success: boolean | null;
  data: null;
}

interface UserProfileDto {
  usp_user_id: string;
  usp_pswd: string;           // NEVER persist
  usp_first_name: string;
  usp_middle_name: string;
  usp_last_name: string;
  usp_group_code: string;
  usp_group_desc: string;
  usp_dept: string;
  usp_mailid: string;
  usp_mobile: string;
  usp_employee_id: string;
  usp_reportee_user: string;
  usp_active_yn: 'Y' | 'N' | string;
}
```

### Domain mapping

| DTO | Domain |
|-----|--------|
| `user[0].usp_user_id` | `User.userId` |
| `usp_group_code` | `UserRole` via `GROUP_CODE_TO_ROLE` |
| `usp_active_yn` | `User.active` |
| Composed name fields | `User.name` |
| `token` | `Session.token` |

### Error handling (Infrastructure → Application)

| Condition | ApplicationError code | User message |
|-----------|----------------------|--------------|
| `success === false` | `LOGIN_FAILED` | `message` from body |
| `usp_active_yn !== 'Y'` | `ACCOUNT_INACTIVE` | Account inactive — contact admin |
| Network failure | `NETWORK_ERROR` | User-friendly retry message |

---

## Session Storage Contract

**Port:** `SessionRepository`  
**Implementation:** `SessionStorageRepository`

| Key | Value |
|-----|-------|
| `projectgeo_token` | JWT string |
| `projectgeo_user` | Serialized `User` (no password) |

**Logout (US-01b):** Clear all keys + jurisdiction cache.

---

## Auth Interceptor Contract

**File:** `core/interceptors/auth.interceptor.ts`

```http
Authorization: Bearer <token from SessionRepository>
```

Apply to all GEOAPI requests except `ValidateUserLogin`.

---

## Pending

| Endpoint | Status | See |
|----------|--------|-----|
| Logout / token refresh | Pending | `pending-apis.md` |
