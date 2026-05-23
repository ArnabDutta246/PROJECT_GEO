export class ApplicationError extends Error {
  constructor(
    message: string,
    readonly code: string = 'APPLICATION_ERROR'
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
