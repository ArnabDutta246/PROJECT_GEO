import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationError } from '@application/errors/application.error';
import { LoginUseCase } from '@application/auth/login.use-case';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LoginPresenter {
  readonly userId = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly loginUseCase = inject(LoginUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);
  private readonly router = inject(Router);

  initialize(queryMessage?: string | null): void {
    if (queryMessage) {
      this.errorMessage.set(queryMessage);
    }

    try {
      const user = this.getCurrentUserUseCase.execute();
      if (user) {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        this.errorMessage.set(error.message);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  async submit(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await firstValueFrom(
        this.loginUseCase.execute({
          userId: this.userId(),
          password: this.password(),
        })
      );
      await this.router.navigate(['/home']);
    } catch (error) {
      const message =
        error instanceof ApplicationError
          ? error.message
          : 'An error occurred during login. Please try again.';
      this.errorMessage.set(message);
      this.password.set('');
    } finally {
      this.isLoading.set(false);
    }
  }
}
