# Quickstart: ProjectGeo Geo-Monitoring Platform

**Feature**: `002-geo-monitoring-platform`  
**Branch**: `002-geo-monitoring-platform`  
**Plan**: [plan.md](./plan.md) | **Architecture**: [`architecture.md`](../../architecture.md)

---

## Prerequisites

- Node.js 20+
- npm
- Git (on branch `002-geo-monitoring-platform`)

---

## Install & Run

```powershell
cd d:\PROJECTS\AD\PROJECT_GEO_NEW\ProjectGeo
npm install
npm start
```

App: `http://localhost:4200`

---

## Environment Configuration

Create/update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://webgap.in/GEOAPI/api',
  useLocalData: true,
  defaultState: 'Arunachal Pradesh',
};
```

| Flag | Purpose |
|------|---------|
| `apiBaseUrl` | GEOAPI base for auth + jurisdiction |
| `useLocalData` | `true` = local project repo; `false` = API (when ready) |
| `defaultState` | Initial state context for AP deployment |

---

## Verify User Story Journeys (Manual)

### US-01 — Login

1. Open `/login`
2. Enter User ID + password + auto device UUID
3. Expect redirect to `/home` with role-scoped data
4. Invalid credentials show API message without user-ID enumeration

### US-02c — Cascading filters

1. On `/home`, confirm state dropdown populated
2. Select **ARUNACHAL PRADESH** → districts load
3. Select **CHANGLANG** → blocks load
4. Empty applicable list shows graceful empty state (no crash)

### US-03 — Map pins

1. Confirm markers within jurisdiction only
2. Click pin → tabbed detail panel
3. Select sidebar project → map centers + panel opens

### US-03a — Boundaries

1. District boundaries visible on map
2. Click district → highlight + zoom + block layers
3. Case-insensitive name match with dropdowns

### US-04 — Area summary

1. Click district/block → summary panel with population metadata
2. Gender, caste, water, soil sections (water/soil may be empty state)
3. Close panel → map state preserved

### US-05 — Create project (District/Block Manager)

1. Navigate `/projects`
2. Complete 5-step form with map location
3. Saved project appears on home map + sidebar

---

## Build for IIS (US-06b)

```powershell
npm run build:prod
```

Output: `dist/ProjectGeo/browser` + `web.config`

Deploy folder to IIS with URL rewrite enabled; verify deep links `/home`, `/projects`.

---

## Architecture Verification Checklist

After implementing a user story, confirm per [`architecture.md`](../../architecture.md) §7.8:

- [ ] No `@angular/*` imports in `domain/entities` or `domain/value-objects`
- [ ] New workflow has a use case in `application/`
- [ ] Repository accessed from Application/Infrastructure only
- [ ] No role/jurisdiction filtering in templates
- [ ] Map/Leaflet code behind `MapAdapter`; browser guard for SSR
- [ ] No demo credentials in production build

---

## Key Paths

| Resource | Path |
|----------|------|
| Feature spec | `specs/002-geo-monitoring-platform/spec.md` |
| Data model | `specs/002-geo-monitoring-platform/data-model.md` |
| GEOAPI docs | `api.md` |
| Block GeoJSON | `src/assets/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` |
| Legacy map (split target) | `src/app/map/map.ts` |
| Infrastructure providers | `src/app/core/providers/infrastructure.providers.ts` (to create) |

---

## Next Commands

1. **`/speckit-tasks`** — Generate `tasks.md` from plan + user-story journeys
2. **`/speckit-implement`** — Execute tasks in dependency order
