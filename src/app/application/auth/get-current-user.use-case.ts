import { Injectable, inject } from '@angular/core';
import { ApplicationError } from '../errors/application.error';
import { User } from '@domain/entities/user.entity';
import { SessionRepository } from '@domain/repositories/session.repository';
import { SESSION_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetCurrentUserUseCase {
  private readonly sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);

  execute(): User | null {
    const session = this.sessionRepository.getSession();
    if (!session) {
      return null;
    }

    if (session.isExpired()) {
      this.sessionRepository.clearSession();
      throw new ApplicationError('Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
    }

    if (!session.user.active) {
      this.sessionRepository.clearSession();
      throw new ApplicationError(
        'Account inactive — contact your administrator.',
        'ACCOUNT_INACTIVE'
      );
    }

    return session.user;
  }
}
