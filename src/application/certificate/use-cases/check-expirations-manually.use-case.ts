// Caso de uso: Ejecutar verificación de vencimientos manualmente
// Capa de Aplicación (arquitectura hexagonal)

import type { ICertificateRepository } from '../certificate.repository.port';

/**
 * Caso de uso para ejecutar la verificación de vencimientos de certificados manualmente
 * Útil para testing y ejecución manual del proceso de alertas
 */
export class CheckExpirationsManuallyUseCase {
  constructor(private readonly repository: ICertificateRepository) {}

  async execute(): Promise<{ success: boolean; message: string }> {
    return this.repository.checkExpirationsManually();
  }
}
