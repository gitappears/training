import type { ITermsRepository } from '../terms.repository.port';

export class VerifyAcceptanceUseCase {
  constructor(private readonly termsRepository: ITermsRepository) {}

  async execute(): Promise<{ aceptado: boolean; message: string }> {
    return await this.termsRepository.verifyAcceptance();
  }
}

