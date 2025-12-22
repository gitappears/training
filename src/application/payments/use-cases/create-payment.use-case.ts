import type { IPaymentsRepository, Payment, CreatePaymentDto } from '../payments.repository.port';

export class CreatePaymentUseCase {
  constructor(private readonly paymentsRepository: IPaymentsRepository) {}

  async execute(dto: CreatePaymentDto): Promise<Payment> {
    return await this.paymentsRepository.createPayment(dto);
  }
}

