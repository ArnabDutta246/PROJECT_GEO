import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectSummaryViewModel } from '@presentation/features/map/models/project-summary.view-model';

@Component({
  selector: 'app-project-summary-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-summary-panel.component.html',
  styleUrl: './project-summary-panel.component.scss',
})
export class ProjectSummaryPanelComponent {
  readonly summary = input<ProjectSummaryViewModel | null>(null);
  readonly open = input(false);
  readonly closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}
