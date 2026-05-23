# Contract: AnalyticsRepository

**Feature**: `004-area-summary-geo-click`  
**Port**: `src/app/domain/repositories/analytics.repository.ts`  
**Implementations**: `CensusFallbackAnalyticsRepository`, `AnalyticsApiRepository` (future)  
**Consumer**: `GetAreaSummaryUseCase`

---

## Port Interface

```typescript
import { Observable } from 'rxjs';
import { AreaSummary } from '@domain/entities/area-summary.entity';
import { GeoScope } from '@domain/value-objects/geo-scope.vo';

export abstract class AnalyticsRepository {
  /**
   * Returns scoped area summary for the given geography.
   * Returns null when scope is unknown or data cannot be resolved.
   */
  abstract getAreaSummary(scope: GeoScope): Observable<AreaSummary | null>;
}
```

**Note:** Existing `AreaAnalytics` return type is superseded for US-04 by `AreaSummary`. US-04a may add `getDemographics(scope)` or extend this port.

---

## Request Scope Mapping

| GeoScope.level | Query semantics |
|----------------|-----------------|
| `block` | Single block population + metadata |
| `district` | District aggregate population + metadata |

**Scope key (for future API):**

```text
GET /analytics/demographics?state=Arunachal%20Pradesh&district=CHANGLANG&block=MIGGING
GET /analytics/demographics?state=Arunachal%20Pradesh&district=CHANGLANG
```

Exact API schema pending — see [pending-apis.md](../../002-geo-monitoring-platform/contracts/pending-apis.md).

---

## CensusFallbackAnalyticsRepository

**File:** `src/app/infrastructure/analytics/census-fallback-analytics.repository.ts`  
**Dependencies:** `GeoBoundaryRepository` or injected block cache from use case

### Block scope

```typescript
// Input: GeoScope.block('Arunachal Pradesh', 'CHANGLANG', 'MIGGING')
// Lookup: block where normalizeGeoName(name) === normalizeGeoName(blockName)
// Output:
{
  scope,
  stateName: 'Arunachal Pradesh',
  districtName: boundary.districtName,
  blockName: boundary.name,
  totalPopulation: boundary.censusAttributes?.totalPopulation ?? null,
  populationAvailable: boundary.censusAttributes != null,
}
```

### District scope

```typescript
// Input: GeoScope.district('Arunachal Pradesh', 'CHANGLANG')
// Lookup: all blocks where normalizeGeoName(districtName) matches
// Output:
{
  scope,
  stateName: 'Arunachal Pradesh',
  districtName: 'CHANGLANG',
  blockName: null,
  totalPopulation: sum(block.censusAttributes.totalPopulation),
  populationAvailable: atLeastOneBlockHasCensus,
}
```

---

## AnalyticsApiRepository (Future)

**File:** `src/app/infrastructure/http/analytics-api.repository.ts`  
**When:** Backend delivers `/analytics/demographics`

| HTTP | Maps to |
|------|---------|
| 200 + body | `AreaSummary` via DTO mapper |
| 404 | `null` → panel shows unavailable population |
| 401/403 | `ApplicationError.unauthorized()` |
| 5xx | `ApplicationError.serviceUnavailable()` |

**Swap procedure:**

1. Document response schema in root `api.md`
2. Implement `AnalyticsApiRepository` + mapper
3. Update `infrastructure.providers.ts` factory (similar to auth repo toggle)
4. Keep `CensusFallbackAnalyticsRepository` as offline/degraded fallback if desired

---

## Provider Binding

```typescript
{
  provide: ANALYTICS_REPOSITORY,
  useClass: CensusFallbackAnalyticsRepository,  // until API ready
},
{
  provide: AnalyticsRepository,
  useExisting: ANALYTICS_REPOSITORY,
},
```

---

## Error Handling

| Scenario | Repository returns | Use case returns | Panel shows |
|----------|---------------------|------------------|-------------|
| Block not found | `null` | `null` | No open / toast |
| Census missing | `AreaSummary` with `populationAvailable: false` | Same | Metadata + message |
| API timeout | Error observable | `ApplicationError` | Error banner in panel |
| Out-of-scope | — | Blocked in use case before repo call | No panel |

---

## Testing Notes (optional)

- Unit test district sum: 3 blocks with TOT_P 100, 200, 300 → district total 600
- Unit test case-insensitive district match: `CHANGLANG` vs `Changlang`
- Unit test block scope never returns sum of other blocks
