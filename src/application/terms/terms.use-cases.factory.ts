import type { ITermsRepository } from './terms.repository.port';
import { GetActiveDocumentsUseCase } from './use-cases/get-active-documents.use-case';
import { AcceptTermsUseCase } from './use-cases/accept-terms.use-case';
import { VerifyAcceptanceUseCase } from './use-cases/verify-acceptance.use-case';

export class TermsUseCasesFactory {
  static getGetActiveDocumentsUseCase(
    termsRepository: ITermsRepository,
  ): GetActiveDocumentsUseCase {
    return new GetActiveDocumentsUseCase(termsRepository);
  }

  static getAcceptTermsUseCase(termsRepository: ITermsRepository): AcceptTermsUseCase {
    return new AcceptTermsUseCase(termsRepository);
  }

  static getVerifyAcceptanceUseCase(
    termsRepository: ITermsRepository,
  ): VerifyAcceptanceUseCase {
    return new VerifyAcceptanceUseCase(termsRepository);
  }
}

