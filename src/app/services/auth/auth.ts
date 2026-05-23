import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ApplicationError } from '@application/errors/application.error';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { LoginUseCase } from '@application/auth/login.use-case';
import { LogoutUseCase } from '@application/auth/logout.use-case';
import { User } from '@domain/entities/user.entity';
import { UserRole } from '@domain/value-objects/role.enum';

export interface IDefaultUser {
  id: number;
  name: string;
  userId: string;
  email: string;
  password: string;
  role: 'admin' | 'state_manager' | 'district_manager' | 'block_manager';
  state: string[];
  districts: string[];
  blocks: string[];
  permissions: string[];
  photo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentLoginUser = new BehaviorSubject<IDefaultUser | null>(null);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);

  login(userId: string, password: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    void this.loginUseCase
      .execute({ userId, password })
      .subscribe({
        next: (user) => this.currentLoginUser.next(this.toLegacyUser(user)),
        error: () => this.currentLoginUser.next(null),
      });

    return true;
  }

  loginAsync(userId: string, password: string): Promise<IDefaultUser | null> {
    return new Promise((resolve, reject) => {
      this.loginUseCase.execute({ userId, password }).subscribe({
        next: (user) => {
          const legacyUser = this.toLegacyUser(user);
          this.currentLoginUser.next(legacyUser);
          resolve(legacyUser);
        },
        error: (error) => reject(error),
      });
    });
  }

  logout(): void {
    this.logoutUseCase.execute();
    this.currentLoginUser.next(null);
  }

  getCurrentLoginUser(): IDefaultUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const user = this.getCurrentUserUseCase.execute();
      if (!user) {
        this.currentLoginUser.next(null);
        return null;
      }

      const legacyUser = this.toLegacyUser(user);
      this.currentLoginUser.next(legacyUser);
      return legacyUser;
    } catch (error) {
      if (error instanceof ApplicationError && error.code === 'SESSION_EXPIRED') {
        this.currentLoginUser.next(null);
      }
      return null;
    }
  }

  restoreSession(): IDefaultUser | null {
    return this.getCurrentLoginUser();
  }

  private toLegacyUser(user: User): IDefaultUser {
    return {
      id: user.id,
      name: user.name,
      userId: user.userId,
      email: user.email,
      password: '',
      role: user.role as IDefaultUser['role'],
      state: [...user.jurisdiction.states],
      districts: [...user.jurisdiction.districts],
      blocks: [...user.jurisdiction.blocks],
      permissions: [...user.permissions],
    };
  }
}

export { UserRole };
