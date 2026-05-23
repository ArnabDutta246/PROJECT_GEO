import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionRepository } from '@domain/repositories/session.repository';
import { SESSION_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);
  const token = sessionRepository.getToken();

  if (token && req.url.includes('/GEOAPI/')) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }

  return next(req);
};
