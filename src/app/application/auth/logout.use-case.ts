import { Injectable, inject } from '@angular/core';
import { SessionRepository } from '@domain/repositories/session.repository';
import { SESSION_REPOSITORY } from '@infrastructure/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  private readonly sessionRepository = inject<SessionRepository>(SESSION_REPOSITORY);

  execute(): void {
    this.sessionRepository.clearSession();
  }
}
