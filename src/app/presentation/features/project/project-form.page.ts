import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapForInsert } from '../../../project/map-for-insert/map-for-insert';
import { ProjectFormFacade } from './project-form.facade';
import { ProjectStepperComponent } from './components/project-stepper.component';
import { ProjectFormActionsComponent } from './components/project-form-actions.component';
import { StepActivityLocationComponent } from './components/step-activity-location.component';
import { StepBeneficiariesComponent } from './components/step-beneficiaries.component';
import { StepDocumentationComponent } from './components/step-documentation.component';
import { StepMediaComponent } from './components/step-media.component';
import { StepReviewComponent } from './components/step-review.component';

@Component({
  selector: 'app-project-form-page',
  standalone: true,
  imports: [
    CommonModule,
    MapForInsert,
    ProjectStepperComponent,
    ProjectFormActionsComponent,
    StepActivityLocationComponent,
    StepBeneficiariesComponent,
    StepDocumentationComponent,
    StepMediaComponent,
    StepReviewComponent,
  ],
  templateUrl: './project-form.page.html',
  styleUrl: './project-form.page.scss',
})
export class ProjectFormPage implements AfterViewInit {
  protected readonly facade = inject(ProjectFormFacade);
  private readonly router = inject(Router);

  @ViewChild(MapForInsert) mapComponent!: MapForInsert;

  ngAfterViewInit(): void {
    this.facade.setMapComponent(this.mapComponent);
    void this.facade.initialize(this.mapComponent);
  }

  protected get stepSubtitle(): string {
    return this.facade.currentStep() === 5
      ? 'Check all project related details carefully'
      : 'Fill all project related details';
  }

  protected get stepTitle(): string {
    return this.facade.getStepTitle(this.facade.currentStep());
  }

  protected get geographicLevelLabel(): string {
    const stateId = this.facade.formData().selectedStateId;
    if (!stateId) {
      return 'Select State';
    }
    return this.facade.stateOptions().find((state) => state.id === stateId)?.label ?? 'Select State';
  }

  protected goHome(): void {
    void this.router.navigate(['/home']);
  }
}
