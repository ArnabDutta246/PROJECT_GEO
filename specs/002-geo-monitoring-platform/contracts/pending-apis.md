# Contract: Pending APIs (Stub)

**Feature**: `002-geo-monitoring-platform`  
**Source**: [`api.md`](../../api.md) §1.3, [`requirement.md`](../../requirement.md) §4.6  
**Status**: Not available from backend — Infrastructure uses local adapters until delivered

---

## Projects API (Pending)

**Stories:** US-05, US-05a, US-05b, US-03, US-05c  
**Current adapter:** `LocalProjectRepository` (`environment.useLocalData: true`)  
**Target adapter:** `ProjectApiRepository`

### Indicative endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/projects` | List for authenticated user (server-filtered) |
| GET | `/projects/:id` | Detail |
| POST | `/projects` | Create |
| PUT | `/projects/:id` | Update |
| DELETE | `/projects/:id` | Delete (Admin) |

### Domain entity payload (minimum)

Matches `Project` entity in [data-model.md](../data-model.md).

### Swap procedure (architecture A7)

1. Document final schemas in root `api.md`
2. Implement `ProjectApiRepository` + DTO mappers
3. Set `environment.useLocalData: false`
4. Verify US-05, US-05a acceptance scenarios

---

## Analytics API (Pending)

**Stories:** US-04, US-04a, US-04b  
**Current adapter:** Census fallback from block GeoJSON + stub empty water/soil  
**Target adapter:** `AnalyticsApiRepository`

### Indicative endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/analytics/demographics?scope=...` | Gender + caste |
| GET | `/analytics/water?scope=...` | Water report |
| GET | `/analytics/soil?scope=...` | Soil report |

### Fallback contract (implemented now)

When API unavailable, `GetAreaSummaryUseCase` builds `AreaAnalytics` from:
- `GeoBoundary.censusAttributes` for gender/caste (US-04a)
- `null` water/soil with empty-state UI (US-04b, EC-09)

---

## Geo Boundaries API (Pending)

**Stories:** US-03a  
**Current adapter:** `GeoJsonFileRepository` → `src/assets/geojson/`  
**Target:** Optional API fetch when backend provides boundary service

---

## File Upload API (Pending)

**Stories:** US-05b  
**Indicative:** `POST /files/upload`, `GET /files/:id`  
**Validation:** File type/size in Application layer before upload (architecture §11)

---

## Logout / Token Refresh (Pending)

**Stories:** US-01b (client-side logout works now via session clear)  
**Future:** Server-side token invalidation endpoint

---

## UI Routes Contract (Presentation)

| Route | Page | Guard | Stories |
|-------|------|-------|---------|
| `/login` | `LoginPage` | Public | US-01 |
| `/home` | `HomePage` | AuthGuard | US-02*, US-03*, US-04* |
| `/projects` | `ProjectFormPage` | AuthGuard | US-05* |
| `/map` | `MapPage` | AuthGuard | US-03* |

---

## MapAdapter Interface (Internal)

**File:** `infrastructure/geo/leaflet-map.adapter.ts`  
**Consumer:** `MapFacade` (Presentation)

```typescript
abstract class MapAdapter {
  abstract initialize(containerId: string, options: MapInitOptions): void;
  abstract setDistrictLayer(geoJson: GeoJsonObject): void;
  abstract setBlockLayer(geoJson: GeoJsonObject): void;
  abstract setProjectMarkers(markers: ProjectMarkerDto[]): void;
  abstract onDistrictClick(handler: (districtName: string) => void): void;
  abstract onBlockClick(handler: (blockName: string) => void): void;
  abstract onMarkerClick(handler: (projectId: string) => void): void;
  abstract setBaseLayer(layerId: string): void;
  abstract fitBounds(scope: GeoScope): void;
  abstract destroy(): void;
}
```

**Note:** Only `LeafletMapAdapter` imports `leaflet` package (constitution Principle VI).
