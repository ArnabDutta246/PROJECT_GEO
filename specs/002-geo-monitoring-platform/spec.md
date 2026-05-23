# Feature Specification: ProjectGeo Government Monitoring Platform

**Feature Branch**: `002-geo-monitoring-platform`  
**Created**: 2026-05-23  
**Status**: Draft  
**Input**: Build specification from `user-story.md` and `architecture.md`, structured as one user journey per story (US-01 through US-07b).

**Journey source:** Each user scenario below maps 1:1 to a story in `user-story.md`. Business rules BR-* reflect authorization and session constraints from `architecture.md` §8.2.

---

## User Scenarios *(mandatory)*

Stories are ordered by epic (E-01 → E-07) and priority (P1 before P2), matching the user-story backlog.

---

### Epic E-01 — Authentication & Session

#### User Story — US-01: Secure Login with Government Credentials (Priority: P1)

**As a** government official  
**I want to** log in with my User ID and password  
**So that** I can access ProjectGeo securely within my assigned role

**Applies to:** State Manager, District Manager, Block Manager, Admin

**Why this priority:** No other feature works without authenticated, role-scoped access.

**Independent Delivery:** Login screen validates credentials, establishes session, maps account group to role, and navigates to home — demonstrable without map or projects.

**Maps to:** FR-AUTH-01, FR-AUTH-03, FR-AUTH-04, FR-AUTH-06

**Acceptance Scenarios**:

1. **Given** I am on the login page with a valid User ID, password, and device identifier, **When** I submit the form, **Then** I am authenticated, my role is determined from my account group, my session is stored, and I am navigated to the home dashboard.
2. **Given** I enter an invalid password, **When** I submit, **Then** login fails, I remain on the login page, and I see *"Login failed! Invalid user or password!"* without revealing whether the User ID exists.
3. **Given** my account is inactive, **When** I attempt login, **Then** access is denied with a clear inactive-account message.
4. **Given** I am not logged in, **When** I navigate to the home dashboard or projects page, **Then** I am redirected to the login page.
5. **Given** a successful login as District Manager, **When** I reach the dashboard, **Then** I only see data within my applicable districts — no cross-district leakage.
6. **Given** a successful login as Block Manager, **When** I reach the dashboard, **Then** I only see data within my applicable blocks.

**Journey notes:** Login uses **User ID** (e.g. `STMN001`), not email — the UI label MUST reflect this. Password values from login responses MUST NOT be stored. Role is derived from account group code (e.g. `SM` → State Manager).

---

#### User Story — US-01a: Session Restore After Page Refresh (Priority: P1)

**As a** logged-in user  
**I want to** remain authenticated after refreshing the browser  
**So that** I do not have to log in repeatedly during my work session

**Why this priority:** Government officials work in long sessions; repeated login disrupts monitoring workflows.

**Independent Delivery:** Session persists across browser refresh; expired sessions redirect to login with a clear message.

**Maps to:** FR-AUTH-02

**Acceptance Scenarios**:

1. **Given** I logged in successfully and refreshed the page, **When** the application loads, **Then** my session is restored and I remain on the current route (or home if on a protected route).
2. **Given** my session has expired, **When** I refresh or request protected data, **Then** I am redirected to login with a session-expired message.

---

#### User Story — US-01b: Logout and Clear Session (Priority: P1)

**As a** logged-in user  
**I want to** log out from the header menu  
**So that** my session is cleared on shared government computers

**Why this priority:** Shared workstations in government offices require explicit session termination.

**Independent Delivery:** Logout clears all session data and prevents back-navigation to protected pages.

**Maps to:** FR-AUTH-05

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I click Logout, **Then** my session credential, user profile, and jurisdiction cache are cleared, and I am redirected to the login page.
2. **Given** I logged out, **When** I use the browser back button, **Then** I cannot access protected routes without logging in again.

---

### Epic E-02 — Jurisdiction & Dashboard Filters

#### User Story — US-02: State-Wide Project Overview (Priority: P1)

**As a** State Manager  
**I want to** see all running project types in my state and filter by any district  
**So that** I can monitor statewide scheme progress from one dashboard

**Applies to:** State Manager, Admin

**Why this priority:** Core value proposition for the highest-level government user.

**Independent Delivery:** State Manager lands on home with full state map, project sidebar, and all applicable districts selectable in the district dropdown.

**Maps to:** FR-DASH-01, FR-DASH-02, FR-DASH-04, FR-DASH-06

**Acceptance Scenarios**:

1. **Given** I am a State Manager on the home dashboard, **When** it loads, **Then** I see the full state map, project sidebar, and all districts I am applicable for in the district dropdown.
2. **Given** projects exist in multiple districts, **When** I have no district selected, **Then** the sidebar shows all in-scope projects for my state and the project count badge reflects the total.
3. **Given** I select district **CHANGLANG**, **When** the selection applies, **Then** the project list filters to that district, the map zooms/highlights the district, and only relevant project pins remain visible.
4. **Given** I am a State Manager, **When** I open the district dropdown, **Then** every district returned for my user is selectable — not locked to a single district.

**Journey continuation:** After login (US-01), State Manager selects a district (US-02c) → views filtered projects on map (US-03) → clicks boundary for area summary (US-04).

---

#### User Story — US-02a: District-Scoped Dashboard (Priority: P1)

**As a** District Manager  
**I want to** land on a dashboard scoped to my assigned district  
**So that** I immediately see relevant projects without navigating other districts

**Applies to:** District Manager, Admin

**Why this priority:** District Managers must not waste time on irrelevant statewide data.

**Independent Delivery:** District Manager login auto-zooms map to assigned district with district dropdown pre-selected to own district only.

**Maps to:** FR-DASH-02, FR-DASH-04, FR-MAP-08

**Acceptance Scenarios**:

1. **Given** I am a District Manager with one applicable district, **When** I log in, **Then** the map auto-zooms to my district and the district dropdown is pre-selected.
2. **Given** I am a District Manager, **When** I view the district dropdown, **Then** I only see districts returned for my user — not the full state list.
3. **Given** I am a District Manager, **When** I attempt to view another district's projects through manipulation, **Then** no unauthorized data is returned.

**Business rule (BR-04):** Data scope enforcement MUST occur in business logic and on the backend — frontend checks are UX only.

---

#### User Story — US-02b: Block-Scoped Dashboard (Priority: P1)

**As a** Block Manager  
**I want to** land on a dashboard scoped to my assigned block  
**So that** I focus only on work in my administrative block

**Applies to:** Block Manager, Admin

**Why this priority:** Block Managers operate at the most granular administrative level.

**Independent Delivery:** Block Manager login auto-zooms to assigned block; sidebar and dropdowns reflect block jurisdiction only.

**Maps to:** FR-DASH-02, FR-DASH-04, FR-MAP-08

**Acceptance Scenarios**:

1. **Given** I am a Block Manager, **When** I log in, **Then** the map auto-zooms to my block and both district and block dropdowns reflect my jurisdiction.
2. **Given** I am a Block Manager, **When** I view the project sidebar, **Then** only projects within my applicable block(s) are listed.
3. **Given** I am a Block Manager, **When** I open the block dropdown, **Then** I only see blocks applicable to my user, state, and district.

**Journey continuation:** Block Manager login → views block projects (US-03) → views block analytics (US-04) → creates/edits project (US-05 / US-05a).

---

#### User Story — US-02c: Cascading State / District / Block Filters (Priority: P1)

**As an** authorized user  
**I want to** use linked state, district, and block dropdowns on the dashboard  
**So that** I can drill down geographically in a predictable order

**Applies to:** All roles

**Why this priority:** Geographic drill-down is the primary navigation pattern on the home dashboard.

**Independent Delivery:** Cascading dropdowns populate from applicable-area services in state → district → block order with graceful empty states.

**Maps to:** FR-DASH-03, FR-DASH-04

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** the home page loads, **Then** the state dropdown is populated from my applicable states.
2. **Given** I select state **ARUNACHAL PRADESH**, **When** the district list loads, **Then** the district dropdown shows districts applicable to me for that state.
3. **Given** I select district **CHANGLANG**, **When** the block list loads, **Then** the block dropdown shows blocks applicable to me for that state and district.
4. **Given** applicable districts or blocks return empty with a successful response indicating no records, **When** the response is processed, **Then** the dropdown shows an empty state gracefully and the child dropdown is disabled — no page crash.
5. **Given** I change the district selection, **When** the new district is applied, **Then** the block dropdown resets and reloads for the new district.
6. **Given** I select a district or block in a dropdown, **When** the map is visible, **Then** map highlight and viewport sync with the selection bidirectionally.

---

### Epic E-03 — Map & Geo Visualization

#### User Story — US-03: Interactive Map with Project Pins (Priority: P1)

**As an** authorized user  
**I want to** see project pins on an interactive map and click them for details  
**So that** I understand where development work is happening in my jurisdiction

**Applies to:** All roles (scope filtered by jurisdiction)

**Why this priority:** Map-centric monitoring is the product's primary geographic interface.

**Independent Delivery:** Interactive map renders in-scope project markers; pin click and sidebar selection open detail without losing filter state.

**Maps to:** FR-MAP-01, FR-MAP-05, FR-MAP-07, FR-MAP-08, FR-DASH-07

**Acceptance Scenarios**:

1. **Given** I am on the home dashboard after authentication completes, **When** the map loads, **Then** an interactive map renders with project markers at coordinates within my scope.
2. **Given** project markers are visible, **When** I hover a pin, **Then** a tooltip shows project name and location (if available).
3. **Given** I click a project pin, **When** the detail panel opens, **Then** I see project information without losing my current district/block map selection.
4. **Given** I select a project from the sidebar, **When** the selection is applied, **Then** the map centers on that pin and opens the detail panel.
5. **Given** I am a Block Manager, **When** the map renders, **Then** only pins for my block are shown — not statewide pins.

**Business rule (BR-05):** Map MUST NOT render jurisdiction-sensitive markers before authentication and jurisdiction context are established.

---

#### User Story — US-03a: District & Block Boundary Layers (Priority: P1)

**As an** authorized user  
**I want to** see state, district, and block boundaries on the map  
**So that** I can understand administrative geography alongside projects

**Applies to:** All roles

**Why this priority:** Boundaries provide context for project pins and analytics drill-down.

**Independent Delivery:** District and block administrative boundaries render on map; clicking boundaries triggers highlight, zoom, and summary flow.

**Maps to:** FR-MAP-02, FR-MAP-03, FR-MAP-04, FR-MAP-10

**Acceptance Scenarios**:

1. **Given** the map is loaded, **When** I view the state/district level, **Then** district administrative boundaries render on the map.
2. **Given** I click a district boundary, **When** the district is selected, **Then** it highlights, the map zooms to bounds, child block layers load, and the district summary flow begins.
3. **Given** I click a block boundary, **When** the block is selected, **Then** it highlights and block-level summary flow begins.
4. **Given** district names from data services and boundary layers use different casing (e.g. `CHANGLANG` vs mixed case), **When** matching boundaries to dropdown values, **Then** comparison is case-insensitive.
5. **Given** the Arunachal Pradesh block boundary layer is loaded, **When** a block is selected, **Then** census population attributes are available as analytics fallback.

---

#### User Story — US-03b: Project Detail Panel on Pin Click (Priority: P1)

**As an** authorized user  
**I want to** open a tabbed detail panel when I click a project pin  
**So that** I can review project info, beneficiaries, documents, and media in one place

**Applies to:** All roles (in-scope projects only)

**Why this priority:** Quick project review from the map is a core monitoring workflow.

**Independent Delivery:** Tabbed panel (Info, Beneficiaries, Documentation, Photo & Video) opens on pin click; closes without affecting map state.

**Maps to:** FR-MAP-06, FR-PROJ-09

**Acceptance Scenarios**:

1. **Given** I click a project pin, **When** the panel opens, **Then** I see tabs: **Info**, **Beneficiaries Details**, **Documentation**, **Photo & Videography**.
2. **Given** the Info tab is active, **When** data is loaded, **Then** I see project name, scheme type, location, coordinates, costs, fund type, district, and block.
3. **Given** the panel is open, **When** I click "View Project Details", **Then** I can open the full project page in a new browser tab.
4. **Given** the panel is open, **When** I close it, **Then** the map and filters remain unchanged.

---

#### User Story — US-03c: Map Base Layer Switcher (Priority: P2)

**As an** authorized user  
**I want to** switch map base layers (Satellite, Streets, Hybrid, etc.)  
**So that** I can view geography in the most useful context

**Applies to:** All roles

**Why this priority:** Improves usability but not required for initial monitoring MVP.

**Independent Delivery:** Base layer switcher changes background map without clearing markers or boundaries.

**Maps to:** FR-DASH-09

**Acceptance Scenarios**:

1. **Given** I am on the dashboard map, **When** I select **Satellite**, **Then** the basemap switches without clearing project pins or boundary layers.
2. **Given** I switch layers, **When** the new layer loads, **Then** the current zoom and center are preserved.

---

### Epic E-04 — Area Analytics & Reports

#### User Story — US-04: Area Summary on Geographic Click (Priority: P1)

**As an** authorized user  
**I want to** click a district, block, or map area and see a summary analytics panel  
**So that** I understand local demographics and resource conditions before planning work

**Applies to:** All roles

**Why this priority:** Area context supports scheme planning alongside project monitoring.

**Independent Delivery:** Dismissible summary panel shows geography metadata and total population on district/block click.

**Maps to:** FR-ANLY-01, FR-ANLY-07, FR-ANLY-08, FR-ANLY-10

**Acceptance Scenarios**:

1. **Given** I click a district or block on the map, **When** the summary panel opens, **Then** it shows state name, district name, block name (when applicable), and total population.
2. **Given** the summary panel is open, **When** I click close, **Then** the panel dismisses and map state is preserved.
3. **Given** I selected a block, **When** summary loads, **Then** all metrics scope to that block only — not statewide aggregates.

**Journey continuation:** Boundary click (US-03a) → summary panel opens (US-04) → charts load (US-04a, US-04b).

---

#### User Story — US-04a: Gender & Caste Distribution Charts (Priority: P1)

**As an** authorized user  
**I want to** see male/female comparison and caste/community charts for a selected area  
**So that** I can understand population composition for scheme planning

**Applies to:** All roles

**Why this priority:** Demographic charts are mandatory area summary content.

**Independent Delivery:** Gender and caste/community charts render graphically within the area summary panel.

**Maps to:** FR-ANLY-02, FR-ANLY-03, FR-ANLY-06, FR-ANLY-09

**Acceptance Scenarios**:

1. **Given** I open the area summary for a district, **When** charts render, **Then** I see a **Gender Distribution** chart (male vs female vs others if applicable).
2. **Given** I open the area summary, **When** charts render, **Then** I see a **Caste / Community Distribution** chart with legend.
3. **Given** analytics data is unavailable, **When** census boundary data exists for the selected block, **Then** gender/caste charts MAY use census population fields as fallback.
4. **Given** charts are displayed, **When** I view them, **Then** all values are graphical (pie, donut, or bar) — not raw tables only.

---

#### User Story — US-04b: Water & Soil Reports (Priority: P1)

**As an** authorized user  
**I want to** see water and soil reports for a selected area in graphical form  
**So that** I can assess resource conditions for irrigation, PHED, and agriculture schemes

**Applies to:** All roles

**Why this priority:** Water and soil reports complete the four-report area summary requirement.

**Independent Delivery:** Water and soil report sections render within area summary with charts or clear empty states.

**Maps to:** FR-ANLY-04, FR-ANLY-05, FR-ANLY-06

**Acceptance Scenarios**:

1. **Given** I open the area summary, **When** water data is available, **Then** I see a **Water Report** section with chart(s) and key indicators (availability, quality, scheme coverage as provided by data).
2. **Given** I open the area summary, **When** soil data is available, **Then** I see a **Soil Report** section with chart(s) for soil type, fertility, or land use.
3. **Given** water or soil data is unavailable, **When** the panel renders, **Then** I see a clear empty state — not broken charts or errors.

---

### Epic E-05 — Project Management

#### User Story — US-05: Create New Project (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** create a new project using a multi-step form with map-based location  
**So that** the project appears on dashboards and maps in my jurisdiction

**Applies to:** District Manager, Block Manager, Admin (State Manager: view-only per role matrix)

**Why this priority:** Field officials must register new scheme work for monitoring.

**Independent Delivery:** Five-step form with map location picker; valid submission adds project to sidebar and map within jurisdiction.

**Maps to:** FR-PROJ-01, FR-PROJ-02, FR-PROJ-03, FR-PROJ-07, FR-PROJ-08, FR-PROJ-10

**Acceptance Scenarios**:

1. **Given** I have create permission, **When** I open the projects page, **Then** I see the 5-step project application form (Activity & Location → Beneficiary → Documents → Media → Review).
2. **Given** I am on Step 1, **When** I pick a location on the map or enter coordinates, **Then** coordinates and district/block fields populate where possible.
3. **Given** I leave required fields empty, **When** I attempt to submit, **Then** validation prevents submission with field-level errors.
4. **Given** I complete and submit a valid form, **When** save succeeds, **Then** the project appears in the sidebar and as a map pin within my jurisdiction.
5. **Given** I am a Block Manager, **When** I create a project outside my block, **Then** submission is rejected.

**Journey continuation:** District/Block Manager login → navigate to projects (US-07a) → create project (US-05) → project appears on home map (US-03).

---

#### User Story — US-05a: Edit Existing Project (Priority: P1)

**As a** District Manager or Block Manager  
**I want to** edit projects within my jurisdiction  
**So that** I can update costs, beneficiary details, and location when circumstances change

**Applies to:** District Manager, Block Manager, Admin

**Why this priority:** Project records must stay current as work progresses.

**Independent Delivery:** Edit mode pre-fills form; save updates map and sidebar immediately within jurisdiction.

**Maps to:** FR-PROJ-06, FR-PROJ-07, FR-PROJ-08

**Acceptance Scenarios**:

1. **Given** I open an in-scope project on the projects page, **When** I edit fields and save, **Then** changes persist and reflect on map and sidebar immediately.
2. **Given** I am a District Manager, **When** I attempt to edit a project outside my district, **Then** the action is denied.
3. **Given** I am in edit mode, **When** the form loads, **Then** existing project data pre-fills all steps.

**Business rule (BR-06):** Write operations (create, edit, delete) MUST be authorized in business logic before data is changed — not only in the UI.

---

#### User Story — US-05b: Upload Project Documents & Media (Priority: P2)

**As a** District Manager or Block Manager  
**I want to** upload AOI files, beneficiary documents, plans, and photos/videos  
**So that** complete project records are stored centrally

**Applies to:** District Manager, Block Manager, Admin

**Why this priority:** Document attachments enrich project records but are not blocking for initial CRUD.

**Independent Delivery:** File uploads attach to project; visible in detail panel Documentation and Photo/Video tabs.

**Maps to:** FR-PROJ-04, FR-PROJ-05

**Acceptance Scenarios**:

1. **Given** I am on the project form, **When** I upload an AOI boundary file, **Then** it attaches to the project record.
2. **Given** I upload documents and media, **When** I view the project detail panel Documentation and Photo/Video tabs, **Then** uploaded files are listed or previewed.
3. **Given** I upload an unsupported file type or oversized file, **When** validation runs, **Then** I see a clear error before upload proceeds.

---

#### User Story — US-05c: Search and Browse Project List (Priority: P2)

**As an** authorized user  
**I want to** search the project sidebar by name, location, scheme, or beneficiary  
**So that** I can quickly find a specific project among many

**Applies to:** All roles

**Why this priority:** Search improves efficiency when many projects exist in a jurisdiction.

**Independent Delivery:** Sidebar search filters project list within one second by activity name, location, scheme type, or beneficiary.

**Maps to:** FR-DASH-05, FR-DASH-07

**Acceptance Scenarios**:

1. **Given** multiple projects are listed, **When** I type in the search box, **Then** the list filters within one second matching activity name, location, scheme type, or beneficiary.
2. **Given** search returns no matches, **When** the list is empty, **Then** I see a friendly "no projects found" message.

---

### Epic E-06 — API Integration & Platform

#### User Story — US-06: API-Backed Production Data (Priority: P1)

**As a** system operator  
**I want** all auth, jurisdiction, project, and analytics data served via backend services  
**So that** the application is multi-user safe and production-ready

**Applies to:** Platform (enables all user journeys)

**Why this priority:** Production go-live requires replacing local demo data with shared backend services.

**Independent Delivery:** All operational data flows through backend services with session credentials on protected requests and server-side role filtering.

**Maps to:** FR-API-01, FR-API-02, FR-API-03, FR-API-04

**Acceptance Scenarios**:

1. **Given** production mode, **When** any feature loads operational data, **Then** it uses backend services — not local browser storage for production datasets.
2. **Given** integration documentation is published, **When** a feature is integrated, **Then** service contracts and request/response schemas are available for reference.
3. **Given** I am logged in, **When** the application requests protected data, **Then** my session credential is included on each request.
4. **Given** role-based filtering, **When** the backend returns data, **Then** unauthorized records are never returned regardless of client manipulation.

**Service availability:** Login and jurisdiction filters available; project CRUD, analytics, and file upload pending.

**Business rule (BR-07):** Presentation MUST NOT access data services directly — all data flows through defined application workflows (per architecture authorization model).

---

#### User Story — US-06a: Graceful Errors & Loading States (Priority: P2)

**As a** user on a government network  
**I want to** clear loading indicators and error messages when services fail  
**So that** I know whether to retry or contact support

**Applies to:** All roles

**Why this priority:** Government networks can be slow or unreliable; users need clear feedback.

**Independent Delivery:** Loading indicators during data fetch; user-friendly error messages on failure.

**Maps to:** FR-API-05, FR-API-06

**Acceptance Scenarios**:

1. **Given** a service call is in progress, **When** I wait for data, **Then** I see a loading indicator on the affected section.
2. **Given** the network is unavailable, **When** a request fails, **Then** I see a user-friendly message — not a raw technical error.
3. **Given** login returns a business failure, **When** the response is displayed, **Then** the message from the service is shown to the user.

---

#### User Story — US-06b: Production Web Server Deployment (Priority: P2)

**As a** DevOps engineer  
**I want** the application deployed on the government web server with deep-link routing  
**So that** users can access ProjectGeo in production

**Applies to:** Platform operations

**Why this priority:** Required for production access but not for functional MVP validation in development.

**Independent Delivery:** Production build deploys with routing configuration; direct navigation to home and projects pages works without server errors.

**Maps to:** NFR-07

**Acceptance Scenarios**:

1. **Given** the production build is deployed with server routing configuration, **When** users navigate directly to the home dashboard or projects page, **Then** pages load without server 404 errors.
2. **Given** HTTPS is configured on the server, **When** users access the application, **Then** all service calls use secure connections.

---

### Epic E-07 — Navigation, UI & Accessibility

#### User Story — US-07: Figma-Aligned UI (Priority: P1)

**As a** government user  
**I want** the application to match approved Figma designs  
**So that** the interface is consistent, professional, and easy to use

**Applies to:** All roles

**Why this priority:** Design parity is an explicit stakeholder acceptance criterion.

**Independent Delivery:** Login, dashboard, map panels, and project form screens match approved designs at ≥ 90%.

**Maps to:** FR-NAV-03

**Acceptance Scenarios**:

1. **Given** approved designs for login, dashboard, map panels, and project form, **When** implemented screens are reviewed, **Then** layout, typography, colors, and component spacing match at least 90%.
2. **Given** existing brand elements, **When** UI is updated, **Then** Orbitron "Project Geo" branding and navbar gradient are preserved unless designs specify otherwise.

---

#### User Story — US-07a: App Navigation & Header (Priority: P2)

**As a** logged-in user  
**I want to** consistent header navigation between Home and Projects  
**So that** I can move between monitoring and project management easily

**Applies to:** All logged-in roles

**Why this priority:** Navigation supports the monitor → manage journey but home dashboard alone is usable without it initially.

**Independent Delivery:** Header shows Home, Projects, user name, theme toggle, and logout across pages.

**Maps to:** FR-NAV-01, FR-NAV-02

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view the header, **Then** I see links to Home and Projects plus my user name and logout.
2. **Given** I toggle theme in the user menu, **When** dark/light mode switches, **Then** the preference applies across pages.

---

#### User Story — US-07b: Responsive Desktop & Tablet Layout (Priority: P2)

**As a** user on a tablet or laptop  
**I want to** the dashboard and forms to remain usable at common screen sizes  
**So that** I can work in field offices without a large monitor

**Applies to:** All roles

**Why this priority:** Field office tablet use is common but desktop is the primary target for v1.

**Independent Delivery:** Dashboard and project forms remain usable at viewport widths ≥ 768px.

**Maps to:** FR-NAV-04, NFR-05

**Acceptance Scenarios**:

1. **Given** viewport width is at least 768px, **When** I use the dashboard, **Then** map and sidebar layout adapts without broken horizontal scrolling.
2. **Given** form fields on the projects page, **When** viewed on tablet, **Then** labels, inputs, and the stepper remain readable and tappable.

---

### Edge Cases

| # | Scenario | Expected behavior | Related stories |
|---|----------|-------------------|-----------------|
| EC-01 | Login returns success=false in normal response | Treat as failure; show message from response body | US-01 |
| EC-02 | Applicable district list returns empty | District dropdown empty; block dropdown disabled | US-02c |
| EC-03 | Session expires mid-workflow | Redirect to login; optional return URL after re-auth | US-01a |
| EC-04 | Boundary name mismatch with dropdown values | Case-insensitive match; log unmatched for admin | US-03a, US-02c |
| EC-05 | Project pin outside user's block but inside district | Block Manager must not see pin | US-03, US-02b |
| EC-06 | Map loads before auth completes | Show loader; no jurisdiction-sensitive markers | US-03, US-01 |
| EC-07 | Home page accessed before map initializes | Page shell renders; map initializes only after session confirmed | US-03 |
| EC-08 | Large boundary datasets slow to load | Show map loading state; lazy-load blocks per district | US-03a |
| EC-09 | Analytics service timeout | Partial summary with census fallback where available | US-04a |
| EC-10 | User closes project panel while dragging | Panel closes cleanly; no orphaned handlers | US-03b |
| EC-11 | Concurrent district selection from dropdown and map | Last user action wins; UI stays consistent | US-02c, US-03a |
| EC-12 | Inactive user flag set | Login blocked with admin contact message | US-01 |

---

## Requirements *(mandatory)*

### Functional Requirements

Requirements are grouped by domain; each maps to user stories listed in `user-story.md` §9 traceability.

**Authentication & Session (US-01, US-01a, US-01b)**

- **FR-AUTH-01**: System MUST provide secure login using User ID and password; inactive accounts MUST be blocked.
- **FR-AUTH-02**: System MUST persist authenticated session and restore it on page reload until expiry.
- **FR-AUTH-03**: System MUST attach user role and applicable state(s), district(s), and block(s) to session context.
- **FR-AUTH-04**: System MUST restrict pages and data based on role and jurisdiction; backend MUST enforce scope.
- **FR-AUTH-05**: System MUST provide logout that clears session, profile, and jurisdiction cache.
- **FR-AUTH-06**: System MUST redirect unauthenticated users to the login page.

**Dashboard & Filters (US-02, US-02a, US-02b, US-02c, US-05c)**

- **FR-DASH-01**: After login, users MUST see a dashboard with map and project sidebar.
- **FR-DASH-02**: Dashboard MUST show projects filtered by role and jurisdiction.
- **FR-DASH-03**: Users MUST filter using linked state, district, and block selectors from applicable-area services.
- **FR-DASH-04**: State Managers MUST select any applicable district; District/Block Managers MUST see only assigned areas.
- **FR-DASH-05**: Project sidebar MUST support search by activity name, location, scheme type, or beneficiary (P2).
- **FR-DASH-06**: Dashboard MUST display project count badge and scheme/type breakdown (P2).
- **FR-DASH-07**: Sidebar project selection MUST center map on pin and open detail panel.
- **FR-DASH-09**: Users MUST switch map base layers without losing markers or boundaries (P2).

**Map & Geography (US-03, US-03a, US-03b, US-03c)**

- **FR-MAP-01**: System MUST render an interactive map as the primary geographic view.
- **FR-MAP-02**: System MUST display state, district, and block administrative boundaries.
- **FR-MAP-03**: District boundary click MUST highlight, zoom, load child blocks, and start district summary.
- **FR-MAP-04**: Block boundary click MUST highlight and start block-level summary.
- **FR-MAP-05**: System MUST plot project markers within user's visible scope only.
- **FR-MAP-06**: Project marker click MUST open tabbed detail panel (Info, Beneficiaries, Documentation, Photo/Video).
- **FR-MAP-07**: Map MUST sync bidirectionally with geographic dropdown selections.
- **FR-MAP-08**: Initial map viewport MUST auto-fit by role (state, district, or block view).
- **FR-MAP-09**: Marker tooltips MUST show project name and location on hover (P2).
- **FR-MAP-10**: Arunachal Pradesh block boundary layer MUST include census attributes for analytics fallback.
- **FR-MAP-11**: Map MUST remain performant with large boundary datasets via lazy loading (P2).

**Area Analytics (US-04, US-04a, US-04b)**

- **FR-ANLY-01**: System MUST show area summary panel on geographic selection.
- **FR-ANLY-02**: Summary MUST include gender comparison chart.
- **FR-ANLY-03**: Summary MUST include caste/community distribution chart with legend.
- **FR-ANLY-04**: Summary MUST include water report with charts and key indicators.
- **FR-ANLY-05**: Summary MUST include soil report with charts.
- **FR-ANLY-06**: All summary metrics MUST be graphical — not raw tables only.
- **FR-ANLY-07**: Summary data MUST scope to selected geography in state → district → block hierarchy.
- **FR-ANLY-08**: Summary panel MUST show total population and geography metadata.
- **FR-ANLY-09**: Demographic charts MAY use census boundary fallback when analytics unavailable (P2).
- **FR-ANLY-10**: Summary panel MUST be dismissible and non-blocking.

**Project Management (US-05, US-05a, US-05b)**

- **FR-PROJ-01**: District Managers, Block Managers, and Admin MUST create projects via multi-step form; State Managers are view-only.
- **FR-PROJ-02**: Form MUST capture project name, activity, scheme type, location, coordinates, district, block, costs, fund type, beneficiary details.
- **FR-PROJ-03**: Users MUST define location by map click or coordinate entry.
- **FR-PROJ-04**: Users MAY upload AOI boundary files (P2).
- **FR-PROJ-05**: Users MAY upload supporting documents and media (P2).
- **FR-PROJ-06**: District Managers, Block Managers, and Admin MUST edit projects within jurisdiction.
- **FR-PROJ-07**: System MUST validate required fields before submission.
- **FR-PROJ-08**: New/edited projects MUST appear on map and sidebar immediately after save.
- **FR-PROJ-09**: Full project page MUST be openable in new tab from map panel (P2).
- **FR-PROJ-10**: System MUST support predefined scheme catalog with custom entries (P2).

**Platform & Services (US-06, US-06a, US-06b)**

- **FR-API-01**: System MUST consume backend services for auth, jurisdiction, projects, geography, analytics, and files.
- **FR-API-02**: Production MUST NOT use local browser storage for operational datasets.
- **FR-API-03**: Protected requests MUST include session credentials; backend MUST enforce role filtering.
- **FR-API-04**: Service contracts MUST be documented for integration.
- **FR-API-05**: System MUST handle service errors with user-friendly messages (P2).
- **FR-API-06**: System MUST show loading indicators during service calls (P2).

**Navigation & UI (US-07, US-07a, US-07b)**

- **FR-NAV-01**: Application MUST provide login, home, projects, and map routes.
- **FR-NAV-02**: Header MUST show Home, Projects, user menu with theme toggle and logout (P2).
- **FR-NAV-03**: UI MUST align with approved Figma design specifications.
- **FR-NAV-04**: Application MUST support responsive desktop and tablet layout (P2).

**Business Architecture Rules (from architecture.md §8.2 — behavioral)**

- **BR-04**: Data scope enforcement MUST occur in business logic and backend — not UI-only.
- **BR-05**: Map MUST NOT render jurisdiction-sensitive content before auth and jurisdiction are established.
- **BR-06**: Write operations MUST be authorized in business logic before data changes.
- **BR-07**: Presentation MUST delegate data access to application workflows — no direct data service calls.

### Key Entities

- **User**: Official with User ID, name, role, account group, active status, applicable jurisdiction.
- **Session**: Time-limited authenticated context with role and jurisdiction; cleared on logout.
- **Applicable Area**: Server-returned states, districts, or blocks a user may access.
- **State / District / Block**: Administrative hierarchy; initial deployment Arunachal Pradesh; UI uses **Block** label.
- **Project**: Scheme record with location, coordinates, costs, beneficiary details, optional attachments.
- **Area Summary**: Demographics and resource analytics scoped to selected geography.
- **Scheme Catalog**: Predefined schemes (MGNREGA, PHED, PMGSY, etc.) with optional custom entries.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

| ID | Criterion | Primary stories |
|----|-----------|-----------------|
| SC-001 | State Managers can view projects for 100% of districts in their applicable list | US-02 |
| SC-002 | Zero cross-jurisdiction data leaks for State, District, Block users | US-01, US-02a, US-02b |
| SC-003 | Project detail panel opens from map pin within 2 seconds | US-03, US-03b |
| SC-004 | Area summary shows all four report types for district and block selection | US-04, US-04a, US-04b |
| SC-005 | Authorized users complete project creation in ≤ 10 minutes | US-05 |
| SC-006 | Zero production features depend on local browser storage | US-06 |
| SC-007 | Key screens achieve ≥ 90% match to approved Figma designs | US-07 |
| SC-008 | 95% of valid login attempts reach home dashboard on first try | US-01 |
| SC-009 | Project sidebar search returns results within 1 second (≤ 500 projects) | US-05c |

---

## Assumptions

- Each user story journey in this spec maps 1:1 to `user-story.md` stories US-01 through US-07b.
- Login uses **User ID**, not email. State Managers are **view-only** for project create/edit (US-05, US-05a); District/Block Managers and Admin retain CRUD per role matrix §5.
- Login and jurisdiction services are available; project CRUD, analytics, and file upload services are pending.
- Water/soil indicators display as provided by backend; empty states when absent.
- Census boundary attributes serve as demographic fallback (US-04a).
- Date-based dashboard filtering deferred to P3.
- **Out of scope v1:** Native mobile apps, offline maps, real-time collaboration, SMS/email, multi-state admin UI, advanced GIS editing, payment tracking.

## Dependencies

- Authentication service (available).
- Applicable state/district/block services (available).
- Project CRUD, analytics, file upload services (pending).
- Arunachal Pradesh boundary data with census attributes.
- Approved Figma design files.
- Government web server with HTTPS and deep-link routing.
