import { ApplicationError } from '@application/errors/application.error';
import { ApiEnvelope } from '../dto/api-envelope.dto';

export function assertApiSuccess<T>(response: ApiEnvelope<T> & { success?: boolean | null }): void {
  if (response.success === false || (response.statusCode >= 400 && response.success !== true)) {
    throw new ApplicationError(response.message || 'Request failed', String(response.statusCode));
  }
}
