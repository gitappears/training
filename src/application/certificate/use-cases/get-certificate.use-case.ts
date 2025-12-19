// Caso de uso: Obtener un certificado por ID
// Capa de Aplicación (arquitectura hexagonal)

import type { ICertificateRepository } from '../certificate.repository.port';
import type { Certificate } from '../../../domain/certificate/models';

/**
 * Caso de uso para obtener un certificado por su ID
 */
export class GetCertificateUseCase {
  constructor(private readonly repository: ICertificateRepository) {}

  async execute(id: string): Promise<Certificate> {
    return this.repository.findOne(id);
  }
}

