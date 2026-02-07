import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle";
import { ThemeService } from '../theme.service';
import { AuthService, IDefaultUser } from '../services/auth/auth';

@Component({
  selector: 'app-header',
  imports: [ThemeToggleComponent, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  currentUser: IDefaultUser | null = null;
  showUserDropdown = false;

  @ViewChild('userInfoDropdown', { static: false }) userInfoDropdown!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentLoginUser();

    // Subscribe to user changes
    this.authService.currentLoginUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showUserDropdown && this.elementRef.nativeElement) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showUserDropdown = false;
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.showUserDropdown = false;
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.currentTheme() === 'dark';
  }
}
