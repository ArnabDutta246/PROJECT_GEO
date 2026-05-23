# Contract: Projects for Map Pins

**Feature**: `003-interactive-map-pins`  
**Stories:** US-03 (pins), partial US-02 (sidebar list)  
**Use case:** `GetMappableProjectsUseCase`  
**Repository:** `ProjectRepository` (existing port)

---

## Input

```typescript
interface GetMappableProjectsInput {
  user: User;
  districtName?: string | null;   // From MapSelectionStore
  blockName?: string | null;       // From MapSelectionStore
}
```

---

## Output

```typescript
interface GetMappableProjectsResult {
  pins: ProjectPin[];              // Only projects with valid coordinates
  skipped: SkippedProject[];       // In-scope but not mappable (optional, dev logging)
}

interface SkippedProject {
  id: string;
  reason: 'invalid_coordinates' | 'missing_coordinates';
}
```

---

## Filtering Rules (Application layer)

1. **Jurisdiction:** `project.isWithin(user.jurisdiction)` — MUST NOT rely on UI-only checks
2. **Geographic filter:** If `districtName` set, match `project.jurisdiction.districts[0]` (case-insensitive)
3. **Geographic filter:** If `blockName` set, match `project.jurisdiction.blocks[0]` (case-insensitive)
4. **Coordinates:** `Coordinates.create(lat, lng)` must succeed — exclude otherwise
5. **Auth guard:** Return empty array if `user` is null (BR-05)

---

## Current Adapter (Development)

**Class:** `LocalProjectRepository`  
**Toggle:** `environment.useLocalData: true`  
**Source:** `src/app/data/dummy-project-data.ts` (wrapped behind port)

**Legacy mapping** (via `HomeFacade.mapDomainProjects`):

| Legacy field | ProjectPin field |
|--------------|------------------|
| `projectName` | `projectName` |
| `activityName` | `activityName` |
| `schemeType` | `schemeType` |
| `locationName` | `locationName` |
| `latitude`, `longitude` | `coordinates` |
| `districtName` | `districtName` |
| `mouzaName` | `blockName` |

---

## Target Adapter (Production — Pending)

**Class:** `ProjectApiRepository`  
**Endpoint:** `GET /projects` (server-filtered by user jurisdiction)  
**Status:** Pending — see `specs/002-geo-monitoring-platform/contracts/pending-apis.md`

When API ships:
1. Implement DTO → `Project` mapper
2. Set `environment.useLocalData: false`
3. Verify pin scope rules unchanged (server MUST enforce jurisdiction)

---

## Summary Panel Data Contract

When pin clicked or sidebar project selected, `MapFacade` loads summary from `ProjectPin` (no additional API call for MVP):

| Field | Required | Display |
|-------|----------|---------|
| projectName | Yes | Panel title |
| schemeType | Yes | Badge/label |
| locationName | Yes | Address row (or "Location unavailable") |
| districtName | Yes | Metadata row |
| blockName | Yes | Metadata row (UI label: "Block") |
| coordinates | Yes | Optional lat/lng display |

Full tabbed detail (beneficiaries, docs, media) — **US-03b**, requires `GET /projects/:id`.

---

## Performance Contract

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pin render after project load | ≤ 3s | SC-001 |
| Summary panel open | ≤ 2s | SC-003 |
| Sidebar → map focus | ≤ 1s | SC-005 |

---

## Error Contract

| HTTP / Error | Presentation message |
|--------------|------------------------|
| Network failure | "Unable to load projects. Please try again." |
| 401 | Redirect to login (AuthGuard) |
| Empty result | "No projects with map locations in this area." |

Map base layer and block GeoJSON remain functional when project load fails.
