import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MapFacade } from '@presentation/features/map/map.facade';

@Component({
  selector: 'app-home-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-map.component.html',
  styleUrl: './home-map.component.scss',
})
export class HomeMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;

  protected readonly mapFacade = inject(MapFacade);
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Defer until the flex layout assigns the map workspace its final size.
    requestAnimationFrame(() => {
      void this.mapFacade.initialize(this.mapContainer.nativeElement).then(() => {
        this.scheduleInvalidateSize();
      });
    });
  }

  ngOnDestroy(): void {
    this.mapFacade.destroy();
  }

  private scheduleInvalidateSize(): void {
    this.mapFacade.invalidateSize();
    setTimeout(() => this.mapFacade.invalidateSize(), 100);
    setTimeout(() => this.mapFacade.invalidateSize(), 400);
  }
}
