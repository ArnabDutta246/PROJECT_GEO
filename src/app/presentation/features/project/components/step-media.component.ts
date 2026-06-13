import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormFacade } from '../project-form.facade';
import { ProjectFileUploadComponent } from './project-file-upload.component';

@Component({
  selector: 'app-step-media',
  standalone: true,
  imports: [CommonModule, ProjectFileUploadComponent],
  templateUrl: './step-media.component.html',
  styleUrl: './step-media.component.scss',
})
export class StepMediaComponent {
  protected readonly facade = inject(ProjectFormFacade);
}
