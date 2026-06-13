# Implementation Plan: Project Management — List, Entry & API Submit

**Branch**: `005-project-management` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Project list display + create entry + 5-step wizard; wire GEOAPI §6; retain source-code fields missing from Figma  
**Architecture authority**: [`architecture.md`](../../architecture.md) · [`api.md`](../../api.md) §6

## Summary

Deliver **Epic E-05** MVP focused on **project list on home dashboard**, **create entry points** (Projects **Create +** + side-nav button), and **5-step project wizard** styled per Figma with **all existing form fields preserved**. Production data flows through **`GetGeoProjectList`** and **`InsertUpdateGeoProjectBasicInfo`**; beneficiary/document/media steps remain session-local until upload APIs exist.

**User journey:**

```text
Login (US-01) → Home dashboard (US-02)
  → Projects sidebar loads from GetGeoProjectList (US-05d)
  → Create + or side-nav → /projects wizard step 1 (US-05e)
  → Steps 1–4 (Figma + legacy fields) → Review step 5 → SUBMIT (US-05f)
  → Return /home → refreshed API list + map pin
```

**Technical approach:**

- Add `ProjectApiRepository` mirroring `JurisdictionApiRepository` patterns
- Extend domain `Project` + `ProjectRepository` port; add `project-type.catalog.ts` and `apiCode` on scheme catalog
- `GetProjectListUseCase` + `SubmitProjectBasicInfoUseCase`; refactor `HomeFacade` off `localStorage`/`IProjectData`
- Evolve `insert-update-project` → `ProjectFormFacade` + Figma shell; add API-only fields (jurisdiction IDs, contact, dates, landmark)
- Bind `PROJECT_REPOSITORY` factory: API when `!environment.useLocalData`

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict: true`)  
**Primary Dependencies**: Angular 20.3, RxJS 7.8, Bootstrap 5.3 / SCSS (Figma tokens)  
**Storage**: GEOAPI project endpoints; wizard session in component/facade signals; no `localStorage` for production projects  
**Testing**: Jasmine + Karma (optional per story)  
**Target Platform**: Browser (SSR shell); map picker browser-only  
**Project Type**: Angular SPA feature slice — home sidebar + `/projects` wizard  
**Performance Goals**: Project list visible ≤ 3s (SC-PM-01); search filter ≤ 1s for 50 items  
**Constraints**: Submit sends basic-info only (BR-PM-01); JWT on GEOAPI calls; jurisdiction server-side scope  
**Scale/Scope**: 2 presentation surfaces (home sidebar, project form); 2 API endpoints; ~15 new/modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Jurisdiction | ✅ Pass | List scoped by API; client filter uses names; submit uses applicable state/district/block IDs |
| Clean Architecture | ✅ Pass | `ProjectApiRepository` in Infrastructure; use cases in Application; `ProjectFormFacade` in Presentation |
| Domain model | ✅ Pass | Extended `Project` entity; `ProjectWizardState` VO; mappers DTO → entity |
| Use cases | ✅ Pass | `GetProjectListUseCase`, `SubmitProjectBasicInfoUseCase` |
| API-backed data | ✅ Pass | Replaces `LocalProjectRepository` in production via provider factory |
| Geo-spatial | ✅ Pass | `MapForInsert` retained; list coordinates feed `MapFacade` pins |
| UI | ✅ Pass | Figma shell for wizard; home sidebar extends existing dashboard |
| Stack | ✅ Pass | Angular 20, existing HTTP interceptor, IIS-compatible |
| Performance/NFR | ✅ Pass | Loading/error signals on sidebar; no silent empty list |

**Post-design re-check:** All gates pass. See Complexity Tracking for phased legacy bridge.

## Project Structure

### Documentation (this feature)

```text
specs/005-project-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── project-api.md
│   ├── home-project-sidebar.md
│   └── project-form-wizard.md
├── spec.md
└── checklists/
```

### Source Code (repository root)

```text
src/app/
├── domain/
│   ├── catalog/
│   │   ├── scheme-type.catalog.ts              # EXTEND — apiCode per entry
│   │   └── project-type.catalog.ts           # NEW — GPT_* codes
│   ├── entities/
│   │   └── project.entity.ts                 # EXTEND — API fields
│   ├── value-objects/
│   │   ├── project-wizard-state.vo.ts        # NEW
│   │   └── project-create-context.vo.ts      # NEW
│   ├── repositories/
│   │   └── project.repository.ts             # EXTEND — list + submit
│   └── services/
│       └── project-permission.service.ts     # NEW — canCreateProject
├── application/
│   └── projects/
│       ├── get-project-list.use-case.ts      # NEW
│       ├── submit-project-basic-info.use-case.ts  # NEW
│       └── get-projects-by-jurisdiction.use-case.ts  # REFACTOR
├── infrastructure/
│   ├── http/
│   │   ├── project-api.repository.ts         # NEW
│   │   ├── dto/project.dto.ts                # NEW
│   │   └── mappers/project.mapper.ts       # NEW
│   ├── persistence/
│   │   └── local-project.repository.ts       # KEEP — dev/fallback only
│   └── providers/
│       └── infrastructure.providers.ts       # EXTEND — PROJECT factory
├── presentation/
│   └── features/
│       ├── home/
│       │   ├── home.page.html                # Create +, loading/error states
│       │   ├── home.page.ts                  # Remove dummy init
│       │   ├── home.facade.ts                # API list, ProjectSidebarItem
│       │   └── models/project-sidebar-item.vm.ts  # NEW
│       └── project/                          # NEW (migrate from src/app/project/)
│           ├── project-form.page.ts
│           ├── project-form.facade.ts
│           └── components/…                  # Per contracts/project-form-wizard.md
└── project/insert-update-project/            # Phase A: wire API here first
    ├── insert-update-project.ts              # REFACTOR — submit use case
    └── insert-update-project.html            # Add fields + Figma SCSS
```

**Structure Decision:** Single Angular SPA. Phase A minimizes risk by wiring API into existing `insert-update-project`; Phase B extracts Figma components under `presentation/features/project/`.

## Implementation Roadmap

### Phase A — API list & dashboard (P1) — US-05d, US-05e, US-05c

| # | Task | Layer | Output |
|---|------|-------|--------|
| A1 | Create `project.dto.ts`, `project.mapper.ts`, `ProjectApiRepository` | Infrastructure | GET list + POST submit clients |
| A2 | Extend `Project` entity + `ProjectRepository` port | Domain | `listForUser`, `submitBasicInfo` |
| A3 | `GetProjectListUseCase` | Application | Observable&lt;Project[]&gt; |
| A4 | Refactor `GetProjectsByJurisdictionUseCase` to use A3 | Application | Jurisdiction + selection filter |
| A5 | Update `infrastructure.providers.ts` PROJECT factory | Infrastructure | API when `!useLocalData` |
| A6 | `ProjectSidebarItem` VM + update `HomeFacade` | Presentation | Remove `LocalProjectRepository` branch |
| A7 | `home.page.html` — **Create +**, side-nav create btn, list loading/error | Presentation | US-05e |
| A8 | Remove `initializeDummyData()` from `HomePage` | Presentation | Constitution V |
| A9 | Map pin bridge — `focusProject` with API coordinates | Presentation | US-05d scenario 5 |
| A10 | Client search on API list (existing `searchTerm`) | Presentation | US-05c |

### Phase B — Wizard API submit (P1) — US-05f, US-05

| # | Task | Layer | Output |
|---|------|-------|--------|
| B1 | `project-type.catalog.ts` + scheme `apiCode` | Domain | Code mapping |
| B2 | `ProjectWizardState` + payload builder | Domain | `toBasicInfoPayload()` |
| B3 | `SubmitProjectBasicInfoUseCase` | Application | Calls repository submit |
| B4 | Add form fields: jurisdiction IDs, landmark, contact, dates, assigned | Presentation | API-required fields |
| B5 | Replace `storeToLocalStorage()` with use case on step 5 review | Presentation | SUBMIT only on review |
| B6 | Add step 5 review UI (summary cards + pencil edit) | Presentation | Figma `133:472` |
| B7 | Create context from home → pre-fill jurisdiction | Presentation | US-05e scenario 5 |
| B8 | `projectCreateContext` / edit via `gpbi_id` | Presentation | US-05a foundation |

### Phase C — Figma visual migration (P1–P2) — US-05 steps 1–4

| # | Task | Layer | Output |
|---|------|-------|--------|
| C1 | Extract `project-form-shell` + horizontal stepper | Presentation | Figma shared chrome |
| C2 | Restyle step 1–4 templates (inputs `#f6f6f6`, upload zones) | Presentation | Match nodes 133:35–368 |
| C3 | Keep map picker + project name dropdown + other docs | Presentation | Source parity |
| C4 | Route `/projects` → new page or restyled legacy component | Presentation | Single entry |

### Phase D — Cleanup (P2)

| # | Task | Output |
|---|------|--------|
| D1 | Delete `localStorage` project paths from submit flow | Production-only API |
| D2 | Migrate `insert-update-project` → `presentation/features/project/` | Architecture alignment |
| D3 | Extend `Project` map layer to use numeric id pins | Remove legacy pin matching |

## Complexity Tracking

| Violation / bridge | Why Needed | Simpler Alternative Rejected Because |
|--------------------|------------|-------------------------------------|
| `IProjectData` mapper bridge in Phase A | `MapFacade` still uses legacy pin shape | Big-bang map refactor blocks list MVP |
| Phase A edits `src/app/project/` before move | Working wizard with all fields today | Rewriting UI before API wire duplicates effort |
| Client-side filter after full list fetch | API has no filter params | Server filter unavailable in v1 |
| Session-only steps 2–4 | No upload/beneficiary API | Spec BR-PM-01 explicit scope cut |

## Artifact Index

| Artifact | Path |
|----------|------|
| Research decisions | [research.md](./research.md) |
| Entities & ports | [data-model.md](./data-model.md) |
| GEOAPI contracts | [contracts/project-api.md](./contracts/project-api.md) |
| Home sidebar UI | [contracts/home-project-sidebar.md](./contracts/home-project-sidebar.md) |
| Wizard UI | [contracts/project-form-wizard.md](./contracts/project-form-wizard.md) |
| Manual verification | [quickstart.md](./quickstart.md) |
| API authority | [api.md](../../api.md) §6 |
| User stories | [user-story.md](../../user-story.md) Epic E-05 |

## Next Command

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md` for Phase A → B implementation.
