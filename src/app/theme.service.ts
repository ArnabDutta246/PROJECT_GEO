import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  // Signal to track current theme
  private readonly _currentTheme = signal<Theme>(this.getInitialTheme());

  // Public readonly signal
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    // Apply theme on initialization and when theme changes
    effect(() => {
      const theme = this._currentTheme();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });

    // Listen to system theme changes (only if no manual preference is saved)
    if (isPlatformBrowser(this.platformId)) {
      this.setupSystemThemeListener();
    }
  }

  /**
   * Setup listener for system theme preference changes
   */
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Only listen to system changes if user hasn't manually set a preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return; // User has a saved preference, don't listen to system
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        // Only update if user hasn't manually set a preference
        this._currentTheme.set(e.matches ? 'dark' : 'light');
      }
    };

    // Use addEventListener if available, otherwise fallback to addListener
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    } else {
      // Fallback for older browsers
      this.mediaQuery.addListener(this.mediaQueryListener);
    }
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }

    return 'light';
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: Theme): void {
    // Check if we're in a browser environment
    if (typeof this.document === 'undefined' || !this.document.documentElement) {
      return;
    }

    const htmlElement = this.document.documentElement;
    const bodyElement = this.document.body;

    if (theme === 'dark') {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
      bodyElement.classList.add('dark-theme');
      bodyElement.classList.remove('light-theme');
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
      bodyElement.classList.add('light-theme');
      bodyElement.classList.remove('dark-theme');
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this._currentTheme() === 'dark';
  }
}

