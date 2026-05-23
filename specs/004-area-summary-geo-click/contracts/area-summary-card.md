# Contract: Area Summary Card (Presentation)

**Feature**: `004-area-summary-geo-click`  
**Component**: `src/app/presentation/features/home/components/area-summary-card.component.ts`  
**Consumer**: `HomePage` — embedded in **Regional Statistics** sidebar section via `MapFacade` signals

---

## Component API

```typescript
@Component({
  selector: 'app-area-summary-card',
  standalone: true,
})
export class AreaSummaryCardComponent {
  readonly loading = input<boolean>(false);
  readonly summary = input<AreaSummaryViewModel | null>(null);
  readonly cleared = output<void>();
}
```

---

## Layout Contract

Compact card at the **top** of the Regional Statistics sidebar (`.sidebar-stats .stats-content`), above placeholder chart sections (US-04a/04b).

```text
┌─────────────────────────────┐
│ Regional Statistics         │
├─────────────────────────────┤
│ ┌ Selected Area Card ────┐  │
│ │ 📍 Block Name      [×] │  │
│ │ District, State        │  │
│ │ State: …  District: …  │  │
│ │ Block: …               │  │
│ │ Population: 12,345     │  │
│ └────────────────────────┘  │
│ Male/Female Population …    │
│ Caste Comparison …          │
│ (placeholders / US-04a/b)   │
└─────────────────────────────┘
```

When no area is selected, show a dashed placeholder prompt instead of the card.

---

## Content Rules

| Element | District scope | Block scope |
|---------|---------------|-------------|
| Card title | District name | Block name |
| Subtitle | State name | District, State |
| State row | ✅ | ✅ |
| District row | ✅ | ✅ |
| Block row | Hidden | ✅ Block name |
| Total population | District aggregate | Block `TOT_P` only |
| Population unavailable | Friendly message | Same |

---

## Interaction Contract

| Action | Event | MapFacade behavior |
|--------|-------|-------------------|
| Map block/district click | — | Updates card content in sidebar; map unchanged except highlight |
| Clear (×) button | `cleared.emit()` | `closeAreaSummary()` — no map refresh |
| Geography re-click | — | Card content updates in place |
| Project pin click | — | Project summary panel on map; area card remains in sidebar |

**No map overlay:** Area summary MUST NOT use a separate modal or map-side panel.

---

## Home Page Wiring

```html
<div class="stats-content">
  @if (facade.mapFacadeRef.hasAreaSelection()) {
    <app-area-summary-card
      [loading]="facade.mapFacadeRef.areaSummaryLoading()"
      [summary]="facade.mapFacadeRef.areaSummary()"
      (cleared)="closeAreaSummary()"
    />
  } @else {
    <section class="stat-block area-summary-placeholder">...</section>
  }
  <!-- existing chart placeholder sections -->
</div>
```

---

## Accessibility

- Root: `<section aria-label="Selected area summary">`
- Clear button: `aria-label="Clear selected area"`
- Loading: `aria-live="polite"`

---

## Out of Scope (US-04)

- Gender/caste chart components (US-04a) — update placeholder sections below card
- Water/soil reports (US-04b)
- Map overlay / side panel for area summary

Reserved `area-summary-card__charts-slot` for future inline extensions if needed.
