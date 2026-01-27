// Caso de uso: Obtener documento legal por ID
// Capa de Aplicación (arquitectura hexagonal)

import type {
  IDocumentosLegalesRepository,
  DocumentoLegal,
} from '../documentos-legales.repository.port';

/**
 * Caso de uso para obtener un documento legal por su ID
 */
export class GetDocumentoLegalUseCase {
  constructor(private readonly repository: IDocumentosLegalesRepository) {}

  async execute(id: number): Promise<DocumentoLegal | null> {
    return this.repository.findOne(id);
  }
}
