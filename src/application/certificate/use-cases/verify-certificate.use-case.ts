// Caso de uso: Verificar certificado públicamente (RF-32, RF-33, RF-34)
// Capa de Aplicación (arquitectura hexagonal)

import type { ICertificateRepository } from '../certificate.repository.port';
import type { CertificateVerification } from '../../../domain/certificate/models';

/**
 * Caso de uso para verificar un certificado públicamente
 * RF-32, RF-33, RF-34: Verificación externa de certificados
 */
export class VerifyCertificateUseCase {
  constructor(private readonly repository: ICertificateRepository) {}

  async execute(token: string): Promise<CertificateVerification> {
    return this.repository.verifyPublic(token);
  }
}

