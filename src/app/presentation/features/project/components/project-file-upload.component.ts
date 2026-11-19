import { Component, HostListener, OnDestroy, PLATFORM_ID, inject, input, output, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FileWithPreview } from '../models/project-wizard.view-model';

interface ImagePreview {
  name: string;
  src: string;
}

@Component({
  selector: 'app-project-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-file-upload.component.html',
  styleUrl: './project-file-upload.component.scss',
})
export class ProjectFileUploadComponent implements OnDestroy {
  readonly title = input('Upload files');
  readonly hint = input('Drag and drop files here or');
  readonly accept = input('*/*');
  readonly multiple = input(true);
  readonly files = input<FileWithPreview[]>([]);
  readonly listOnly = input(false);

  readonly fileChange = output<Event>();
  readonly fileRemove = output<FileWithPreview>();

  protected readonly imagePreview = signal<ImagePreview | null>(null);

  private readonly platformId = inject(PLATFORM_ID);
  private previewObjectUrl: string | null = null;

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  protected triggerBrowse(input: HTMLInputElement): void {
    input.click();
  }

  protected viewFile(item: FileWithPreview): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.isImage(item)) {
      this.openImageModal(item);
      return;
    }

    this.openInNewTab(item.file);
  }

  protected closeImageModal(): void {
    this.imagePreview.set(null);
    this.revokePreviewUrl();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.imagePreview()) {
      this.closeImageModal();
    }
  }

  private isImage(item: FileWithPreview): boolean {
    if (item.type === 'image' || item.file.type.startsWith('image/')) {
      return true;
    }
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(item.file.name);
  }

  private openImageModal(item: FileWithPreview): void {
    this.revokePreviewUrl();
    const src = URL.createObjectURL(item.file);
    this.previewObjectUrl = src;
    this.imagePreview.set({ name: item.file.name, src });
  }

  private openInNewTab(file: File): void {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  private revokePreviewUrl(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }
}
