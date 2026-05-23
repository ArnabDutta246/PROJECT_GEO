import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export interface LoginCredentials {
  userId: string;
  password: string;
  deviceUuid: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export abstract class AuthRepository {
  abstract login(credentials: LoginCredentials): Observable<AuthResult>;
}
