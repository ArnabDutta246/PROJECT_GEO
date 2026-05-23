import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApplicationError } from '@application/errors/application.error';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';

export const authGuard: CanActivateFn = () => {
  const getCurrentUser = inject(GetCurrentUserUseCase);
  const router = inject(Router);

  try {
    const user = getCurrentUser.execute();
    if (user) {
      return true;
    }
  } catch (error) {
    const message =
      error instanceof ApplicationError ? error.message : 'Please sign in to continue.';
    return router.createUrlTree(['/login'], {
      queryParams: { reason: 'session-expired', message },
    });
  }

  return router.createUrlTree(['/login']);
};
