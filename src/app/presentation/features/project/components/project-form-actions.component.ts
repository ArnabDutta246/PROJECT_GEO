import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormFacade } from '../project-form.facade';

@Component({
  selector: 'app-project-form-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-form-actions.component.html',
  styleUrl: './project-form-actions.component.scss',
})
export class ProjectFormActionsComponent {
  protected readonly facade = inject(ProjectFormFacade);

  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly submitting = input(false);

  protected get showBack(): boolean {
    return this.currentStep() > 1;
  }

  protected get primaryLabel(): string {
    if (this.currentStep() === 4) {
      return 'GO FOR REVIEW';
    }
    if (this.currentStep() === this.totalSteps()) {
      return this.submitting() ? 'Submitting…' : 'SUBMIT';
    }
    return 'GO TO NEXT STEP';
  }

  protected get primaryIsSubmit(): boolean {
    return this.currentStep() === this.totalSteps();
  }

  protected onPrimary(): void {
    if (this.currentStep() === 4) {
      this.facade.goForReview();
      return;
    }
    if (this.currentStep() === this.totalSteps()) {
      this.facade.submitForm();
      return;
    }
    this.facade.nextStep();
  }
}
