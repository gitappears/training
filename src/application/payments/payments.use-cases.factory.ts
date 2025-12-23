import type { IPaymentsRepository } from './payments.repository.port';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { EnableDriverUseCase } from './use-cases/enable-driver.use-case';

export class PaymentsUseCasesFactory {
  static getCreatePaymentUseCase(
    paymentsRepository: IPaymentsRepository,
  ): CreatePaymentUseCase {
    return new CreatePaymentUseCase(paymentsRepository);
  }

  static getEnableDriverUseCase(
    paymentsRepository: IPaymentsRepository,
  ): EnableDriverUseCase {
    return new EnableDriverUseCase(paymentsRepository);
  }
}

