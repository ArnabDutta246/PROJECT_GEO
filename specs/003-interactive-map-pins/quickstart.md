# Quickstart: Interactive Map with Project Pins (US-03)

**Feature**: `003-interactive-map-pins`  
**Branch**: `003-interactive-map-pins`  
**Plan**: [plan.md](./plan.md) | **GeoJSON**: [`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`](../../src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson)

---

## Prerequisites

- Node.js 20+
- npm
- Git on branch `003-interactive-map-pins`
- Completed US-01 (auth) and US-02c (geographic filters) — or equivalent HomeFacade wiring

---

## Install & Run

```powershell
cd d:\PROJECTS\AD\PROJECT_GEO_NEW\ProjectGeo
npm install
npm start
```

App: `http://localhost:4200`

---

## Verify GeoJSON Asset

After implementing Phase 1 asset mapping, confirm the block layer is served:

```powershell
# With dev server running
curl http://localhost:4200/geojson/ARUNACHAL_PRADESH_BLOCK.geojson -I
```

Expect `200 OK` and `Content-Type: application/json` (or `application/geo+json`).

**Source path in repo:** `src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`

---

## Environment

Uses existing `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://webgap.in/GEOAPI/api',
  useLocalData: true,   // Local project pins until Project API ready
  defaultState: 'Arunachal Pradesh',
};
```

---

## Manual Verification — US-03 Acceptance Scenarios

### 1. Map loads with project pins

1. Log in as **State Manager** (`STMN001` or configured test user)
2. Navigate to `/home`
3. **Expect:** Leaflet map renders with block outlines from `ARUNACHAL_PRADESH_BLOCK.geojson`
4. **Expect:** Project pin markers visible within state scope
5. **Expect:** No pins before authentication completes

### 2. Pin hover tooltip

1. Hover a project pin
2. **Expect:** Tooltip shows project name and location address
3. Hover pin with empty location
4. **Expect:** Tooltip shows name + "Location unavailable" (no error)

### 3. Pin click → summary panel

1. Click a project pin
2. **Expect:** Summary panel opens with name, scheme, location, district, block
3. **Expect:** District/block dropdown selections unchanged
4. Close panel
5. **Expect:** Map viewport and filters unchanged

### 4. Sidebar selection sync

1. Click a project in the left sidebar (or "Locate" button)
2. **Expect:** Map centers on that pin
3. **Expect:** Summary panel opens
4. Change district filter
5. **Expect:** Pins update to match filter; only in-scope projects shown

### 5. Block Manager scope

1. Log in as **Block Manager**
2. **Expect:** Map auto-fits to assigned block polygon from GeoJSON
3. **Expect:** Only pins within assigned block — no statewide pins

---

## Role Viewport Checklist

| Role | Expected initial viewport |
|------|---------------------------|
| State Manager | All Arunachal Pradesh block bounds (or selected district) |
| District Manager | Assigned district block collection |
| Block Manager | Single assigned block polygon |

---

## Dev Tools Checks

| Check | How |
|-------|-----|
| GeoJSON loaded | Network tab: `ARUNACHAL_PRADESH_BLOCK.geojson` — single fetch, ~2MB |
| No Leaflet in domain | `grep -r "leaflet" src/app/domain` → empty |
| MapAdapter only Leaflet import | `grep -r "from 'leaflet'" src/app` → only `leaflet-map.adapter.ts` |
| Invalid coords excluded | Project with `latitude: 0, longitude: 0` in sidebar but no pin |

---

## Common Issues

| Issue | Fix |
|-------|-----|
| GeoJSON 404 | Add `src/app/geojson` asset mapping in `angular.json` |
| Block layer empty | Verify `DISTRICT_N` / `Mouza Name` case-insensitive match to dropdown |
| Map blank on SSR | Expected — map renders client-side only after hydration |
| Legacy map still showing | Replace `<app-map>` with `<app-home-map>` in home template |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [spec.md](./spec.md) | User stories & requirements |
| [data-model.md](./data-model.md) | ProjectPin, GeoBoundary entities |
| [contracts/map-adapter.md](./contracts/map-adapter.md) | LeafletMapAdapter interface |
| [contracts/geojson-block-layer.md](./contracts/geojson-block-layer.md) | GeoJSON property schema |
| [architecture.md](../../architecture.md) | Clean Architecture layers |

---

## Next Step

Run **`/speckit-tasks`** to generate implementation tasks from this plan.
