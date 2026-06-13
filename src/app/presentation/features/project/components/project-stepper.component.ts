import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormFacade } from '../project-form.facade';

@Component({
  selector: 'app-project-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-stepper.component.html',
  styleUrl: './project-stepper.component.scss',
})
export class ProjectStepperComponent {
  protected readonly facade = inject(ProjectFormFacade);

  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly stepSelected = output<number>();

  protected selectStep(step: number): void {
    this.stepSelected.emit(step);
  }
}
