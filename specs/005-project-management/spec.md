# Feature Specification: Project Management (Epic E-05)

**Feature Branch**: `005-project-management`  
**Created**: 2026-06-13  
**Status**: Draft  
**Input**: Epic E-05 — Project Management from [`user-story.md`](../../user-story.md), with UI aligned to Figma *mix-design* frames (5 project-form steps).

**Parent platform:** Slice of ProjectGeo geo-monitoring platform. Depends on authenticated session (US-01), jurisdiction filters (US-02c), and home dashboard (US-02). Map pin sync (US-03) is a downstream consumer of created projects.

**Source stories:** US-05, US-05a, US-05b, US-05c, US-05d, US-05e, US-05f (Epic E-05).

**Design source:** [Figma — mix-design](https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design) — file key `M13IP48ZkoQfCilusmMlMw`.

---

## User Scenarios *(mandatory)*

### User Story 1 — View Project List on Dashboard (Priority: P1)

**As an** authorized user  
**I want to** see my applicable projects in the home dashboard sidebar  
**So that** I monitor real project records within my jurisdiction without leaving the map view

**Maps to:** US-05d

**Why this priority:** The project list is the primary monitoring surface; all create/edit flows return here after success.

**Independent Delivery:** After login, the Projects section on `/home` loads and displays project name, location, and scheme/type for each in-scope record. Verifiable without opening the create form.

**Acceptance Scenarios**:

1. **Given** I am logged in on the home dashboard, **When** the page loads, **Then** the Projects sidebar section shows projects I am authorized to see.
2. **Given** projects exist, **When** the list renders, **Then** each row shows at minimum project name, location name, and human-readable scheme/type labels.
3. **Given** I apply geographic or scheme filters on the dashboard, **When** filters change, **Then** the sidebar list updates to show only matching projects.
4. **Given** no projects match my scope or filters, **When** the list is empty, **Then** I see a friendly empty state — not an error screen.
5. **Given** I select a project in the sidebar, **When** it is highlighted, **Then** the corresponding map pin is emphasized when location coordinates exist.

---

### User Story 2 — Start Project Create from Dashboard (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** start a new project from the dashboard Projects heading and the side navigation rail  
**So that** I can begin project registration without typing a URL

**Maps to:** US-05e

**Why this priority:** Discoverable entry points are required before users can reach the multi-step form.

**Independent Delivery:** Two visible controls on `/home` navigate to the project create flow in create mode. Users without create permission do not see active controls.

**Acceptance Scenarios**:

1. **Given** I am on the home dashboard, **When** I view the Projects section header, **Then** I see a **Create +** underlined text/link control beside the Projects heading.
2. **Given** I have create permission, **When** I click **Create +**, **Then** I navigate to the project create screen in create mode.
3. **Given** I view the left side navigation rail, **When** the dashboard renders, **Then** I see a dedicated project-create action distinct from map, layers, and analytics icons.
4. **Given** I click the side-nav create action, **When** navigation completes, **Then** I land on the same create screen as the **Create +** control.
5. **Given** I opened create from either entry point, **When** the form loads, **Then** state, district, and block selections from the dashboard pre-fill matching fields where applicable.
6. **Given** I lack create permission, **When** the dashboard renders, **Then** create entry points are hidden or disabled.

---

### User Story 3 — Complete Activity & Location (Step 1) (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** enter activity name, location, coordinates, scheme type, and optional area-of-interest files on step 1  
**So that** the geographic foundation of the project is captured accurately

**Maps to:** US-05, US-05f (partial)

**Figma reference:** Node `133:35` — *ACTIVITY NAME & LOCATION DETAILS*

**Why this priority:** Step 1 captures mandatory basic-info fields required for central project registration.

**Independent Delivery:** User reaches step 1, fills required fields per Figma layout, and advances to step 2. Data persists in the wizard session without final submit.

**Acceptance Scenarios**:

1. **Given** I open the project create screen, **When** step 1 loads, **Then** I see the heading **ACTIVITY NAME & LOCATION DETAILS**, subtitle *Fill all project related details*, and a 5-step progress indicator with step **1** active (purple underline).
2. **Given** step 1 is visible, **When** I view the form, **Then** I see fields matching the design: Project Name (required), Name of Activity / Scheme, Scheme Type (dropdown), Mouza / Village / Location Name, Latitude, Longitude, and an Upload AOI drop zone.
3. **Given** required fields are empty, **When** I click **GO TO NEXT STEP**, **Then** validation prevents advancement with clear field-level errors.
4. **Given** valid step-1 data, **When** I click **GO TO NEXT STEP**, **Then** I advance to step 2 and step 1 values are retained.
5. **Given** I click **RESET** on step 1, **When** confirmed, **Then** step 1 fields clear.
6. **Given** the shared shell layout, **When** any form step is shown, **Then** I see the purple left rail (HOME, PROJECTS active, OTHER), top header with product title and user utilities, per Figma.

---

### User Story 4 — Complete Beneficiary Details (Step 2) (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** record beneficiary and cost information on step 2  
**So that** financial and beneficiary context is captured before documentation

**Maps to:** US-05

**Figma reference:** Node `133:153` — *BENEFICIERIES DETAILS*

**Why this priority:** Beneficiary data completes the business case for the project; required for review step even if not yet persisted centrally in v1.

**Independent Delivery:** From step 1, user completes step 2 fields and advances. **GO BACK** returns to step 1 with data preserved.

**Acceptance Scenarios**:

1. **Given** I advanced from step 1, **When** step 2 loads, **Then** I see heading **BENEFICIERIES DETAILS**, the same 5-step indicator with step **2** active, and fields: Name of Beneficiary / Beneficiaries (required), Estimated Cost, Final Cost, Beneficiaries Details (full width).
2. **Given** step 2 is visible, **When** required beneficiary name is missing, **Then** I cannot advance to step 3.
3. **Given** valid step-2 data, **When** I click **GO TO NEXT STEP**, **Then** I advance to step 3.
4. **Given** I am on step 2, **When** I click **GO BACK**, **Then** I return to step 1 with previously entered values intact.

---

### User Story 5 — Complete Documentation Uploads (Step 3) (Priority: P2)

**As a** District Manager or Block Manager  
**I want to** select fund type and attach beneficiary, plan, and tender documents on step 3  
**So that** supporting paperwork is associated with the project record

**Maps to:** US-05b (partial — local/session until upload service exists)

**Figma reference:** Node `133:261` — *DOCUMENTATION DETAILS*

**Why this priority:** Document capture is important but file persistence depends on a future upload capability; v1 may hold files in wizard session only.

**Independent Delivery:** User completes step 3 UI per Figma, attaches files locally, and advances. Files appear on review step 5.

**Acceptance Scenarios**:

1. **Given** I am on step 3, **When** the screen loads, **Then** I see heading **DOCUMENTATION DETAILS**, step **3** active in the stepper, Fund Type (required dropdown), and three upload zones: Beneficiaries Document, Plan & Estimation, Tender Details.
2. **Given** each upload zone, **When** displayed, **Then** it shows dashed border, cloud icon, *Drop your files here, or Browse* pattern per Figma.
3. **Given** Fund Type is not selected, **When** I attempt to advance, **Then** validation blocks progression.
4. **Given** I attach supported files, **When** I reach step 5 review, **Then** file names and sizes are summarized.

---

### User Story 6 — Complete Photo & Video Documentation (Step 4) (Priority: P2)

**As a** District Manager or Block Manager  
**I want to** upload activity photography and videography on step 4  
**So that** visual evidence of the project site is stored with the record

**Maps to:** US-05b (partial)

**Figma reference:** Node `133:368` — *PHOTO & VIDEOGRAPHY DETAILS*

**Why this priority:** Media upload enhances records but shares the same upload-service dependency as step 3.

**Independent Delivery:** User uploads media on step 4 and clicks **GO FOR REVIEW** to reach step 5.

**Acceptance Scenarios**:

1. **Given** I am on step 4, **When** the screen loads, **Then** I see heading **PHOTO & VIDEOGRAPHY DETAILS**, step **4** active, and a full-width upload zone titled *Activity Photography & Videography Documentation*.
2. **Given** step 4 is complete, **When** I click **GO FOR REVIEW**, **Then** I advance to step 5 (Review).
3. **Given** I click **GO BACK** on step 4, **When** navigation occurs, **Then** I return to step 3 with prior entries preserved.

---

### User Story 7 — Review and Submit Project (Step 5) (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** review all entered details and submit the project  
**So that** the project is saved centrally and appears on my dashboard list

**Maps to:** US-05f, US-05

**Figma reference:** Node `133:472` — *REVIEW DETAILS*

**Why this priority:** Submit is the value-delivering action that persists basic project info and closes the create journey.

**Independent Delivery:** User reaches review, sees grouped summaries, edits any section via pencil icons, submits successfully, and returns to home with the new project visible in the list.

**Acceptance Scenarios**:

1. **Given** I complete steps 1–4, **When** step 5 loads, **Then** I see heading **REVIEW DETAILS**, subtitle *Check all project related details carefully*, step **5** active, and three summary sections: PROJECT DETAILS, BENEFICIARIES DETAILS DETAILS, DOCUMENTATION DETAILS — each with an edit (pencil) action.
2. **Given** the PROJECT DETAILS summary, **When** displayed, **Then** it shows values from step 1 including project name, activity/scheme, scheme type, location, latitude, longitude, and AOI file name if uploaded.
3. **Given** I click the pencil icon on a section, **When** the action fires, **Then** I navigate back to the corresponding wizard step to edit.
4. **Given** all required basic-info fields are valid, **When** I click **SUBMIT** (green primary button per Figma), **Then** the project basic information is saved to the central registry and I receive a success confirmation.
5. **Given** submit succeeds, **When** I am redirected, **Then** I return to the home dashboard and the new project appears in the Projects list (User Story 1).
6. **Given** submit fails, **When** the registry returns an error, **Then** I see the error message and remain on review with data preserved.
7. **Given** I click **GO BACK** on review, **When** navigation occurs, **Then** I return to step 4 without losing entered data.

**Business rule (BR-PM-01):** Only **basic project information** from steps 1 (and mapped contact/jurisdiction/date fields supported by the registry) is persisted on submit in v1. Beneficiary, document, and media content from steps 2–4 is shown on review but remains session-local until upload APIs exist.

---

### User Story 8 — Search Project List (Priority: P2)

**As an** authorized user  
**I want to** search the dashboard project sidebar by name, location, or scheme  
**So that** I can quickly find a project among many

**Maps to:** US-05c

**Why this priority:** Search improves usability once the API-backed list (Story 1) is live; not required for first create/list MVP.

**Independent Delivery:** With multiple projects loaded, typing in the search box filters the sidebar in under one second.

**Acceptance Scenarios**:

1. **Given** multiple projects are listed, **When** I type in the search box, **Then** the list filters client-side matching project name, location, or scheme type.
2. **Given** search returns no matches, **When** the list is empty, **Then** I see a friendly *no projects found* message.

---

### User Story 9 — Edit Existing Project (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** edit a project within my jurisdiction  
**So that** I can update details when circumstances change

**Maps to:** US-05a

**Why this priority:** Edit reuses the same 5-step Figma form in edit mode; depends on Story 7 submit path with existing project identifier.

**Independent Delivery:** Opening an in-scope project pre-fills the wizard; saving updates the registry and refreshes dashboard/map.

**Acceptance Scenarios**:

1. **Given** I open an in-scope project for edit, **When** the form loads, **Then** existing basic-info fields pre-fill across all steps.
2. **Given** I save changes on review, **When** submit succeeds, **Then** updates appear in the dashboard list and map without a full page reload beyond normal refresh behavior.
3. **Given** I am a District Manager, **When** I attempt to edit a project outside my district, **Then** the action is denied by the registry or UI guard.

---

### Edge Cases

- What happens when the project list service returns an empty result with success? → Show empty state; do not treat as failure.
- What happens when the list service fails? → Show retry/error state in the Projects section; do not show a misleading empty list.
- What happens when a user closes the browser mid-wizard? → Unsubmitted wizard data is lost unless explicitly saved as draft (out of scope v1).
- What happens when AOI or document file type is unsupported? → Block attach with a clear message before advancing.
- What happens when a Block Manager creates a project outside their block? → Registry or client validation rejects submission.
- What happens when submit succeeds but list refresh fails? → User still sees success; list retries on next home visit.
- What happens when user clicks **Create +** while filters hide all projects? → Navigate to create; new project uses form jurisdiction, not empty filter state.

---

## Design Reference *(Figma — mandatory for this feature)*

All project-form screens MUST match the approved Figma frames below. Dashboard list/create entry points follow [`user-story.md`](../../user-story.md) US-05d/e (not shown as separate Figma frames in the provided links).

| Step | Figma node | Screen title | Primary actions |
|------|------------|--------------|-----------------|
| 1 | `133:35` | ACTIVITY NAME & LOCATION DETAILS | RESET, GO TO NEXT STEP |
| 2 | `133:153` | BENEFICIERIES DETAILS | GO BACK, RESET, GO TO NEXT STEP |
| 3 | `133:261` | DOCUMENTATION DETAILS | GO BACK, RESET, GO TO NEXT STEP |
| 4 | `133:368` | PHOTO & VIDEOGRAPHY DETAILS | GO BACK, RESET, GO FOR REVIEW |
| 5 | `133:472` | REVIEW DETAILS | GO BACK, RESET, SUBMIT |

**Shared shell (all steps):**

| Element | Design intent |
|---------|---------------|
| Left rail | 64px purple (`#5141e0`); logo top; HOME / PROJECTS (active `#6254e3`) / OTHER; help icon bottom |
| Top header | Product title *Geospatial* (Hanken Grotesk Bold 24px); settings, notifications (badge), profile avatar |
| Stepper | Steps 1–5 with arrows; active step bold number + purple 5px underline; inactive grey underline |
| Form band | Grey header band (`#f8f8f8`); 18px bold section title; 14px grey subtitle |
| Inputs | Light grey fill (`#f6f6f6`), 8px radius, subtle shadow; required fields marked with red asterisk |
| Upload zones | Dashed border (`#d8dadc`), cloud icon, *Drop your files here, or Browse* (Browse in `#3b66ff`) |
| Primary CTA | Purple `#5141e0` — *GO TO NEXT STEP* / *GO FOR REVIEW* |
| Submit CTA | Green `#07a456` — *SUBMIT* on review only |
| Secondary CTA | White outline — *RESET*, *GO BACK* |

**Figma URLs:**

- Step 1: `https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design?node-id=133-35`
- Step 2: `https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design?node-id=133-153`
- Step 3: `https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design?node-id=133-261`
- Step 4: `https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design?node-id=133-368`
- Step 5: `https://www.figma.com/design/M13IP48ZkoQfCilusmMlMw/mix-design?node-id=133-472`

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-PM-01**: System MUST display an authorized user's projects in the home dashboard Projects sidebar section.
- **FR-PM-02**: System MUST show per-project name, location, and scheme/type labels in the sidebar list.
- **FR-PM-03**: System MUST filter the sidebar project list when dashboard geographic or scheme filters change.
- **FR-PM-04**: System MUST provide a **Create +** underlined control on the Projects section header for users with create permission.
- **FR-PM-05**: System MUST provide a project-create action on the home side navigation rail for users with create permission.
- **FR-PM-06**: Both create entry points MUST navigate to the same project create wizard in create mode.
- **FR-PM-07**: System MUST present a 5-step project wizard matching Figma steps 1–5 layout, labels, and actions.
- **FR-PM-08**: System MUST validate required fields on each step before allowing forward navigation.
- **FR-PM-09**: System MUST retain wizard data when moving forward, backward, or editing from the review step.
- **FR-PM-10**: Step 1 MUST capture project name, activity/scheme name, scheme type, location, latitude, longitude, and optional AOI upload.
- **FR-PM-11**: Step 2 MUST capture beneficiary name (required), estimated cost, final cost, and beneficiary details.
- **FR-PM-12**: Step 3 MUST capture fund type (required) and optional document uploads (beneficiary document, plan & estimation, tender details).
- **FR-PM-13**: Step 4 MUST capture optional activity photography and videography uploads.
- **FR-PM-14**: Step 5 MUST display read-only summaries grouped as PROJECT DETAILS, BENEFICIARIES DETAILS, and DOCUMENTATION DETAILS with edit shortcuts to the source step.
- **FR-PM-15**: System MUST persist basic project information to the central project registry on successful submit from step 5.
- **FR-PM-16**: System MUST show a success confirmation after submit and return the user to the home dashboard with the list refreshed.
- **FR-PM-17**: System MUST pre-fill jurisdiction fields from dashboard context when create is opened from home.
- **FR-PM-18**: System MUST restrict create and edit to users with appropriate role permission within their jurisdiction.
- **FR-PM-19**: System MUST support editing an existing in-scope project using the same wizard with pre-filled data.
- **FR-PM-20**: System MUST allow client-side search of the sidebar project list by name, location, or scheme (P2).
- **FR-PM-21**: System MUST emphasize the map pin when a sidebar project with coordinates is selected.
- **FR-PM-22**: System MUST show friendly empty and error states for the project list — never a silent failure.

### Key Entities

- **Project (basic info):** Identifier, project code (assigned on create), name, type, scheme type, state/district/block, location, landmark, geo coordinates, accuracy, assigned user, contact details, status, active flag, planned/actual dates, created date.
- **Project (extended — session v1):** Beneficiary name, costs, beneficiary details, fund type, attached AOI/documents/media file references (local until upload service).
- **Project list item:** Summary projection for dashboard display — name, location, scheme/type labels, code, status, coordinates for map sync.
- **Wizard session:** In-progress multi-step form state spanning steps 1–5 before submit.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-PM-01**: Authorized users see their project list on the home dashboard within 3 seconds of page load under normal network conditions.
- **SC-PM-02**: Users with create permission can reach step 1 of the project wizard in no more than 2 clicks from the home dashboard.
- **SC-PM-03**: Users can complete the 5-step create flow (required fields only, no optional uploads) in under 10 minutes on first attempt.
- **SC-PM-04**: 90% of pilot users successfully submit a new project on first attempt without support intervention.
- **SC-PM-05**: After successful submit, the new project appears in the dashboard list on return to home without manual refresh beyond standard navigation.
- **SC-PM-06**: Sidebar search filters results in under 1 second for lists up to 50 projects.
- **SC-PM-07**: Implemented form screens match approved Figma layouts at ≥ 90% visual fidelity (spacing, labels, stepper, buttons, upload zones).
- **SC-PM-08**: Block Managers cannot view or submit projects outside their applicable block scope.

---

## Assumptions

- Users are already authenticated and jurisdiction dropdowns are populated (Epic E-01, E-02).
- Central project registry exposes **list** and **submit/update basic info** operations; contract details live in [`api.md`](../../api.md) §6 for implementation planning — not in this business spec.
- Scheme type and project type dropdown values align with the canonical scheme-type catalog used elsewhere in ProjectGeo.
- Document and media uploads (steps 3–4) are captured in the wizard session for v1; persistent file storage is deferred until an upload service exists (US-05b).
- State Manager create permission is TBD with backend; default v1 create roles are District Manager and Block Manager.
- Dashboard **Create +** and side-nav create button layouts follow user-story US-05e; exact visual treatment may extend current home sidebar styling while remaining consistent with the purple rail language from Figma form screens.
- Product title in Figma shows *Geospatial*; production branding may retain *webgap* / *Project Geo* if product owner confirms — layout and hierarchy take precedence over literal title text.
- Pagination for project list starts at first page with up to 50 records per load.

---

## Out of Scope (v1)

- Persistent storage of beneficiary details, documents, and media via backend upload APIs
- Project delete / soft-delete workflow
- Draft save and resume of partial wizard across sessions
- State Manager create permission (until backend confirms)
- Separate Figma frames for dashboard list and Create + button (specified via user-story only)

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-01 Login & session | Authenticated user context |
| US-02c Jurisdiction dropdowns | State/district/block IDs for create form |
| US-03 Map pins | Display created projects on map |
| [`api.md`](../../api.md) §6 | Project list and basic-info submit contracts (implementation phase) |
| [`user-story.md`](../../user-story.md) Epic E-05 | Authoritative story acceptance detail |
| Figma `mix-design` nodes 133:35–133:472 | Visual specification for wizard steps |
