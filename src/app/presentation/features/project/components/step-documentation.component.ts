import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFormFacade } from '../project-form.facade';
import { ProjectFileUploadComponent } from './project-file-upload.component';

@Component({
  selector: 'app-step-documentation',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectFileUploadComponent],
  templateUrl: './step-documentation.component.html',
  styleUrl: './step-documentation.component.scss',
})
export class StepDocumentationComponent {
  protected readonly facade = inject(ProjectFormFacade);

  protected onFundTypeChange(value: string): void {
    if (value === 'OTHER') {
      this.facade.patchFormData({ fundType: 'OTHER' });
      return;
    }
    this.facade.patchFormData({ fundType: value });
  }

  protected onCustomFundTypeChange(value: string): void {
    this.facade.patchFormData({ fundType: value.trim() || 'OTHER' });
  }

  protected get selectedFundType(): string {
    const fundType = this.facade.formData().fundType;
    const known = this.facade.fundTypeOptions.some((item) => item.value === fundType);
    return known ? fundType : fundType ? 'OTHER' : '';
  }
}
