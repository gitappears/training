import type { ITermsRepository, Aceptacion } from '../terms.repository.port';

export class AcceptTermsUseCase {
  constructor(private readonly termsRepository: ITermsRepository) {}

  async execute(documentosIds: number[]): Promise<Aceptacion[]> {
    return await this.termsRepository.acceptTerms(documentosIds);
  }
}

