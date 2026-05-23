import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ApplicationError } from '@application/errors/application.error';
import { User } from '@domain/entities/user.entity';
import { AuthRepository, AuthResult, LoginCredentials } from '@domain/repositories/auth.repository';
import { Jurisdiction } from '@domain/value-objects/jurisdiction.vo';
import { ROLE_PERMISSIONS, UserRole } from '@domain/value-objects/role.enum';

interface LocalAccount {
  userId: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  states: string[];
  districts: string[];
  blocks: string[];
}

const LOCAL_ACCOUNTS: LocalAccount[] = [
  {
    userId: 'admin',
    password: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    role: UserRole.Admin,
    states: ['Arunachal Pradesh'],
    districts: ['ALL'],
    blocks: ['ALL'],
  },
  {
    userId: 'state_manager',
    password: 'state_manager',
    name: 'State Manager',
    email: 'state_manager@example.com',
    role: UserRole.StateManager,
    states: ['Arunachal Pradesh'],
    districts: ['ALL'],
    blocks: ['ALL'],
  },
  {
    userId: 'district_manager',
    password: 'district_manager',
    name: 'District Manager',
    email: 'district_manager@example.com',
    role: UserRole.DistrictManager,
    states: ['Arunachal Pradesh'],
    districts: ['DIBANG VALLEY'],
    blocks: ['ALL'],
  },
  {
    userId: 'block_manager',
    password: 'block_manager',
    name: 'Block Manager',
    email: 'block_manager@example.com',
    role: UserRole.BlockManager,
    states: ['Arunachal Pradesh'],
    districts: ['DIBANG VALLEY'],
    blocks: ['ANINI'],
  },
];

@Injectable()
export class LocalAuthRepository extends AuthRepository {
  login(credentials: LoginCredentials): Observable<AuthResult> {
    const normalizedUserId = credentials.userId.trim().toLowerCase();
    const account = LOCAL_ACCOUNTS.find(
      (candidate) =>
        candidate.password === credentials.password &&
        (candidate.userId.toLowerCase() === normalizedUserId ||
          candidate.email.toLowerCase() === normalizedUserId)
    );

    if (!account) {
      return throwError(
        () =>
          new ApplicationError(
            'Invalid user ID or password. Please try again.',
            'LOGIN_FAILED'
          )
      );
    }

    const user = new User(
      LOCAL_ACCOUNTS.indexOf(account) + 1,
      account.userId,
      account.name,
      account.email,
      account.role,
      new Jurisdiction(account.states, account.districts, account.blocks, account.role),
      ROLE_PERMISSIONS[account.role],
      true
    );

    return of({ user, token: `local-${account.userId}` });
  }
}
