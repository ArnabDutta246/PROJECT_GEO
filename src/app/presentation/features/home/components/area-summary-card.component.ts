import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaSummaryViewModel } from '@presentation/features/map/models/area-summary.view-model';

@Component({
  selector: 'app-area-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-summary-card.component.html',
  styleUrl: './area-summary-card.component.scss',
})
export class AreaSummaryCardComponent {
  readonly loading = input(false);
  readonly summary = input<AreaSummaryViewModel | null>(null);
  readonly cleared = output<void>();

  onClear(): void {
    this.cleared.emit();
  }
}
