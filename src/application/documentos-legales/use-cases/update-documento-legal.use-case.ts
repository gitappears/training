// Caso de uso: Actualizar documento legal
// Capa de Aplicación (arquitectura hexagonal)

import type {
  IDocumentosLegalesRepository,
  UpdateDocumentoLegalDto,
  DocumentoLegal,
} from '../documentos-legales.repository.port';

/**
 * Caso de uso para actualizar un documento legal existente
 */
export class UpdateDocumentoLegalUseCase {
  constructor(private readonly repository: IDocumentosLegalesRepository) {}

  async execute(
    id: number,
    dto: UpdateDocumentoLegalDto,
  ): Promise<DocumentoLegal> {
    return this.repository.update(id, dto);
  }
}
