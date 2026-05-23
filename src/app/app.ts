import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle';
import { Header } from "./header/header";
import { PreLoaderComponent } from './pre-loader/pre-loader';
import { AuthService } from './services/auth/auth';

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
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  showHeader = true;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.restoreSession();
    }

    this.updateHeaderVisibility(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateHeaderVisibility(event.url);
      });
  }

  private updateHeaderVisibility(url: string): void {
    this.showHeader = !(url === '/' || url === '/login' || url === '/home' || url.startsWith('/home?'));
  }
}
