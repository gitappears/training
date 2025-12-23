import type { IPaymentsRepository } from '../payments.repository.port';

export class EnableDriverUseCase {
  constructor(private readonly paymentsRepository: IPaymentsRepository) {}

  async execute(studentId: number): Promise<{ message: string }> {
    return await this.paymentsRepository.enableDriver(studentId);
  }
}

