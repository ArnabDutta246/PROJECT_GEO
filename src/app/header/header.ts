import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle";
import { AuthService, IDefaultUser } from '../services/auth/auth';

@Component({
  selector: 'app-header',
  imports: [ThemeToggleComponent, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  currentUser: IDefaultUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentLoginUser();

    // Subscribe to user changes
    this.authService.currentLoginUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
