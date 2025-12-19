// Caso de uso: Listar certificados
// Capa de Aplicación (arquitectura hexagonal)

import type { ICertificateRepository, CertificateListParams } from '../certificate.repository.port';
import type { PaginatedResponse } from '../../training/training.repository.port';
import type { Certificate } from '../../../domain/certificate/models';

/**
 * Caso de uso para listar certificados con paginación y filtros
 */
export class ListCertificatesUseCase {
  constructor(private readonly repository: ICertificateRepository) {}

  async execute(params: CertificateListParams): Promise<PaginatedResponse<Certificate>> {
    return this.repository.findAll(params);
  }
}

