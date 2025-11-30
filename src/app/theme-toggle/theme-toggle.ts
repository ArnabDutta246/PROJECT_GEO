import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss'
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  readonly currentTheme = this.themeService.currentTheme;
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

