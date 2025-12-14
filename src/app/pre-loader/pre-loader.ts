import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { LoaderService } from '../services/loader/loader.service';

@Component({
  selector: 'app-pre-loader',
  imports: [],
  templateUrl: './pre-loader.html',
  styleUrl: './pre-loader.scss'
})
export class PreLoaderComponent implements OnInit {
  private loaderService = inject(LoaderService);

  isLoading = this.loaderService.isLoading;
  isFadingOut = signal(false);

  constructor() {
    // Watch for loading state changes and trigger fade-out
    effect(() => {
      if (!this.loaderService.isLoading()) {
        // Trigger fade-out animation
        setTimeout(() => {
          this.isFadingOut.set(true);
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    // Automatically hide loader after initial load
    // You can customize this timing or trigger it based on your app's readiness
    // For example, wait for critical resources to load
    setTimeout(() => {
      this.loaderService.hide();
    }, 1500); // Adjust timing as needed - you can also trigger this based on app readiness
  }
}

