import { Component } from '@angular/core';
import { ProjectFormPage } from '@presentation/features/project/project-form.page';

export type { IProjectData } from '@presentation/features/project/models/legacy-project-data';

/** @deprecated Use ProjectFormPage from presentation layer */
@Component({
  selector: 'app-insert-update-project',
  standalone: true,
  imports: [ProjectFormPage],
  template: '<app-project-form-page />',
})
export class InsertUpdateProject {}
