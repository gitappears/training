// Caso de uso: Crear documento legal
// Capa de Aplicación (arquitectura hexagonal)

import type {
  IDocumentosLegalesRepository,
  CreateDocumentoLegalDto,
  DocumentoLegal,
} from '../documentos-legales.repository.port';

/**
 * Caso de uso para crear un nuevo documento legal
 */
export class CreateDocumentoLegalUseCase {
  constructor(private readonly repository: IDocumentosLegalesRepository) {}

  async execute(dto: CreateDocumentoLegalDto): Promise<DocumentoLegal> {
    return this.repository.create(dto);
  }
}
