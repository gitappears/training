// Caso de uso: Eliminar documento legal
// Capa de Aplicación (arquitectura hexagonal)

import type { IDocumentosLegalesRepository } from '../documentos-legales.repository.port';

/**
 * Caso de uso para eliminar un documento legal
 */
export class RemoveDocumentoLegalUseCase {
  constructor(private readonly repository: IDocumentosLegalesRepository) {}

  async execute(id: number): Promise<void> {
    return this.repository.remove(id);
  }
}
