# Data Model: Area Summary on Geographic Click

**Feature**: `004-area-summary-geo-click`  
**Date**: 2026-05-23  
**Authority**: [spec.md](./spec.md), [architecture.md](../../architecture.md) §5.1  
**Extends**: Platform entities from `specs/002-geo-monitoring-platform/data-model.md`, block layer from `specs/003-interactive-map-pins/data-model.md`

US-04 adds analytics geography scoping and summary metadata. Reuses `GeoBoundary`, `CensusAttributes`, `User`, `Jurisdiction`.

---

## Value Objects

### GeoScope (`domain/value-objects/geo-scope.vo.ts`) — REFACTOR

Represents the administrative unit selected for analytics.

| Field | Type | Validation |
|-------|------|------------|
| level | `'district' \| 'block'` | Required |
| stateName | `string` | Required, non-empty |
| districtName | `string` | Required, non-empty |
| blockName | `string \| null` | Required when `level === 'block'`; must be null when `level === 'district'` |

**Factories:**

- `GeoScope.district(stateName, districtName): GeoScope`
- `GeoScope.block(stateName, districtName, blockName): GeoScope`

**Rules:**

- Block scope MUST NOT be created with null `blockName`
- District scope MUST NOT include a block name
- Names compared case-insensitively via `normalizeGeoName()` at repository/use-case boundaries

**Used by:** `GetAreaSummaryUseCase`, `AnalyticsRepository`, `MapFacade`

---

### GeographicSelection (`domain/value-objects/geographic-selection.vo.ts`) — NEW (optional)

Raw map interaction before scope normalization.

| Field | Type | Description |
|-------|------|-------------|
| source | `'block-click' \| 'district-click' \| 'map-click'` | Interaction type |
| blockId | `string \| null` | From GeoJSON feature id |
| districtName | `string \| null` | From district layer or derived |
| coordinates | `{ latitude: number; longitude: number } \| null` | For map-click source |

**Used by:** `MapFacade` internal; mapped to `GeoScope` before use case call.

---

## Entities

### AreaSummary (`domain/entities/area-summary.entity.ts`) — NEW

Minimum analytics payload for US-04 sidebar card.

| Field | Type | Notes |
|-------|------|-------|
| scope | `GeoScope` | Selection that produced this summary |
| stateName | `string` | Display label (e.g. "Arunachal Pradesh") |
| districtName | `string` | Human-readable district |
| blockName | `string \| null` | Present only for block scope |
| totalPopulation | `number \| null` | Null when unavailable |
| populationAvailable | `boolean` | False → show unavailable message |

**Invariants:**

- When `scope.level === 'block'`, `blockName` MUST be non-null
- When `scope.level === 'district'`, `blockName` MUST be null
- When `populationAvailable === false`, `totalPopulation` MUST be null
- When `populationAvailable === true`, `totalPopulation` MUST be ≥ 0

**Factory:** Built by `GetAreaSummaryUseCase` or `AreaSummaryMapper` from API DTO / census aggregation.

**Used by:** `AreaSummaryViewModel`, future US-04a chart use cases (read scope from same selection context).

---

### AreaAnalytics (`domain/entities/area-analytics.entity.ts`) — RETAIN (US-04a)

Unchanged for US-04. US-04a will compose or extend from `AreaSummary` scope plus chart metrics.

| Field | Type | US-04 usage |
|-------|------|-------------|
| scopeLabel | `string` | — |
| populationMalePct | `number` | — |
| populationFemalePct | `number` | — |
| casteBreakdown | `ReadonlyArray<{ label, value }>` | — |

---

### GeoBoundary — REUSE (no schema change)

| Relevant fields | US-04 usage |
|-----------------|-------------|
| `id`, `name`, `districtName` | Resolve click → `GeoScope` |
| `censusAttributes.totalPopulation` | Block population fallback (`TOT_P`) |
| `geometry` | Point-in-polygon for map click |

**District aggregation rule:** Sum `censusAttributes.totalPopulation` for all boundaries where `normalizeGeoName(b.districtName) === normalizeGeoName(scope.districtName)`.

---

## Repository Ports

### AnalyticsRepository — EXTEND

```typescript
abstract getAreaSummary(scope: GeoScope): Observable<AreaSummary | null>;
```

**Implementations:**

| Class | When |
|-------|------|
| `CensusFallbackAnalyticsRepository` | `environment.useLocalData` or API unavailable |
| `AnalyticsApiRepository` | Production when `/analytics/demographics` ships |

---

### AreaSummaryViewModel (`presentation/features/map/models/area-summary.view-model.ts`)

| Field | Type | Source |
|-------|------|--------|
| title | `string` | Block name or district name |
| subtitle | `string` | "District, State" hierarchy breadcrumb |
| stateName | `string` | `AreaSummary.stateName` |
| districtName | `string` | `AreaSummary.districtName` |
| blockName | `string \| null` | `AreaSummary.blockName` |
| totalPopulationLabel | `string` | Formatted number or "Unavailable" |
| scopeLevel | `'district' \| 'block'` | For conditional template sections |
| loading | `boolean` | Facade state |

**Factory:** `AreaSummaryViewModel.fromEntity(summary: AreaSummary): AreaSummaryViewModel`

---

## State (Presentation)

### MapFacade — EXTEND signals

| Signal | Type | Purpose |
|--------|------|---------|
| `areaSummary` | `AreaSummaryViewModel \| null` | Sidebar card content |
| `areaSummaryLoading` | `boolean` | Card loading skeleton |
| `hasAreaSelection` | `computed boolean` | True when loading or summary present |
| `summaryOpen` | `boolean` | Project detail panel on map — independent of area card |

### MapSelectionStore — optional extension

| Signal | Type | Purpose |
|--------|------|---------|
| `selectedAreaScope` | `GeoScope \| null` | Track analytics selection without altering filter dropdowns |

**Rule:** Area summary open/close MUST NOT reset `selectedDistrictId` / `selectedBlockId` unless US-03a boundary sync explicitly requires it.

---

## Data Flow Diagram

```text
User click (block/district/map)
  → MapFacade.handleGeographicSelection()
  → GeoScope built from GeoBoundary / click coords
  → GetAreaSummaryUseCase.execute(scope, user)
      → jurisdiction check
      → AnalyticsRepository.getAreaSummary(scope)
          → CensusFallback: TOT_P or district sum
  → AreaSummary entity
  → AreaSummaryViewModel.fromEntity()
  → hasAreaSelection true (sidebar card visible)
```

---

## Validation & Error States

| Condition | Domain/Application behavior | UI behavior |
|-----------|----------------------------|-------------|
| Out-of-scope geography | Use case returns `null` | No panel or access message |
| Census missing for block | `populationAvailable: false` | Metadata + unavailable message |
| No blocks in district | `populationAvailable: false` | Metadata + unavailable message |
| API error | Map to `ApplicationError` | Friendly message in panel |
| Unauthenticated | Use case no-op | BR-05 — no panel |

---

## Future Extensions (US-04a / US-04b)

| Entity section | Story | Attached to |
|----------------|-------|-------------|
| Gender chart data | US-04a | `AreaAnalytics` or panel subsection |
| Caste chart data | US-04a | Same |
| Water report | US-04b | New `WaterReport` VO |
| Soil report | US-04b | New `SoilReport` VO |

Panel shell from US-04 reserves DOM slots for these sections without requiring geography re-selection.
