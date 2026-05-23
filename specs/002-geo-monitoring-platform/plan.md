# Implementation Plan: ProjectGeo Government Monitoring Platform

**Branch**: `002-geo-monitoring-platform` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-geo-monitoring-platform/spec.md`  
**Architecture authority**: [`architecture.md`](../../architecture.md) — all layer structure, naming, and migration decisions follow this document.

## Summary

Revamp ProjectGeo from a flat Angular + Leaflet monolith into a **Clean Architecture** frontend (Domain → Application → Infrastructure → Presentation) that delivers 24 user-story journeys (US-01–US-07b) for government geo-spatial project monitoring in Arunachal Pradesh.

**Technical approach (from `architecture.md`):**

- Refactor `src/app/services/*` and monolithic `map/map.ts` into layer-first modules with facades, use cases, repository ports, and a `LeafletMapAdapter`.
- Integrate GEOAPI for auth and jurisdiction (`api.md` §1.2); keep `environment.useLocalData` for projects/analytics until pending endpoints ship.
- Preserve Angular 20 zoneless CD, SSR shell, browser-only map/geo, Bootstrap 5 UI, IIS deployment via `web.config`.

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict: true`)  
**Primary Dependencies**: Angular 20.3, Leaflet 1.9.4, Bootstrap 5.3, RxJS 7.8, Font Awesome 7  
**Storage**: GEOAPI REST backend + `sessionStorage` for JWT/session; static GeoJSON at `src/assets/geojson/`; `localStorage` demo data **dev-only** via `environment.useLocalData`  
**Testing**: Jasmine + Karma (per `architecture.md` §9 — optional per story, not plan gate)  
**Target Platform**: Browser (Chrome, Edge, Firefox); SSR shell only; production on IIS  
**Project Type**: Angular SPA with optional SSR  
**Performance Goals**: Map load ≤ 5s (NFR-01); sidebar search ≤ 1s client-side; cluster markers when > 50 pins  
**Constraints**: Browser-only Leaflet/GeoJSON (`isPlatformBrowser`); no credentials in client; HTTPS in production; file size limits per architecture §7.4  
**Scale/Scope**: 24 user stories, 7 epics, 4 admin roles, initial state AP; ~40 existing source files → target structure in architecture §4

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Jurisdiction | ✅ Pass | `Jurisdiction` VO + `JurisdictionFilterService` + use-case checks; GEOAPI scope endpoints |
| Clean Architecture | ✅ Pass | Target folders §4; layer prohibitions §3.2; migration map §4.2 |
| Domain model | ✅ Pass | Class entities/VOs in `data-model.md`; repos return domain types |
| Use cases | ✅ Pass | One `execute()` per workflow; mapped in Phase roadmap |
| API-backed data | ✅ Pass | `AuthApiRepository`, jurisdiction HTTP repos; local repos behind env flag only |
| Geo-spatial | ✅ Pass | `MapAdapter` in Infrastructure; SSR guards; GeoJSON repo |
| UI | ✅ Pass | Figma alignment US-07; existing brand preserved |
| Stack | ✅ Pass | Angular 20, Leaflet 1.9, Bootstrap 5, IIS — matches constitution |
| Performance/NFR | ✅ Pass | Lazy GeoJSON, marker clustering, lazy `/projects` route |

**Post-design re-check:** All gates pass. No constitution violations requiring Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/002-geo-monitoring-platform/
├── plan.md              # This file
├── research.md            # Phase 0 — architecture decisions
├── data-model.md          # Phase 1 — domain entities & VOs
├── quickstart.md          # Phase 1 — dev setup & verification
├── contracts/             # Phase 1 — GEOAPI & pending contracts
│   ├── auth-api.md
│   ├── jurisdiction-api.md
│   └── pending-apis.md
├── spec.md
├── checklists/
└── tasks.md               # Phase 2 — /speckit-tasks (not created here)
```

### Source Code (repository root)

Target layout per **`architecture.md` §4** (replacing current flat structure):

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/auth.guard.ts
│   │   ├── interceptors/auth.interceptor.ts
│   │   └── providers/infrastructure.providers.ts
│   ├── domain/                    # Pure TS — no Angular imports
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/          # Ports (abstract classes)
│   │   ├── services/
│   │   └── errors/
│   ├── application/               # Use cases
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── geo/
│   │   ├── analytics/
│   │   └── mappers/
│   ├── infrastructure/            # Adapters
│   │   ├── http/
│   │   ├── geo/
│   │   ├── persistence/
│   │   └── tokens/
│   ├── presentation/              # UI feature slices
│   │   ├── shared/
│   │   ├── features/login|home|map|project/
│   │   └── state/
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.ts
├── assets/geojson/
│   └── ARUNACHAL_PRADESH_BLOCK.geojson
└── styles/
```

**Structure Decision**: Single Angular SPA with Clean Architecture layers inside `src/app/`. Path aliases `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@core/*` per architecture §4.1. Legacy files migrate per §4.2 migration map.

### Current → Target Migration (architecture §4.2)

| Current | Target |
|---------|--------|
| `services/auth/auth.ts` | `domain/entities/user.entity.ts` + `application/auth/*` + `infrastructure/http/auth-api.repository.ts` + `infrastructure/persistence/session-storage.repository.ts` |
| `services/project/project.ts` | `application/projects/*` + `infrastructure/http/project-api.repository.ts` |
| `data/dummy-project-data.ts` | `infrastructure/persistence/local-project.repository.ts` |
| `map/map.ts` (~2400 lines) | `presentation/features/map/*` + `infrastructure/geo/leaflet-map.adapter.ts` + `MapFacade` |
| `map-selection.service.ts` | `presentation/state/map-selection.store.ts` |
| `shared/pie-chart/` | `presentation/shared/components/pie-chart/` |
| `theme.service.ts` | `presentation/shared/` or `core/` |
| `login/`, `home/`, `header/` | `presentation/features/login/`, `home/`, `shared/layout/header/` |

## Implementation Roadmap

Aligned with **`architecture.md` §13** (A1–A8) and **`user-story.md` §8** sprints, mapped to user stories:

### Phase A1 — Foundation (Sprint 1 partial)

**Deliverables:** Folder structure, path aliases, `infrastructure.providers.ts`, error types, `AuthGuard`, `AuthInterceptor`

| Story | Layer work |
|-------|------------|
| US-06 (partial) | Core providers, env config, API client |

### Phase A2 — Domain Layer (Sprint 1)

**Deliverables:** `User`, `Project`, `GeoBoundary`, `AreaAnalytics` entities; `Coordinates`, `Jurisdiction`, `Money`, `UserRole` VOs; `DomainError`

| Story | Domain rules |
|-------|--------------|
| US-01, US-02* | `Jurisdiction.includesDistrict/Block`, `User.canAccess*` |
| US-05, US-05a | `Project.isWithin`, validation service |

### Phase A3 — Repository Ports + Local Adapters (Sprint 1–2)

**Deliverables:** Abstract repos + `LocalProjectRepository`, `SessionStorageRepository`, `GeoJsonFileRepository`

| Story | Adapters |
|-------|----------|
| US-06 | Wrap existing dummy data behind ports |
| US-03a | Block GeoJSON from `assets/geojson/` |

### Phase A4 — Auth Use Cases + GEOAPI (Sprint 1)

**Deliverables:** `LoginUseCase`, `LogoutUseCase`, `GetCurrentUserUseCase`, `AuthApiRepository`, `LoginPresenter`

| Story | Coverage |
|-------|----------|
| US-01, US-01a, US-01b | Full auth journey |
| US-02c | `GetApplicableState/District/Block` use cases |

**Flow (architecture §8.1):** LoginPage → LoginUseCase → AuthRepository → SessionStorageRepository → navigate `/home`

### Phase A5 — Dashboard & Map Facades (Sprint 2)

**Deliverables:** `HomeFacade`, `MapFacade`, thin pages; role-scoped viewport

| Story | Coverage |
|-------|----------|
| US-02, US-02a, US-02b, US-02c | Dashboard + cascading filters |
| US-03, US-03b | Pins, detail panel, sidebar sync |

### Phase A6 — LeafletMapAdapter Split (Sprint 2)

**Deliverables:** Extract adapter from `map.ts`; `AreaSummaryPanelComponent`, `ProjectDetailPanelComponent`

| Story | Coverage |
|-------|----------|
| US-03, US-03a, US-03c | Boundaries, layers, base map switcher |
| US-04, US-04a, US-04b | Summary panel wiring |

**Flow (architecture §8.3):** MapPage → MapFacade → GetAreaSummaryUseCase → AnalyticsRepository

### Phase A7 — Projects + Pending API Swap (Sprint 3–4)

**Deliverables:** Project use cases, form facade, `ProjectApiRepository` when `api.md` §1.3 ready

| Story | Coverage |
|-------|----------|
| US-05, US-05a, US-05b | CRUD + uploads |
| US-05c | Sidebar search |

### Phase A8 — Production & Polish (Sprint 5)

**Deliverables:** Remove legacy god services; production env; error/loading states; IIS verify

| Story | Coverage |
|-------|----------|
| US-06, US-06a, US-06b | Full API migration, deployment |
| US-07, US-07a, US-07b | Figma pass, nav, responsive |

## Authorization Model (architecture §8.2)

| Check | Layer | Artifact |
|-------|-------|----------|
| Route access | Core/Presentation | `AuthGuard` on `/home`, `/projects`, `/map` |
| Action permission | Application | Use case before create/update/delete |
| Data scope | Domain | `Jurisdiction` + `JurisdictionFilterService` |
| API enforcement | Backend | Frontend checks are UX only |

## Complexity Tracking

> No constitution violations. Clean Architecture layering is required by constitution and `architecture.md`; not optional complexity.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Generated Artifacts

| Artifact | Path | Phase |
|----------|------|-------|
| Research | [research.md](./research.md) | 0 |
| Data model | [data-model.md](./data-model.md) | 1 |
| Auth contracts | [contracts/auth-api.md](./contracts/auth-api.md) | 1 |
| Jurisdiction contracts | [contracts/jurisdiction-api.md](./contracts/jurisdiction-api.md) | 1 |
| Pending contracts | [contracts/pending-apis.md](./contracts/pending-apis.md) | 1 |
| Quickstart | [quickstart.md](./quickstart.md) | 1 |

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md` from this plan and `spec.md` user-story journeys.
