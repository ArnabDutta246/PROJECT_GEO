# Quickstart: Area Summary on Geographic Click (US-04)

**Feature**: `004-area-summary-geo-click`  
**Branch**: `004-area-summary-geo-click`  
**Plan**: [plan.md](./plan.md) | **GeoJSON**: [`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`](../../src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson)

**UX:** Selected area appears as a **card in Regional Statistics** (left sidebar) — not a map overlay.

---

## Prerequisites

- Node.js 20+
- npm
- Git on branch `004-area-summary-geo-click`
- Completed dependencies:
  - **US-01** — auth + session
  - **US-02c** — geographic filters on home dashboard
  - **US-03** — interactive map with project pins (`MapFacade`, `HomeMapComponent`)
  - **US-03a** (partial) — block boundary layer visible; district layer optional for district-click scenarios

---

## Install & Run

```powershell
cd d:\PROJECTS\AD\PROJECT_GEO_NEW\ProjectGeo
npm install
npm start
```

App: `http://localhost:4200`

---

## User Journey Walkthrough

```text
1. Login as State Manager (or District/Block Manager)
2. Navigate to /home — map loads with block boundaries + project pins
3. Click a block polygon on the map
4. Regional Statistics sidebar (left) shows selected-area card:
   - State, District, Block names
   - Total population (from TOT_P census field)
5. Click clear (×) on card — placeholder returns; map unchanged
6. Click a project pin — project summary opens on map; area card stays in sidebar
```

---

## Manual Verification — US-04 Acceptance Scenarios

### Scenario 1: Block click updates Regional Statistics card

1. Log in and open `/home`
2. Wait for block layer to render (blue polygons)
3. Click any block polygon
4. **Expect:** Selected-area card appears at top of Regional Statistics within ~2 seconds
5. **Expect:** State, District, Block names and total population shown

### Scenario 2: Clear preserves map state

1. Zoom/pan map; set district filter if desired
2. Click block to show card
3. Click clear (×) on card
4. **Expect:** Placeholder text returns; zoom, center, filters, pins unchanged

### Scenario 3: Block scope — not statewide aggregate

1. Note population for Block A
2. Select Block A on map
3. **Expect:** Population matches block `TOT_P`, not state total

### Scenario 4: District scope (when US-03a district handler wired)

1. Click district boundary
2. **Expect:** Block row hidden; population = sum of blocks in district

### Scenario 5: Population unavailable

1. Mock repository returning `populationAvailable: false`
2. **Expect:** Geography metadata visible; population shows unavailable message

### Scenario 6: Sidebar card + project panel coexist

1. Click block → area card visible in sidebar
2. Click project pin → project panel on map
3. **Expect:** Both visible; area card retains geographic selection

---

## Key Files

| File | Purpose |
|------|---------|
| `application/analytics/get-area-summary.use-case.ts` | Orchestration + jurisdiction |
| `infrastructure/analytics/census-fallback-analytics.repository.ts` | TOT_P fallback |
| `presentation/features/map/map.facade.ts` | Geographic click handlers + signals |
| `presentation/features/home/components/area-summary-card.component.ts` | Sidebar card UI |
| `presentation/features/home/home.page.html` | Regional Statistics wiring |

---

## Next Steps

- **US-04a** — replace placeholder chart sections below the card with live gender/caste charts
- **US-04b** — water/soil report sections in Regional Statistics
