// Modelos de dominio para certificados
// Capa de Dominio (arquitectura hexagonal)

export type CertificateStatus = 'valid' | 'expired' | 'revoked';

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  documentNumber: string;
  instructor: string;
  instructorName: string;
  issuedDate: string; // RF-23: Fecha de emisión
  expiryDate: string; // RF-36: Fecha de vencimiento calculada
  retroactiveDate?: string; // RF-25 a RF-31: Fecha retroactiva (solo admin)
  isRetroactive: boolean; // RF-26: Indica si es retroactivo
  justification?: string; // RF-27: Justificación de fecha retroactiva
  score: number; // Puntuación obtenida
  minimumScore: number; // Puntuación mínima requerida
  status: CertificateStatus;
  verificationCode: string; // RF-24: UUID v4 para verificación
  qrCodeUrl?: string; // URL del código QR generado
  publicVerificationUrl: string; // RF-32, RF-33: URL pública de verificación
  pdfUrl?: string; // URL del PDF generado
  digitalSignature?: string; // RF-23: Firma digital
  durationHours?: number; // Duración del curso en horas
  createdAt: string;
  updatedAt?: string;
  // Campos de auditoría (RF-29, RF-30)
  approvedBy?: string; // Admin que aprobó fecha retroactiva
  approvalDate?: string; // Fecha de aprobación
  realApprovalDate?: string; // RF-28: Fecha real de aprobación (no visible públicamente)
}

export interface CertificateVerification {
  certificate: Certificate | null;
  isValid: boolean;
  message: string;
  verifiedAt: string;
}

export interface CertificateStatistics {
  total: number;
  valid: number;
  expired: number;
  revoked: number;
  byCourse: Record<string, number>;
  expiringSoon: number; // Certificados próximos a vencer (RF-37, RF-38)
}

export interface CertificateFilters {
  search?: string;
  courseId?: string | null;
  studentId?: string | null;
  status?: CertificateStatus | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  qrCode?: string | null;
}

export interface CertificateListParams {
  page?: number;
  limit?: number;
  filters?: CertificateFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CertificateVerificationHistory {
  id: string;
  certificateId: string;
  verifiedAt: string;
  verifiedBy?: string; // IP o usuario que verificó
  userAgent?: string;
}

