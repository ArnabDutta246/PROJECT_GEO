# Contract: Project Form Wizard (5 steps)

**Feature**: `005-project-management`  
**Stories:** US-05, US-05f, US-05a  
**Figma:** nodes `133:35`, `133:153`, `133:261`, `133:368`, `133:472`  
**Legacy source:** `src/app/project/insert-update-project/`

---

## Shell layout (all steps)

Migrate from Bootstrap column stepper to Figma shell:

| Region | Figma spec | Implementation |
|--------|------------|----------------|
| Left rail | 64px `#5141e0` | Shared `project-form-shell` component |
| Top bar | Title + settings/bell/avatar | Reuse or extract from home patterns |
| Step band | Grey `#f8f8f8`, title + horizontal stepper 1–5 | `project-stepper.component` |
| Content | White, 30px padding | Per-step template |
| Footer actions | Right-aligned button group | Per-step config |

**Route:** `/projects` — `canActivate: [authGuard]`

**Facade:** `ProjectFormFacade` orchestrates steps; page stays thin.

---

## Step definitions

### Step 1 — Activity & Location (`133:35` + source extensions)

**Figma fields (required styling):**
- Project Name *
- Name of Activity / Scheme
- Scheme Type (dropdown)
- Mouza / Village / Location Name
- Latitude / Longitude
- Upload AOI (dashed zone)

**Keep from source (not in Figma):**
- Project Name **dropdown** with `MISC. (Create new)` + text input (retain UX; apply Figma input styling)
- `MapForInsert` map picker below coordinates
- **Jurisdiction row:** State, District, Block dropdowns (cascading; from `GetApplicable*` use cases)
- **Contact & schedule subsection:**
  - Nearest landmark
  - Contact name, phone, email (default from user profile)
  - Assigned engineer (user id)
  - Planned/actual start/end dates
- AOI accepts `.kml` (source); show file previews (source behavior)

**Actions:** RESET, GO TO NEXT STEP (no submit)

---

### Step 2 — Beneficiaries (`133:153`)

**Fields (unchanged from source):**
- Name of Beneficiary / Beneficiaries *
- Estimated Cost
- Final Cost
- Beneficiaries Details (textarea)

**Actions:** GO BACK, RESET, GO TO NEXT STEP

**Persistence:** Session only v1

---

### Step 3 — Documentation (`133:261` + source)

**Figma fields:**
- Fund Type * (dropdown in Figma; source uses text — **upgrade to dropdown** with common fund types + free text option)
- Upload zones: Beneficiaries Document, Plan & Estimation, Tender Details

**Keep from source:**
- **Other Documents** upload column (4th card)
- File preview thumbnails

**Actions:** GO BACK, RESET, GO TO NEXT STEP

---

### Step 4 — Photo & Video (`133:368`)

**Figma:** Full-width upload — Activity Photography & Videography Documentation

**Keep from source:** Multi-file media preview, video/image types

**Actions:** GO BACK, RESET, **GO FOR REVIEW** (not "next step")

---

### Step 5 — Review (`133:472`)

**Sections:**
1. PROJECT DETAILS — step 1 summary + pencil → step 1
2. BENEFICIARIES DETAILS — step 2 + pencil → step 2
3. DOCUMENTATION DETAILS — step 3 + pencil → step 3
4. *(Optional v1)* MEDIA — step 4 file names

**Actions:** GO BACK, RESET, **SUBMIT** (green `#07a456`)

**Submit behavior:**
- `SubmitProjectBasicInfoUseCase.execute(wizardState)`
- On success: toast/alert with API message → `router.navigate(['/home'])`
- On failure: show API `message`, stay on step 5

**Remove from legacy:** Per-step green "Submit Application" on stepper sidebar — submit only on step 5.

---

## Validation matrix

| Step | Required fields |
|------|-----------------|
| 1 | project name, scheme type, location, lat, lng, state, district, block, nearest landmark, contact name/phone/email, planned dates, assigned user |
| 2 | beneficiary name |
| 3 | fund type |
| 4 | none (optional uploads) |
| 5 | all step 1 required re-validated before API call |

---

## Edit mode

- Load project from list/detail via `gpbi_id`
- `GetProjectForEditUseCase` maps list item → `ProjectWizardState`
- `gpbi_id > 0` on submit
- Pre-fill steps 2–4 from session storage only if previously saved locally (v1: basic info from API only)

---

## File structure (target)

```text
presentation/features/project/
├── project-form.page.ts          # route component (replaces monolith)
├── project-form.page.html        # Figma shell + step outlet
├── project-form.page.scss
├── project-form.facade.ts
├── components/
│   ├── project-form-shell/
│   ├── project-stepper/
│   ├── step-activity-location/
│   ├── step-beneficiaries/
│   ├── step-documentation/
│   ├── step-media/
│   └── step-review/
└── models/
    └── project-wizard.view-model.ts
```

**Migration strategy:** Phase A — wire API + new fields in existing `insert-update-project`; Phase B — extract components + Figma SCSS.

---

## Catalog dependencies

- `scheme-type.catalog.ts` — labels + `apiCode`
- `project-type.catalog.ts` — `projectNames` labels + `apiCode`
- Map display uses **names** from API list response; forms use **codes** on submit
