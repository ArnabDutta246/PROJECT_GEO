# Research: ProjectGeo Geo-Monitoring Platform

**Feature**: `002-geo-monitoring-platform`  
**Date**: 2026-05-23  
**Authority**: [`architecture.md`](../../architecture.md), [`api.md`](../../api.md)

---

## R-01: Clean Architecture Layer Boundaries

**Decision:** Adopt four layers (Domain, Application, Infrastructure, Presentation) with inward dependency direction per architecture §3.

**Rationale:** Constitution Principle II and ADR-01 require separation of gov business rules from Leaflet/GEOAPI. Enables swapping local demo data for production APIs without UI rewrites.

**Alternatives considered:**
- **Flat services (current):** Rejected — `map.ts` monolith, role logic in templates, untestable jurisdiction rules.
- **Feature-only folders without domain:** Rejected — business rules would remain coupled to Angular.

---

## R-02: Repository Port Return Type

**Decision:** Repository abstract classes in Domain MAY return `Observable<T>`; entity/VO files MUST NOT import RxJS (architecture §5.1.3 note).

**Rationale:** Angular ecosystem consistency; use cases already use RxJS in Application layer.

**Alternatives considered:**
- **Promise-only ports:** Valid for pure domain but adds wrapping overhead in every use case.

---

## R-03: Authentication & Session Storage

**Decision:** JWT stored in `sessionStorage` via `SessionStorageRepository`; `AuthInterceptor` attaches `Authorization: Bearer <token>` on all protected requests.

**Rationale:** architecture §8.1, §11; `api.md` §2.2. Prefer httpOnly cookie when backend supports — not available yet.

**Alternatives considered:**
- **localStorage for token:** Rejected for production — broader XSS exposure.

**Login mapping rules (`api.md` §3.1):**
- Authoritative role from `usp_group_code`, not JWT `role` claim
- Discard `usp_pswd` immediately
- Block login when `usp_active_yn !== 'Y'`
- Inspect body `success`/`statusCode`, not HTTP status alone (EC-01)

---

## R-04: RBAC Group Codes

**Decision:** Map `usp_group_code` → `UserRole` enum:

| Code | Role | Status |
|------|------|--------|
| `SM` | StateManager | Confirmed |
| `DM` | DistrictManager | Planned — confirm with backend |
| `BM` | BlockManager | Planned — confirm with backend |
| `AD` | Admin | Planned — confirm with backend |

**Rationale:** Jurisdiction scope comes from GetUserApplicable* endpoints, not login payload alone.

**State Manager project permissions:** View-only for create/edit (spec assumption from user-story §5).

---

## R-05: Jurisdiction Dropdown Services

**Decision:** Cascading filters call GEOAPI GetUserApplicableState → District → Block with `userId` and ID params (`0` = all applicable).

**Rationale:** US-02c acceptance scenarios; `api.md` §4.

**Empty results:** HTTP 200 + empty array + `"No Records found!"` — disable child dropdown, no crash (EC-02).

**Auth header on GET jurisdiction:** Send Bearer token on all authenticated requests until backend confirms otherwise (`api.md` §1.2 footnote).

---

## R-06: Data Source Strategy (Local vs API)

**Decision:** `environment.useLocalData` toggles Infrastructure bindings in `infrastructure.providers.ts`:

| Repository | Production | Development |
|------------|------------|-------------|
| Auth | `AuthApiRepository` | `AuthApiRepository` |
| Jurisdiction | HTTP repos | HTTP repos |
| Projects | `ProjectApiRepository` | `LocalProjectRepository` (until API ready) |
| Analytics | `AnalyticsApiRepository` | Census GeoJSON fallback + stub |
| Geo boundaries | `GeoJsonFileRepository` | Same (API geo pending) |

**Rationale:** ADR-06, constitution Principle V; SC-006 requires no localStorage for production operational data.

---

## R-07: Leaflet Integration Pattern

**Decision:** Wrap Leaflet in `MapAdapter` abstract class + `LeafletMapAdapter` implementation in Infrastructure. Presentation uses `MapFacade` only.

**Rationale:** ADR-05, constitution Principle VI; enables SSR safety and file-size split of `map.ts`.

**Runtime:** Initialize in `ngAfterViewInit` with `isPlatformBrowser` guard; zoneless CD uses signals in facades, `ChangeDetectorRef` only at Leaflet bridge if needed.

---

## R-08: GeoJSON & Performance

**Decision:**
- Block layer: `src/assets/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` (authoritative, census attrs)
- Lazy-load block features per selected district
- Case-insensitive name matching between API dropdowns and boundary properties (EC-04)
- Marker clustering when > 50 pins in viewport

**Rationale:** FR-MAP-10, FR-MAP-11, architecture §10.

---

## R-09: Area Analytics Data Sources

**Decision:** Primary: Analytics API (pending). Fallback: census fields from block GeoJSON (`TOT_P`, `TOT_M`, `TOT_F`, `P_SC`, `P_ST`) for gender/caste charts when API unavailable (US-04a, EC-09).

**Rationale:** FR-ANLY-09; water/soil schemas pending (`requirement.md` Q-02, Q-03) — render empty states, not broken charts.

---

## R-10: Presentation Patterns

**Decision:** Facades per feature page; ViewModels for display formatting; no business filtering in templates.

**Rationale:** ADR-04, architecture §5.4, constitution Principle IV.

**Naming:** `.page.ts`, `.facade.ts`, `.view-model.ts`, `.presenter.ts` per architecture §7.3.

---

## R-11: Error Handling

**Decision:** Three-tier errors — `DomainError`, `ApplicationError`, HTTP mapping in Infrastructure; Presentation shows user-friendly messages (US-06a).

**Rationale:** architecture §7.5.

---

## R-12: Deployment

**Decision:** Production build to `dist/ProjectGeo/browser` + `web.config` SPA rewrite on IIS; HTTPS for all GEOAPI calls.

**Rationale:** architecture §12, US-06b, NFR-07.

---

## R-13: Pending API Endpoints

**Decision:** Define stub contracts in `contracts/pending-apis.md`; implement Infrastructure adapters when backend delivers. Until then, local repos + GeoJSON satisfy MVP user journeys.

**Rationale:** `api.md` §1.3 — Projects, Analytics, File upload, Logout pending.

**All NEEDS CLARIFICATION items resolved** — no open technical unknowns block Phase 1 design.
