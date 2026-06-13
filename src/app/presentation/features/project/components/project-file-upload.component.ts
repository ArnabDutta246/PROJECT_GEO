import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileWithPreview } from '../models/project-wizard.view-model';

@Component({
  selector: 'app-project-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-file-upload.component.html',
  styleUrl: './project-file-upload.component.scss',
})
export class ProjectFileUploadComponent {
  readonly title = input('Upload files');
  readonly hint = input('Drag and drop files here or');
  readonly accept = input('*/*');
  readonly multiple = input(true);
  readonly files = input<FileWithPreview[]>([]);

  readonly fileChange = output<Event>();
  readonly fileRemove = output<FileWithPreview>();

  protected triggerBrowse(input: HTMLInputElement): void {
    input.click();
  }
}
