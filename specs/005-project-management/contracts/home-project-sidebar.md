# Contract: Home Project Sidebar & Create Entry

**Feature**: `005-project-management`  
**Stories:** US-05d, US-05e, US-05c (search)  
**Presentation:** `presentation/features/home/`

---

## Layout — Projects section (`home.page.html`)

### Section header

```text
[Search input                    ]
Projects                    [Create +] [filter icon]
```

| Element | Behavior |
|---------|----------|
| `Projects` label | Existing `sidebar-section-header` |
| `Create +` | New underlined link/button; `routerLink` or click → `/projects` with create context |
| Filter icon | Existing; no change v1 |

### Project list rows

| Column | Binding | Source |
|--------|---------|--------|
| Icon | `schemeColor` + `schemeIcon` | `scheme-type.catalog` via `gpbi_project_scheme_type_name` |
| Title | `project.projectName` | API |
| Subtitle | `project.locationName` | API |

**Selection:** Click row → `HomeFacade.selectProject(project)` → map pin focus.

**Empty states:**
- Loading: spinner/skeleton in list area
- Error: message + retry
- No data: "No projects match your filters."

---

## Side navigation rail — create entry

| Element | Spec |
|---------|------|
| Position | Left `nav-rail`, new button between existing items or after analytics |
| Icon | `add` or `create_new_folder` Material icon |
| Label | Optional tooltip "New project" |
| Action | Same navigation as **Create +** |
| Visibility | `canCreateProject(user)` — District/Block Manager (+ Admin) |

---

## Data flow

```text
HomePage.ngOnInit
  → HomeFacade.initialize()
    → GetProjectListUseCase (via GetProjectsByJurisdictionUseCase)
      → ProjectApiRepository.getGeoProjectList
  → facade.projects signal → template @for

Filter change (state/district/block/scheme)
  → client-side filter on loaded list (no refetch v1)

Search (P2)
  → home.page filteredProjects getter on facade.projects()
```

---

## Remove legacy paths

| Remove | Replacement |
|--------|-------------|
| `projectService.initializeDummyData()` | API list on init |
| `facade.projects` as `IProjectData[]` | `ProjectSidebarItem[]` |
| `instanceof LocalProjectRepository` branch | Always use repository port |

---

## Map integration

`selectProject` must pass numeric id + coordinates:

```typescript
mapFacade.focusProject({
  id: project.id,
  activityName: project.projectName,
  locationName: project.locationName,
  latitude: project.coordinates.latitude,
  longitude: project.coordinates.longitude,
  schemeType: project.schemeTypeName,
});
```

Extend `MapFacade.focusLegacyProject` or add `focusProject` accepting domain-shaped pin.

---

## Navigation to create

```typescript
sessionStorage.setItem('projectCreateContext', JSON.stringify({
  mode: 'create',
  stateId: facade.selectedStateId(),
  districtId: facade.selectedDistrictId(),
  blockId: facade.selectedBlockId(),
}));
router.navigate(['/projects']);
```

Wizard reads context on init and pre-fills jurisdiction dropdowns.
