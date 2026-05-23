import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';

export abstract class SessionRepository {
  abstract saveSession(session: Session): void;
  abstract getSession(): Session | null;
  abstract getToken(): string | null;
  abstract getUser(): User | null;
  abstract clearSession(): void;
}
