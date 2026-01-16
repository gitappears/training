// Caso de uso: Listar documentos legales
// Capa de Aplicación (arquitectura hexagonal)

import type {
  IDocumentosLegalesRepository,
  DocumentoLegal,
} from '../documentos-legales.repository.port';

/**
 * Caso de uso para listar documentos legales
 */
export class ListDocumentosLegalesUseCase {
  constructor(private readonly repository: IDocumentosLegalesRepository) {}

  async execute(activo?: boolean): Promise<DocumentoLegal[]> {
    return this.repository.findAll(activo);
  }
}
