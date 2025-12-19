// Puerto (interface) para el repositorio de certificados
// Define el contrato que debe cumplir cualquier implementación

import type {
  Certificate,
  CertificateVerification,
  CertificateListParams,
  CertificateFilters,
  CertificateStatistics,
  CertificateVerificationHistory,
} from '../../domain/certificate/models';
import type { PaginatedResponse } from '../training/training.repository.port';

// Re-exportar tipos del dominio para facilitar importaciones
export type {
  CertificateListParams,
  CertificateFilters,
  CertificateStatistics,
  CertificateVerificationHistory,
};

export interface CreateCertificateDto {
  courseId: string;
  studentId: string;
  evaluationAttemptId: string;
  score: number;
  // RF-25 a RF-31: Campos para fecha retroactiva (solo admin)
  isRetroactive?: boolean;
  retroactiveDate?: string;
  justification?: string;
}

export type UpdateCertificateDto = Partial<CreateCertificateDto>;

export interface ICertificateRepository {
  /**
   * Obtener lista de certificados con paginación y filtros
   */
  findAll(params: CertificateListParams): Promise<PaginatedResponse<Certificate>>;

  /**
   * Obtener un certificado por ID
   */
  findOne(id: string): Promise<Certificate>;

  /**
   * Obtener certificados de un usuario
   */
  findByUser(userId: string, filters?: CertificateFilters): Promise<Certificate[]>;

  /**
   * Crear un nuevo certificado (RF-22: Generación automática)
   */
  create(dto: CreateCertificateDto): Promise<Certificate>;

  /**
   * Actualizar un certificado (RF-25 a RF-31: Fecha retroactiva)
   */
  update(id: string, dto: UpdateCertificateDto): Promise<Certificate>;

  /**
   * Eliminar un certificado
   */
  remove(id: string): Promise<void>;

  /**
   * Descargar certificado PDF (RF-22, RF-23)
   */
  downloadPDF(id: string): Promise<Blob>;

  /**
   * Verificar certificado públicamente (RF-32, RF-33, RF-34)
   */
  verifyPublic(token: string): Promise<CertificateVerification>;

  /**
   * Obtener historial de verificaciones de un certificado
   */
  getVerificationHistory(certificateId: string): Promise<CertificateVerificationHistory[]>;

  /**
   * Obtener estadísticas de certificados
   */
  getStatistics(filters?: CertificateFilters): Promise<CertificateStatistics>;
}

