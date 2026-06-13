import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormFacade } from '../project-form.facade';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-review.component.html',
  styleUrl: './step-review.component.scss',
})
export class StepReviewComponent {
  protected readonly facade = inject(ProjectFormFacade);

  protected jurisdictionLabel(id: number | null, options: Array<{ id: number; label: string }>): string {
    if (!id) {
      return '—';
    }
    return options.find((item) => item.id === id)?.label ?? String(id);
  }
}
