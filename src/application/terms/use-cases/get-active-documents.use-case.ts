import type { ITermsRepository, DocumentoLegal } from '../terms.repository.port';

export class GetActiveDocumentsUseCase {
  constructor(private readonly termsRepository: ITermsRepository) {}

  async execute(): Promise<DocumentoLegal[]> {
    return await this.termsRepository.getActiveDocuments();
  }
}

