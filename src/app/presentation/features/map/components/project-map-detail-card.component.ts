import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PROJECT_DETAIL_TABS,
  PROJECT_IMAGE_PLACEHOLDER,
  ProjectDetailTabId,
  ProjectMapDetailCardViewModel,
  ProjectMapDetailTab,
} from '../models/project-map-detail-card.view-model';

@Component({
  selector: 'app-project-map-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-map-detail-card.component.html',
  styleUrl: './project-map-detail-card.component.scss',
})
export class ProjectMapDetailCardComponent {
  readonly detail = input<ProjectMapDetailCardViewModel | null>(null);
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly placeholderSrc = PROJECT_IMAGE_PLACEHOLDER;
  protected readonly tabOptions = PROJECT_DETAIL_TABS;
  protected readonly activeTab = signal<ProjectDetailTabId>('basic');

  constructor() {
    effect(() => {
      if (this.detail()?.id) {
        this.activeTab.set('basic');
      }
    });
  }

  protected selectTab(tabId: ProjectDetailTabId): void {
    this.activeTab.set(tabId);
  }

  protected activeTabContent(item: ProjectMapDetailCardViewModel): ProjectMapDetailTab | undefined {
    return item.tabs.find((tab) => tab.id === this.activeTab());
  }

  protected gallerySlots(item: ProjectMapDetailCardViewModel): Array<string | null> {
    const slots: Array<string | null> = [...item.galleryUrls];
    while (slots.length < 3) {
      slots.push(null);
    }
    return slots.slice(0, 3);
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.placeholderSrc;
  }
}
