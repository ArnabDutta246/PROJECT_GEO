# Feature Specification: Interactive Map with Project Pins

**Feature Branch**: `003-interactive-map-pins`  
**Created**: 2026-05-23  
**Status**: Draft  
**Input**: User description: "US-03 — Interactive Map with Project Pins (P1) from user-story.md"

**Parent platform:** Slice of ProjectGeo geo-monitoring platform (Epic E-03). Depends on authenticated home dashboard (US-01, US-02) and geographic filters (US-02c). Boundary layers (US-03a), full tabbed detail panel (US-03b), and base layer switcher (US-03c) are separate features.

---

## User Scenarios *(mandatory)*

### User Story 1 — View In-Scope Project Pins on Map (Priority: P1)

**As an** authorized user  
**I want to** see project pins on an interactive map at their geographic locations  
**So that** I understand where development work is happening in my jurisdiction

**Applies to:** State Manager, District Manager, Block Manager, Admin (pins filtered by role jurisdiction)

**Why this priority:** The map with project pins is the primary geographic monitoring interface and core product value.

**Independent Delivery:** After login, the home dashboard displays an interactive map with markers for all in-scope projects that have valid coordinates. Verifiable without boundary layers or full project detail tabs.

**Maps to:** FR-MAP-01, FR-MAP-05, FR-MAP-08

**Acceptance Scenarios**:

1. **Given** I am on the home dashboard after authentication completes, **When** the map loads, **Then** an interactive map renders as the primary geographic view with project markers at coordinates within my jurisdiction scope.
2. **Given** I am a State Manager, **When** the map renders, **Then** I see project pins for all projects in my applicable state scope (subject to active geographic filter selection).
3. **Given** I am a District Manager, **When** the map renders, **Then** I see only project pins within my assigned district(s) — not pins from other districts.
4. **Given** I am a Block Manager, **When** the map renders, **Then** only pins for my assigned block(s) are shown — not statewide or district-wide pins.
5. **Given** my role determines initial viewport scope, **When** the map first loads, **Then** the viewport auto-fits to show my applicable geographic area (state view, district view, or block view as appropriate).

**Business rule (BR-05):** The map MUST NOT render jurisdiction-sensitive project markers before authentication and jurisdiction context are established.

---

### User Story 2 — Discover Projects via Pin Hover and Click (Priority: P1)

**As an** authorized user  
**I want to** hover and click project pins to preview and open project details  
**So that** I can quickly identify and inspect projects on the map

**Why this priority:** Pin interaction is the primary path from geographic view to project information.

**Independent Delivery:** Hovering a pin shows a tooltip; clicking opens a project summary panel without changing geographic filter state.

**Maps to:** FR-MAP-05, FR-DASH-07 (partial — summary panel only; full tabs are US-03b)

**Acceptance Scenarios**:

1. **Given** project markers are visible on the map, **When** I hover over a pin, **Then** a tooltip displays the project name and location address (when available).
2. **Given** I click a project pin, **When** the summary panel opens, **Then** I see key project information (name, scheme type, location, district, block) without losing my current district or block filter selection.
3. **Given** the project summary panel is open, **When** I close it, **Then** the map viewport, geographic filters, and visible pins remain unchanged.
4. **Given** a project has no location address on record, **When** I hover its pin, **Then** the tooltip shows the project name and indicates location is unavailable (no error or blank crash).

---

### User Story 3 — Select Projects from Sidebar with Map Sync (Priority: P1)

**As an** authorized user  
**I want to** select a project from the sidebar and have the map focus on that project  
**So that** I can navigate from list to map location seamlessly

**Why this priority:** Bidirectional list-map navigation is essential for monitoring workflows where users browse projects in the sidebar.

**Independent Delivery:** Selecting a project in the sidebar centers the map on that project's pin and opens the same summary panel as pin click.

**Maps to:** FR-DASH-07, FR-MAP-07 (partial — project selection sync; full dropdown-boundary sync is US-02c)

**Acceptance Scenarios**:

1. **Given** I select a project from the project sidebar, **When** the selection is applied, **Then** the map centers on that project's pin and opens the project summary panel.
2. **Given** the selected project's pin is outside the current viewport, **When** I select it from the sidebar, **Then** the map pans or zooms to bring that pin into view.
3. **Given** I have an active district or block filter, **When** I select a project from the sidebar, **Then** my geographic filter selection is preserved (not reset).
4. **Given** geographic dropdown selections change the visible project set, **When** filters update, **Then** only pins for projects matching the current filter and jurisdiction are displayed on the map.

---

### Edge Cases

- What happens when a project in scope has missing or invalid coordinates? The project MAY appear in the sidebar but MUST NOT render a map pin; no map error occurs.
- What happens when no in-scope projects have coordinates? The map renders empty of pins with an appropriate empty-state message; geographic viewport still auto-fits to user scope.
- What happens when multiple projects share the same or very close coordinates? Pins remain selectable; hover and click target the intended project (clustering or offset behavior acceptable if all projects remain reachable).
- What happens when project data is still loading? The map shows a loading state for pins; the base map MAY render immediately once jurisdiction context is ready.
- What happens when the user changes geographic filters while a summary panel is open? The panel closes or updates to reflect the new filter context; filters apply without map crash.
- What happens when a Block Manager's scope contains zero projects? Map renders with no pins and sidebar shows empty state; viewport still fits to assigned block.
- What happens when project list API returns an error? User sees a friendly error message; map base view remains usable without stale or unauthorized pins.

---

## Requirements *(mandatory)*

### Functional Requirements

**Map Display & Scope**

- **FR-001**: System MUST render an interactive map as the primary geographic view on the home dashboard.
- **FR-002**: System MUST plot project location markers only for projects within the authenticated user's jurisdiction scope.
- **FR-003**: System MUST filter visible map pins when geographic dropdown selections (state, district, block) change, showing only matching in-scope projects.
- **FR-004**: Initial map viewport MUST auto-fit based on user role — state-wide view for State Manager, district view for District Manager, block view for Block Manager.
- **FR-005**: System MUST NOT display jurisdiction-sensitive project markers before authentication and jurisdiction context are established.

**Pin Interaction**

- **FR-006**: System MUST show a tooltip on pin hover displaying project name and location address when available.
- **FR-007**: System MUST open a project summary panel when a user clicks a project pin, showing at minimum: project name, scheme type, location, district, and block.
- **FR-008**: Opening or closing the project summary panel MUST NOT reset geographic filter selections or map filter state.
- **FR-009**: System MUST exclude projects with missing or invalid coordinates from map rendering while allowing them in the sidebar list if otherwise in scope.

**Sidebar–Map Sync**

- **FR-010**: Selecting a project in the sidebar MUST center the map on that project's pin and open the project summary panel.
- **FR-011**: Map pin visibility MUST stay consistent with the sidebar project list for the current jurisdiction and geographic filter context.

**Performance & Feedback**

- **FR-012**: Project summary panel MUST open within 2 seconds of pin click or sidebar selection under normal network conditions.
- **FR-013**: System MUST show loading indicators while project pin data is being fetched.
- **FR-014**: System MUST handle project data service errors with user-friendly messages without breaking the map view.

### Key Entities

- **Project**: A development scheme record with name, scheme type, location address, geographic coordinates, district, block, and jurisdiction identifiers. Only projects with valid coordinates appear as map pins.
- **Project Pin**: A map marker representing a project's geographic location; visible only when the project is in the user's jurisdiction and matches active filters.
- **Project Summary Panel**: A dismissible overlay or side panel showing key project fields when a pin is clicked or a sidebar project is selected. Full tabbed detail (beneficiaries, documents, media) is out of scope for this feature (US-03b).
- **Geographic Filter Selection**: The user's current state, district, and/or block dropdown choices that constrain both sidebar project list and visible map pins.
- **Map Viewport**: The visible map area defined by center point and zoom level; auto-fits on load by role and adjusts when sidebar project selection requires panning.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of in-scope projects with valid coordinates appear as map pins within 3 seconds of dashboard load under normal network conditions.
- **SC-002**: Zero cross-jurisdiction pin leakage — Block Managers never see pins outside their block; District Managers never see pins outside their district.
- **SC-003**: Project summary panel opens within 2 seconds of pin click or sidebar project selection for 95% of interactions under normal network conditions.
- **SC-004**: 100% of pin hover actions display project name; location address shown when available without user-visible errors.
- **SC-005**: Selecting a project from the sidebar centers the corresponding pin in the visible map area within 1 second for 95% of interactions.
- **SC-006**: Closing the summary panel preserves geographic filter state in 100% of test scenarios (no unintended filter reset).
- **SC-007**: Users with zero mappable projects see a clear empty map state without errors or broken layout.

---

## Assumptions

- User is authenticated and jurisdiction context (role, applicable areas) is available before the map renders pins (depends on US-01, US-02).
- Geographic dropdown filters (US-02c) provide the filter context; this feature consumes filter state but does not own dropdown implementation.
- Project data is retrieved from backend services scoped by user jurisdiction; production does not use local browser storage for project datasets.
- Administrative boundary layers (district/block GeoJSON) are delivered by US-03a; this feature focuses on project pins and may render on a base map without boundary overlays.
- Full tabbed project detail panel (Info, Beneficiaries, Documentation, Photo/Video) is US-03b; this feature delivers a summary panel sufficient for acceptance scenario verification.
- Initial deployment geography is Arunachal Pradesh; patterns extend to other states without changing this feature's behavior.
- Map base layer switching (satellite, streets, hybrid) is US-03c and out of scope.

---

## Dependencies

| Dependency | Status | Relevance |
|------------|--------|-----------|
| US-01 — Authentication & session | Required | Jurisdiction context before pins render |
| US-02 / US-02a / US-02b — Role-scoped dashboard | Required | Viewport auto-fit and pin scope |
| US-02c — Cascading geographic filters | Required | Filter-driven pin visibility and map sync |
| Project list/detail services | Required | Pin data and summary panel content |
| US-03a — Boundary layers | Optional for MVP | Map works without boundaries; boundaries add context |
| US-03b — Tabbed detail panel | Future enhancement | Summary panel here; full tabs in US-03b |
| US-03c — Base layer switcher | Out of scope | Does not block pin functionality |

---

## Out of Scope

- District and block boundary GeoJSON layers (US-03a)
- Full tabbed project detail panel with beneficiaries, documentation, and media tabs (US-03b)
- Map base layer switcher — satellite, streets, hybrid (US-03c)
- Area summary analytics on geographic click (US-04)
- Project creation, editing, or deletion (US-05)
- Project sidebar search and scheme breakdown badges (US-05c — P2)
- Offline map mode, native mobile apps, real-time collaboration
