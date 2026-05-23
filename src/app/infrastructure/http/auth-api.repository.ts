import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationError } from '@application/errors/application.error';
import { AuthRepository, AuthResult, LoginCredentials } from '@domain/repositories/auth.repository';
import { ApiClientService } from './api-client.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { mapLoginUserToDomain } from './mappers/user.mapper';

@Injectable()
export class AuthApiRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiClient = inject(ApiClientService);

  login(credentials: LoginCredentials): Observable<AuthResult> {
    const body: LoginRequestDto = {
      user_id: credentials.userId.trim(),
      password: credentials.password,
      device_uuid: credentials.deviceUuid,
    };

    const headers = new HttpHeaders({
      accept: 'text/plain',
      'Content-Type': 'application/json',
    });

    return this.http
      .post<LoginResponseDto>(this.apiClient.url('/UserDetails/ValidateUserLogin'), body, {
        headers,
      })
      .pipe(
        map((response) => {
          if (response.success !== true || !response.token) {
            throw new ApplicationError(
              response.message || 'Login failed! Invalid user or password!',
              'LOGIN_FAILED'
            );
          }

          const user = mapLoginUserToDomain(response.user);
          return { user, token: response.token };
        }),
        catchError((error) => {
          if (error instanceof ApplicationError) {
            return throwError(() => error);
          }
          const message =
            error?.error?.message ??
            error?.message ??
            'Unable to connect. Check your network and try again.';
          return throwError(() => new ApplicationError(message, 'NETWORK_ERROR'));
        })
      );
  }
}
