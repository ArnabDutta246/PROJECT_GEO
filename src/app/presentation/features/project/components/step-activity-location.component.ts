import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFormFacade } from '../project-form.facade';
import { ProjectFileUploadComponent } from './project-file-upload.component';

@Component({
  selector: 'app-step-activity-location',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectFileUploadComponent],
  templateUrl: './step-activity-location.component.html',
  styleUrl: './step-activity-location.component.scss',
})
export class StepActivityLocationComponent {
  protected readonly facade = inject(ProjectFormFacade);

  protected onCoordinateChange(): void {
    this.facade.onCoordinateChange();
  }
}
