import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle';
import { Header } from "./header/header";
import { PreLoaderComponent } from './pre-loader/pre-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent, Header, PreLoaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('ProjectGeo');
  private themeService = inject(ThemeService);
  private router = inject(Router);
  showHeader = true;

  ngOnInit(): void {
    // Theme service will automatically initialize and apply theme
    // This injection ensures the service is instantiated
    
    // Check initial route
    this.updateHeaderVisibility(this.router.url);
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateHeaderVisibility(event.url);
      });
  }

  private updateHeaderVisibility(url: string): void {
    // Hide header on login page (empty path or '/login')
    this.showHeader = !(url === '/' || url === '/login');
  }
}
