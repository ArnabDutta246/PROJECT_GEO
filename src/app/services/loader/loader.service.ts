import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _isLoading = signal<boolean>(true);

  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Show the loader
   */
  show(): void {
    this._isLoading.set(true);
  }

  /**
   * Hide the loader
   */
  hide(): void {
    this._isLoading.set(false);
  }

  /**
   * Toggle loader state
   */
  toggle(): void {
    this._isLoading.update(value => !value);
  }
}

