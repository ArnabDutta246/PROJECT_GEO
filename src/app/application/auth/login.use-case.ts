import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { ApplicationError } from '../errors/application.error';
import { Session } from '@domain/entities/session.entity';
import { User } from '@domain/entities/user.entity';
import { AuthRepository } from '@domain/repositories/auth.repository';
import { SessionRepository } from '@domain/repositories/session.repository';
import { decodeJwtExpiry, getOrCreateDeviceUuid } from '@infrastructure/util/device-uuid.util';
import { AUTH_REPOSITORY, SESSION_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

export interface LoginCommand {
  userId: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly authRepository = inject<AuthRepository>(AUTH_REPOSITORY);
  private readonly sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);

  execute(command: LoginCommand): Observable<User> {
    if (!command.userId.trim() || !command.password) {
      return throwError(
        () => new ApplicationError('User ID and password are required.', 'VALIDATION_FAILED')
      );
    }

    return this.authRepository
      .login({
        userId: command.userId.trim(),
        password: command.password,
        deviceUuid: getOrCreateDeviceUuid(),
      })
      .pipe(
        map(({ user, token }) => {
          const session = new Session(token, user, decodeJwtExpiry(token));
          this.sessionRepository.saveSession(session);
          return user;
        })
      );
  }
}
