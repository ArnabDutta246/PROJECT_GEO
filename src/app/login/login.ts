import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    try {
      const loginSuccess = this.authService.login(this.email, this.password);
      
      if (loginSuccess) {
        // Successful login - redirect to home
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.isLoading = false;
      }
    } catch (error) {
      this.errorMessage = 'An error occurred during login. Please try again.';
      this.isLoading = false;
    }
  }
}
