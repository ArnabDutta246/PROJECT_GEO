import { User } from './user.entity';

export class Session {
  constructor(
    public readonly token: string,
    public readonly user: User,
    public readonly expiresAt: Date | null
  ) {}

  isExpired(now: Date = new Date()): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return now >= this.expiresAt;
  }
}
