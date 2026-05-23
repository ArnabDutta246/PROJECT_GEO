<!--
Sync Impact Report
- Version change: (template placeholders) → 1.0.0
- Modified principles: N/A (initial ratification from requirement.md + architecture.md)
- Added sections:
  - Core Principles (8 principles)
  - Technology Stack & Constraints
  - Layer Architecture & Coding Standards
  - Governance
- Removed sections: Template placeholder principles (Library-First, CLI, Test-First, Integration Testing)
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gates aligned)
  - ✅ .specify/templates/spec-template.md (reference alignment note — no mandatory testing)
  - ⚠ .specify/templates/tasks-template.md (already marks tests optional; no change required)
- Follow-up TODOs: None
-->

# ProjectGeo Constitution

## Core Principles

### I. Role-Based Jurisdiction (NON-NEGOTIABLE)

All features MUST enforce the three-tier administrative hierarchy — State Manager,
District Manager, and Block Manager — plus Admin. Users MUST only see and act on
projects and geographic areas within their assigned jurisdiction. Route guards,
use cases, and domain services MUST apply jurisdiction rules; backend APIs MUST
enforce the same scope server-side. Frontend checks are UX only and MUST NOT be
the sole access control.

**Rationale:** ProjectGeo is a government monitoring platform; cross-jurisdiction
data leaks violate the product's primary trust requirement (NFR-04, SC-02).

### II. Clean Architecture & Dependency Direction

The frontend MUST follow Clean Architecture with four layers: Domain, Application,
Infrastructure, and Presentation. Dependencies MUST point inward. Domain MUST NOT
import Angular, Leaflet, RxJS, DOM, or HTTP. Presentation MUST NOT call
`HttpClient` directly or embed business rules. Use cases orchestrate workflows;
repository interfaces live in Domain; concrete adapters live in Infrastructure.

**Rationale:** Enables migration from dummy/local data to production APIs without
rewriting UI or business rules (architecture.md ADR-01).

### III. Class-Based Domain Model

Business concepts MUST be expressed as class-based entities and value objects
(`User`, `Project`, `Coordinates`, `Jurisdiction`, etc.) with encapsulated
invariants. Repository ports MUST return domain entities, not raw DTOs. One public
class per file; file names use kebab-case matching the class name.

**Rationale:** Aligns domain logic with government business rules and keeps
validation out of templates and services (architecture.md ADR-02).

### IV. Use-Case Orchestration

Each application workflow MUST be a single injectable use-case class with one
public `execute` method. Pages and components MUST delegate business work to
facades/presenters that call use cases — not to god services or inline template
logic. Role and jurisdiction filtering MUST NOT be duplicated in templates.

**Rationale:** Single-responsibility workflows; supports zoneless change detection
via facades (architecture.md ADR-03, ADR-04).

### V. API-Backed Production Data

Production features MUST consume REST APIs for authentication, projects,
geography, analytics, and file uploads. `localStorage` and dummy datasets MUST
NOT back production data paths. All API requests MUST include auth tokens;
errors MUST surface user-friendly messages with loading indicators. Endpoint
contracts MUST be documented in `api.md`.

**Rationale:** Multi-user safety and production readiness are explicit revamp
goals (FR-API-01 through FR-API-06, SC-06).

### VI. Geo-Spatial First (Leaflet + GeoJSON)

The interactive Leaflet map is the primary geographic view. The system MUST render
state, district, and block GeoJSON boundaries; plot in-scope project pins; sync
map state with dashboard dropdowns; and show area summary analytics on geographic
selection. Leaflet and GeoJSON parsing MUST run only in the browser
(`isPlatformBrowser` guard). Leaflet MUST be wrapped behind a `MapAdapter` in
Infrastructure — Presentation MUST NOT import Leaflet except inside the adapter.

**Rationale:** Map-centric monitoring is the product core (FR-MAP-01 through
FR-MAP-11, architecture.md ADR-05).

### VII. Figma-Aligned Government UI

UI implementation MUST align with shared Figma designs for login, dashboard, map
views, project forms, and summary panels. Preserve established branding patterns
(Orbitron title, dark navbar, project cards, draggable panels, 5-step stepper)
while adopting Bootstrap 5, theme variables, and responsive desktop/tablet layout.
Standardize "Block" terminology in UI labels while preserving backend field
compatibility for mouza/block fields.

**Rationale:** Design parity is a success criterion (SC-07, FR-NAV-03).

### VIII. SOLID & Simplicity

SOLID principles MUST guide every layer. Prefer dependency injection bindings in
`infrastructure.providers.ts` to swap implementations (e.g., local vs API repos)
without changing use cases. Split monolithic components (notably legacy `map.ts`)
when file-size guidelines are exceeded. Prefer Angular signals and zoneless change
detection for new UI state.

**Rationale:** Maintainable government-grade frontend that evolves without
framework migration (architecture.md §6, ADR-06, ADR-07).

## Technology Stack & Constraints

The stack is fixed unless amended via this constitution:

| Layer | Technology |
|-------|------------|
| Framework | Angular 20 (standalone components, zoneless CD) |
| Language | TypeScript 5.9 (`strict: true`) |
| Maps | Leaflet.js 1.9 |
| UI | Bootstrap 5, Font Awesome 7, SCSS themes |
| Charts | SVG pie (existing); extend for bar/line analytics |
| SSR | Angular SSR — map/chart/geo logic browser-only |
| Deployment | IIS via `web.config` SPA routing |

**Non-functional requirements (mandatory):**

- Map initial load ≤ 5 seconds on standard government network (NFR-01)
- HTTPS in production; no credentials in client code (NFR-03)
- Role isolation enforced on backend, not client-only (NFR-04)
- Form accessibility: labels, keyboard nav, sufficient contrast (NFR-05)
- Target browsers: latest Chrome, Edge, Firefox (NFR-06)
- Support multiple states via configurable geo datasets (NFR-09)
- Backend audit logging for project create/update/delete (NFR-10)

**Initial geography:** Arunachal Pradesh (`ARUNACHAL_PRADESH_BLOCK.geojson` as
authoritative block layer with census attributes).

**Out of scope for v1:** Mobile-native apps, offline maps, real-time collaboration,
SMS/email notifications, multi-state tenant admin UI, advanced GIS editing beyond
AOI upload, payment tracking (requirement.md §9).

## Layer Architecture & Coding Standards

### Target folder structure

```
src/app/
├── core/           # guards, interceptors, infrastructure providers
├── domain/         # entities, value objects, repository interfaces, domain services
├── application/    # use cases, mappers
├── infrastructure/ # HTTP repos, GeoJSON, Leaflet adapter, session storage
└── presentation/   # pages, facades, shared components, feature slices
```

Recommended path aliases: `@domain/*`, `@application/*`, `@infrastructure/*`,
`@presentation/*`, `@core/*`.

### Layer prohibitions

| Layer | MUST NOT |
|-------|----------|
| Domain | Import `@angular/*`, Leaflet, RxJS in entity/VO files, DOM, HTTP |
| Application | Import Leaflet, Bootstrap, component templates |
| Infrastructure | Contain UI formatting or route logic |
| Presentation | Call `HttpClient` directly; filter projects by role inline |

### Presentation patterns

- Pages (`.page.ts`) are route entry points with minimal logic
- Facades/presenters call use cases and expose signals to templates
- View models format display data; domain validation stays in Domain/Application
- Routes: `/login`, `/home`, `/projects`, `/map` with `AuthGuard` on protected routes

### Error handling

- `DomainError` — invalid invariants
- `ApplicationError` — not found, unauthorized, validation aggregation
- Infrastructure maps HTTP status to application errors
- Presentation shows user-friendly messages

### Performance

- Lazy-load large GeoJSON per district where possible; simplify geometries as needed
- Cluster map markers when > 50 pins in viewport
- Lazy-load heavy routes (e.g., project form)

## Governance

This constitution supersedes ad-hoc implementation choices for the ProjectGeo
revamp. All feature specs, plans, and tasks MUST comply with these principles.

**Amendment procedure:**

1. Propose change with rationale tied to `requirement.md` or `architecture.md`
2. Classify version bump: MAJOR (principle removal/redefinition), MINOR (new
   principle or material expansion), PATCH (clarifications only)
3. Update `.specify/memory/constitution.md` with Sync Impact Report comment
4. Propagate aligned changes to `.specify/templates/*` and related docs
5. Record `LAST_AMENDED_DATE` in ISO format

**Compliance review:** Implementation plans MUST include a Constitution Check
gate before design and after design phases. Violations require documented
justification in the plan's Complexity Tracking table.

**Source documents:** `requirement.md` (functional/non-functional requirements),
`architecture.md` (structure, SOLID, coding standards), `api.md` (API contracts,
when available).

**Version**: 1.0.0 | **Ratified**: 2026-05-23 | **Last Amended**: 2026-05-23
