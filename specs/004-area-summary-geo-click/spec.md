# Feature Specification: Area Summary on Geographic Click

**Feature Branch**: `004-area-summary-geo-click`  
**Created**: 2026-05-23  
**Status**: Draft  
**Input**: User description: "US-04 — Area Summary on Geographic Click (P1) from user-story.md"

**Parent platform:** Slice of ProjectGeo geo-monitoring platform (Epic E-04). Depends on authenticated home dashboard (US-01, US-02), interactive map (US-03), and district/block boundary layers (US-03a). Gender/caste charts (US-04a) and water/soil reports (US-04b) are separate features that extend the Regional Statistics sidebar.

**UX decision (2026-05-23):** Area summary appears as a **compact card in the Regional Statistics sidebar** — not a separate map overlay or modal.

---

## User Scenarios *(mandatory)*

### User Story 1 — Show Area Summary on Geographic Selection (Priority: P1)

**As an** authorized user  
**I want to** click a district, block, or map area and see summary information in the Regional Statistics section  
**So that** I understand local demographics and resource conditions before planning work

**Applies to:** State Manager, District Manager, Block Manager, Admin (summary scoped to selected geography within jurisdiction)

**Why this priority:** The area summary card is the entry point for all geographic analytics in the dashboard sidebar and supports scheme planning alongside project monitoring.

**Independent Delivery:** After login, clicking a district or block boundary on the home map updates a selected-area card at the top of Regional Statistics with geography names and total population. Verifiable without gender/caste charts or water/soil reports (US-04a, US-04b).

**Maps to:** FR-ANLY-01, FR-ANLY-10

**Acceptance Scenarios**:

1. **Given** I am on the home dashboard with boundary layers visible, **When** I click a district boundary, **Then** the Regional Statistics section shows a selected-area card with the district's geography context.
2. **Given** block boundaries are visible on the map, **When** I click a block boundary, **Then** the Regional Statistics card updates scoped to that block.
3. **Given** I click a point on the map inside a visible administrative boundary, **When** the containing district or block can be determined, **Then** the Regional Statistics card shows that administrative unit.
4. **Given** I have selected an area, **When** I view the dashboard, **Then** the summary appears in the sidebar Regional Statistics section — not as a separate map modal or overlay.

**Business rule (BR-05):** The area summary MUST NOT display jurisdiction-sensitive analytics before authentication and jurisdiction context are established.

---

### User Story 2 — View Scoped Geography Metadata and Population (Priority: P1)

**As an** authorized user  
**I want to** see state, district, block names and total population for my selected area in the Regional Statistics card  
**So that** I know exactly which geography I am analyzing and its population size

**Why this priority:** Geography metadata and population are the minimum viable analytics content required before charts and resource reports are added.

**Independent Delivery:** Selecting any in-scope district or block displays correct hierarchy labels and a total population figure scoped to the selection in the sidebar card.

**Maps to:** FR-ANLY-07, FR-ANLY-08

**Acceptance Scenarios**:

1. **Given** I select a district on the map, **When** the card loads, **Then** I see state name, district name, and total population for that district.
2. **Given** I select a block on the map, **When** the card loads, **Then** I see state name, district name, block name, and total population for that block only.
3. **Given** I selected a block, **When** summary loads, **Then** all metrics scope to that block only — not statewide or district-wide aggregates.
4. **Given** I selected a district (without a specific block), **When** summary loads, **Then** population and metadata reflect the district level — block name is omitted or shown as not applicable.
5. **Given** district or block names differ in casing between map boundaries and filter labels, **When** the card displays, **Then** names are shown in a human-readable, consistent format regardless of source casing.

---

### User Story 3 — Clear or Change Selection Without Losing Map Context (Priority: P1)

**As an** authorized user  
**I want to** clear or change the selected area while keeping my map view intact  
**So that** I can continue exploring projects and geography without losing my place

**Why this priority:** Non-destructive selection changes are essential for map-first monitoring workflows where users browse analytics repeatedly from the sidebar.

**Independent Delivery:** Clearing the card or clicking a different area returns/updates sidebar content without resetting map viewport, filters, or pins.

**Maps to:** FR-ANLY-10

**Acceptance Scenarios**:

1. **Given** a selected-area card is visible, **When** I click clear, **Then** the card is removed (placeholder shown) and the map viewport, geographic filters, boundary highlights, and project pins remain unchanged.
2. **Given** a selected-area card is visible, **When** I click a different district or block on the map, **Then** the card updates to the newly selected area without resetting unrelated map state.
3. **Given** I have an active district or block filter from the dashboard selectors, **When** I select or clear an area on the map, **Then** my filter selection is preserved.

---

### Edge Cases

- What happens when population data is temporarily unavailable for the selected area? The card shows geography metadata with a clear "population unavailable" message — not a broken layout or technical error.
- What happens when the user clicks a boundary outside their assigned jurisdiction? The system does not show out-of-scope analytics; the card does not update or shows an appropriate access state.
- What happens when the user clicks a project pin while an area is selected? The project detail panel may open on the map; the Regional Statistics area card remains visible with the current geographic selection.
- What happens when block-level census fallback data exists but the analytics service is down? Total population MAY be derived from boundary census attributes for block selections when authoritative analytics data is unavailable.
- What happens when the user clicks the same boundary twice in succession? The card remains visible with consistent data; map state is not reset.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update the Regional Statistics selected-area card when an authorized user selects a district or block via map boundary interaction.
- **FR-002**: System MUST update the selected-area card when an authorized user clicks a map location that falls within a known district or block boundary, resolving to the containing administrative unit.
- **FR-003**: Selected-area card MUST display state name, district name, and total population for district-level selections.
- **FR-004**: Selected-area card MUST display state name, district name, block name, and total population for block-level selections.
- **FR-005**: All summary metrics in this feature MUST scope strictly to the selected geography in the state → district → block hierarchy — block selections MUST NOT show statewide or district-wide aggregates.
- **FR-006**: Selected-area card MUST be clearable via an explicit clear control.
- **FR-007**: Clearing the selected-area card MUST preserve map viewport, geographic filter selections, boundary highlights, and visible project pins.
- **FR-008**: Selecting a different district or block while a card is shown MUST update card content to the new selection without resetting unrelated map state.
- **FR-009**: System MUST enforce jurisdiction scope for area summary data — users MUST NOT see analytics for geographies outside their assigned applicable areas.
- **FR-010**: When population data cannot be retrieved, the card MUST still show geography metadata and a user-friendly unavailable message for population.
- **FR-011**: Area summary MUST appear in the **Regional Statistics sidebar section** — not as a blocking map modal or full-screen overlay.
- **FR-012**: Area summary and project detail panel MAY be visible simultaneously — area summary in sidebar, project detail on map.

**Out of scope for this feature (covered by US-04a / US-04b):**

- Gender distribution charts (FR-ANLY-02)
- Caste/community distribution charts (FR-ANLY-03)
- Water resource reports (FR-ANLY-04)
- Soil reports (FR-ANLY-05)
- Graphical chart rendering requirements (FR-ANLY-06)

### Key Entities

- **Area Summary**: Analytics context for a selected geography, comprising hierarchy labels (state, district, block), total population, and a container for future report sections (charts, water, soil).
- **Geographic Selection**: User's current map interaction target — a district, block, or map point resolved to an administrative unit.
- **Administrative Hierarchy**: State → district → block nesting; block is the most granular level for population scoping in this feature.
- **Applicable Area**: Server-defined set of states, districts, or blocks the signed-in user may access; governs which geographic selections may show summary data.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see the selected-area card in Regional Statistics within 2 seconds of clicking a district or block boundary in 95% of interactions under normal network conditions.
- **SC-002**: 100% of in-scope district and block selections display the correct state, district, and block names (when applicable) in the sidebar card.
- **SC-003**: Zero instances where a block-level selection displays statewide or district-wide population totals in user acceptance testing.
- **SC-004**: 100% of card clear actions preserve the user's map zoom level, center point, and active geographic filters.
- **SC-005**: Users can identify the selected administrative area from card content alone without reading raw map coordinates.
- **SC-006**: When population data is unavailable, 100% of card renders show geography metadata plus a clear unavailable message — no blank cards or unhandled error states.

---

## Assumptions

- Users reach the area summary from the authenticated home dashboard map where district and block boundary layers are available (US-03a).
- Initial deployment covers Arunachal Pradesh; state name in the card reflects the configured deployment state.
- Total population is sourced from an analytics or demographics service in production; block boundary census attributes MAY serve as fallback for population when the service is unavailable (consistent with platform census fallback patterns).
- District and block name matching between map boundaries and dashboard filter labels is case-insensitive.
- The Regional Statistics sidebar shell created in this feature will be extended by US-04a (demographic charts) and US-04b (water/soil reports) without requiring users to re-select geography.
- "Map area" click means clicking anywhere within a visible boundary polygon, resolved to the most specific applicable administrative unit (block when block layer is active, otherwise district).
- Project pin interactions open the project detail panel on the map independently of the sidebar area summary card.

---

## Dependencies

| Dependency | Relationship |
|------------|--------------|
| US-01 — Secure login | Required — authenticated session and jurisdiction context |
| US-02 / US-02c — Dashboard filters | Required — filter state must be preserved when selection changes |
| US-03 — Interactive map | Required — map host for geographic selection |
| US-03a — Boundary layers | Required — district/block click triggers and census fallback attributes |
| US-04a — Gender & caste charts | Downstream — extends Regional Statistics sections below card |
| US-04b — Water & soil reports | Downstream — extends Regional Statistics sections below card |
