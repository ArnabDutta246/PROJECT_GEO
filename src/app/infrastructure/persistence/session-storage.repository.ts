import { Injectable } from '@angular/core';
import { Session } from '@domain/entities/session.entity';
import { User } from '@domain/entities/user.entity';
import { SessionRepository } from '@domain/repositories/session.repository';
import { UserRole } from '@domain/value-objects/role.enum';
import { Jurisdiction } from '@domain/value-objects/jurisdiction.vo';
import { decodeJwtExpiry, STORAGE_KEYS } from '../util/device-uuid.util';

interface StoredUserProfile {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  jurisdiction: {
    states: string[];
    districts: string[];
    blocks: string[];
    role: UserRole;
  };
  permissions: string[];
  active: boolean;
}

@Injectable()
export class SessionStorageRepository extends SessionRepository {
  saveSession(session: Session): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.authToken, session.token);
    sessionStorage.setItem(
      STORAGE_KEYS.userProfile,
      JSON.stringify(this.serializeUser(session.user))
    );
  }

  getSession(): Session | null {
    const token = this.getToken();
    const user = this.getUser();
    if (!token || !user) {
      return null;
    }
    return new Session(token, user, decodeJwtExpiry(token));
  }

  getToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(STORAGE_KEYS.authToken);
  }

  getUser(): User | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    const raw = sessionStorage.getItem(STORAGE_KEYS.userProfile);
    if (!raw) {
      return null;
    }

    try {
      const stored = JSON.parse(raw) as StoredUserProfile;
      return this.deserializeUser(stored);
    } catch {
      return null;
    }
  }

  clearSession(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.removeItem(STORAGE_KEYS.authToken);
    sessionStorage.removeItem(STORAGE_KEYS.userProfile);
  }

  private serializeUser(user: User): StoredUserProfile {
    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      jurisdiction: {
        states: [...user.jurisdiction.states],
        districts: [...user.jurisdiction.districts],
        blocks: [...user.jurisdiction.blocks],
        role: user.jurisdiction.role,
      },
      permissions: [...user.permissions],
      active: user.active,
    };
  }

  private deserializeUser(stored: StoredUserProfile): User {
    return new User(
      stored.id,
      stored.userId,
      stored.name,
      stored.email,
      stored.role,
      new Jurisdiction(
        stored.jurisdiction.states,
        stored.jurisdiction.districts,
        stored.jurisdiction.blocks,
        stored.jurisdiction.role
      ),
      stored.permissions,
      stored.active
    );
  }
}
