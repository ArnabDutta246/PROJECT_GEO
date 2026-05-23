# Research: Area Summary on Geographic Click (US-04)

**Feature**: `004-area-summary-geo-click`  
**Date**: 2026-05-23  
**Authority**: [spec.md](./spec.md), [requirement.md](../../requirement.md) §4.4, [architecture.md](../../architecture.md) §8.3

---

## R-01: Geographic Click Triggers

**Decision:** Three entry points wired through `MapAdapter` → `MapFacade`:

| Trigger | Handler | Scope resolved |
|---------|---------|----------------|
| Block polygon click | `onBlockClick(blockId, blockName)` | Block-level `GeoScope` |
| District polygon click | `onDistrictClick(districtName)` | District-level `GeoScope` (requires US-03a district layer; interim via district filter context) |
| Map background click | `onMapClick(lat, lng)` | Point-in-polygon against visible block features → block scope |

**Rationale:** Matches FR-ANLY-01 and user-story acceptance scenarios. `onBlockClick` already exists in `LeafletMapAdapter` but is not wired in `MapFacade.initialize()` — lowest-effort first deliverable.

**Alternatives considered:**
- **Separate analytics route (`/analytics`):** Rejected — constitution Principle VI requires map-centric area summary on geographic selection.
- **Dropdown-only trigger (no map click):** Rejected — violates US-04 primary user journey.

---

## R-02: GeoScope Representation

**Decision:** Refactor `GeoScope` from numeric IDs (`stateId`, `districtId`, `blockId`) to **name-based hierarchy** with explicit level:

```typescript
type GeoScopeLevel = 'district' | 'block';

class GeoScope {
  level: GeoScopeLevel;
  stateName: string;
  districtName: string;
  blockName: string | null;  // null when level === 'district'
}
```

**Rationale:** Block GeoJSON and GEOAPI jurisdiction filters use string names (`DISTRICT_N`, `Mouza Name`). Analytics API is pending — name-based scope matches census fallback and existing `normalizeGeoName()` pattern from US-03.

**Alternatives considered:**
- **Keep numeric IDs only:** Rejected — requires ID mapping table not available in block GeoJSON; adds coupling to GEOAPI district/block IDs.
- **Pass raw `GeoBoundary` entity to use case:** Rejected — use cases should receive domain VOs, not infrastructure geometry DTOs.

---

## R-03: Population Data Source & Fallback

**Decision:** `GetAreaSummaryUseCase` calls `AnalyticsRepository.getAreaSummary(scope)`; Infrastructure implements `CensusFallbackAnalyticsRepository` when API unavailable:

| Scope level | Fallback computation |
|-------------|---------------------|
| Block | `GeoBoundary.censusAttributes.totalPopulation` (`TOT_P`) |
| District | Sum `TOT_P` across all blocks where `normalizeGeoName(districtName)` matches |

**Rationale:** FR-ANLY-08 requires total population; spec assumption allows census fallback; US-03a confirms census attributes on block GeoJSON. District aggregation is standard when no district-level census polygon exists.

**Alternatives considered:**
- **Show zero when API down:** Rejected — spec edge case requires metadata + friendly unavailable message, not silent zero.
- **Block-only support (skip district summary):** Rejected — US-04 acceptance scenario 1 explicitly includes district click.

---

## R-04: AreaSummary vs AreaAnalytics Entity Split

**Decision:** Introduce **`AreaSummary`** entity for US-04 (metadata + population). Retain **`AreaAnalytics`** for US-04a (gender/caste percentages) as a separate or extended entity consumed later by chart sections.

**Rationale:** US-04 is independently deliverable without charts. Current `AreaAnalytics` constructor assumes gender/caste fields — forcing US-04 to use it would violate minimal scope and require dummy chart data.

**Alternatives considered:**
- **Single mega-entity with optional fields:** Rejected — unclear invariants; encourages US-04 to accidentally render chart placeholders.
- **Delete `AreaAnalytics`:** Rejected — architecture.md and US-04a depend on it.

---

## R-05: Regional Statistics Sidebar Card

**Decision:** `AreaSummaryCardComponent` renders at the top of the **Regional Statistics** sidebar section. `MapFacade` exposes `areaSummary`, `areaSummaryLoading`, and `hasAreaSelection` — no map overlay for area summary.

```typescript
// Sidebar updates on geographic click; project panel on map is independent
openAreaSummary(scope) → areaSummaryLoading → areaSummary
clearAreaSummary() → areaSummary = null
```

**Rationale:** Product UX revision — users view selected geography alongside existing regional stats placeholders; avoids a second modal on the map. FR-ANLY-01 and FR-ANLY-10 satisfied via sidebar card (non-blocking map view).

**Alternatives considered:**
- **Map-side overlay panel (original US-04):** Rejected — user preference for integrated Regional Statistics sidebar card.
- **Tabbed combined panel (Project | Area) on map:** Rejected — splits attention; sidebar is natural home for analytics.

---

## R-06: Point-in-Polygon for Map Area Click

**Decision:** Implement ray-casting point-in-polygon in `LeafletMapAdapter.onMapClick` against cached block polygon coordinates (already loaded for rendering). Return innermost/most-specific block feature containing the click point.

**Rationale:** Spec FR-002 requires map location clicks within known boundaries resolve to administrative unit. Leaflet's rendered layers already hold geometry; no new dependency required.

**Alternatives considered:**
- **`leaflet-pip` plugin:** Rejected for MVP — adds dependency; small polygon count (~150 blocks) makes inline ray-cast acceptable.
- **Skip map area click until US-03a:** Rejected — spec includes it; block-only PIP is sufficient for MVP.

---

## R-07: District Boundary Click (US-03a Dependency)

**Decision:** US-04 **consumes** district click events from `MapAdapter.onDistrictClick`. Until US-03a ships district GeoJSON layer:

- **Interim:** District summary opens when user has district filter selected and clicks any block in that district **with modifier** (none) — block click still opens block summary; district summary opens via explicit district filter "View summary" action is **NOT** in spec.
- **Preferred interim:** Add lightweight district click by detecting click on block polygon when zoom < block detail threshold → offer district scope — **Rejected as confusing**.
- **Actual interim:** Implement block click + map PIP first; add `onDistrictClick` stub wired when US-03a lands district layer in same `MapFacade` handler registry.

**Rationale:** US-03a acceptance scenario 2 requires district click → summary flow; US-04 depends on US-03a for district polygons. Block-level delivery is still independently testable.

**Alternatives considered:**
- **Synthetic district polygons (union of blocks):** Deferred to US-03a — belongs in boundary layer feature, not analytics.

---

## R-08: Jurisdiction Enforcement Location

**Decision:** `GetAreaSummaryUseCase.execute()` validates:

1. User authenticated (throws / returns null if not)
2. District Manager: `scope.districtName` in `user.jurisdiction.districts`
3. Block Manager: `scope.blockName` in `user.jurisdiction.blocks`

**Rationale:** Constitution Principle I (BR-04) — scope enforcement in business logic, not UI-only.

**Alternatives considered:**
- **Filter in MapFacade only:** Rejected — bypassable; violates constitution.

---

## R-09: Performance & Caching

**Decision:** Reuse `MapFacade.currentBlocks` cache for census fallback — no second GeoJSON fetch on summary open. Show card loading state immediately; populate population when use case completes.

**Rationale:** SC-001 (2s card update); block data already loaded for US-03 map layer.

**Alternatives considered:**
- **Refetch GeoJSON per summary open:** Rejected — unnecessary latency on 2MB file.
