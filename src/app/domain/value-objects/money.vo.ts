import { DomainError } from '../errors/domain.error';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static create(amount: number, currency = 'INR'): Money {
    if (amount < 0) {
      throw new DomainError('Amount cannot be negative', 'INVALID_MONEY');
    }
    return new Money(amount, currency);
  }
}
