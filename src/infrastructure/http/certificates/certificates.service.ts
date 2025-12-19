// Implementación HTTP del repositorio de certificados
// Adaptador que conecta la capa de aplicación con la API REST

// import { api } from '../../../boot/axios'; // TODO: Descomentar cuando backend esté listo
import type { AxiosError } from 'axios';
import type {
  ICertificateRepository,
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateListParams,
  CertificateFilters,
  CertificateStatistics,
} from '../../../application/certificate/certificate.repository.port';
import type {
  Certificate,
  CertificateVerification,
  CertificateVerificationHistory,
  CertificateStatus,
} from '../../../domain/certificate/models';
import type { PaginatedResponse } from '../../../application/training/training.repository.port';

/**
 * Tipos para las respuestas del backend (mock por ahora)
 */
interface BackendCertificate {
  id: number;
  courseId: number;
  courseName: string;
  studentId: number;
  studentName: string;
  documentNumber: string;
  instructorId: number;
  instructorName: string;
  issuedDate: string;
  expiryDate: string;
  retroactiveDate?: string;
  isRetroactive: boolean;
  justification?: string;
  score: number;
  minimumScore: number;
  status: string;
  verificationCode: string;
  qrCodeUrl?: string;
  publicVerificationUrl: string;
  pdfUrl?: string;
  digitalSignature?: string;
  durationHours?: number;
  createdAt: string;
  updatedAt?: string;
}

// interface BackendPaginatedResponse { // TODO: Usar cuando backend esté listo
//   data: BackendCertificate[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendCertificate): Certificate {
  const certificate: Certificate = {
    id: backendData.id?.toString() ?? '',
    courseId: backendData.courseId?.toString() ?? '',
    courseName: backendData.courseName ?? '',
    studentId: backendData.studentId?.toString() ?? '',
    studentName: backendData.studentName ?? '',
    documentNumber: backendData.documentNumber ?? '',
    instructor: backendData.instructorId?.toString() ?? '',
    instructorName: backendData.instructorName ?? '',
    issuedDate: backendData.retroactiveDate ?? backendData.issuedDate ?? new Date().toISOString(),
    expiryDate: backendData.expiryDate ?? new Date().toISOString(),
    isRetroactive: backendData.isRetroactive ?? false,
    score: backendData.score ?? 0,
    minimumScore: backendData.minimumScore ?? 70,
    status: mapStatus(backendData.status),
    verificationCode: backendData.verificationCode ?? '',
    publicVerificationUrl: backendData.publicVerificationUrl ?? '',
    createdAt: backendData.createdAt ?? new Date().toISOString(),
  };

  if (backendData.retroactiveDate) {
    certificate.retroactiveDate = backendData.retroactiveDate;
  }
  if (backendData.justification) {
    certificate.justification = backendData.justification;
  }
  if (backendData.qrCodeUrl) {
    certificate.qrCodeUrl = backendData.qrCodeUrl;
  }
  if (backendData.pdfUrl) {
    certificate.pdfUrl = backendData.pdfUrl;
  }
  if (backendData.digitalSignature) {
    certificate.digitalSignature = backendData.digitalSignature;
  }
  if (backendData.durationHours !== undefined) {
    certificate.durationHours = backendData.durationHours;
  }
  if (backendData.updatedAt) {
    certificate.updatedAt = backendData.updatedAt;
  }

  return certificate;
}

function mapStatus(status: string): CertificateStatus {
  const normalized = status?.toLowerCase() ?? 'valid';
  if (normalized.includes('expired')) return 'expired';
  if (normalized.includes('revoked')) return 'revoked';
  return 'valid';
}

/**
 * Servicio HTTP para certificados
 * Implementa el puerto ICertificateRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class CertificatesService implements ICertificateRepository {
  private readonly baseUrl = '/certificados';

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(params: CertificateListParams): Promise<PaginatedResponse<Certificate>> {
    try {
      // Mock por ahora
      const mockCertificates: BackendCertificate[] = [
        {
          id: 1,
          courseId: 1,
          courseName: 'Primeros Auxilios',
          studentId: 1,
          studentName: 'Juan Pérez',
          documentNumber: '12345678',
          instructorId: 1,
          instructorName: 'Dr. María González',
          issuedDate: '2025-01-15',
          expiryDate: '2026-01-15',
          isRetroactive: false,
          score: 85,
          minimumScore: 70,
          status: 'valid',
          verificationCode: 'ABC123XYZ789',
          publicVerificationUrl: '/verify/ABC123XYZ789',
          durationHours: 8,
          createdAt: '2025-01-15T10:00:00Z',
        },
      ];

      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = mockCertificates.slice(start, end);

      return {
        data: paginated.map(mapBackendToDomain),
        total: mockCertificates.length,
        page,
        limit,
        totalPages: Math.ceil(mockCertificates.length / limit),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la lista de certificados',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findOne(id: string): Promise<Certificate> {
    try {
      // Mock por ahora
      const mockCertificate: BackendCertificate = {
        id: Number.parseInt(id),
        courseId: 1,
        courseName: 'Primeros Auxilios',
        studentId: 1,
        studentName: 'Juan Pérez',
        documentNumber: '12345678',
        instructorId: 1,
        instructorName: 'Dr. María González',
        issuedDate: '2025-01-15',
        expiryDate: '2026-01-15',
        isRetroactive: false,
        score: 85,
        minimumScore: 70,
        status: 'valid',
        verificationCode: 'ABC123XYZ789',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABC123XYZ789',
        publicVerificationUrl: '/verify/ABC123XYZ789',
        pdfUrl: '/certificates/1.pdf',
        durationHours: 8,
        createdAt: '2025-01-15T10:00:00Z',
      };

      return mapBackendToDomain(mockCertificate);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener el certificado con ID ${id}`,
      );
    }
  }

  async findByUser(userId: string, filters?: CertificateFilters): Promise<Certificate[]> {
    try {
      // Mock por ahora
      const params: CertificateListParams = { page: 1, limit: 100 };
      if (filters) {
        params.filters = filters;
      }
      const result = await this.findAll(params);
      return result.data.filter((cert) => cert.studentId === userId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener los certificados del usuario ${userId}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(dto: CreateCertificateDto): Promise<Certificate> {
    try {
      // Mock por ahora
      // RF-22: Generación automática de certificado
      const mockCertificate: BackendCertificate = {
        id: Date.now(),
        courseId: Number.parseInt(dto.courseId),
        courseName: 'Curso',
        studentId: Number.parseInt(dto.studentId),
        studentName: 'Estudiante',
        documentNumber: '12345678',
        instructorId: 1,
        instructorName: 'Instructor',
        issuedDate: dto.retroactiveDate || (new Date().toISOString().split('T')[0] ?? ''),
        expiryDate: (new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? ''),
        isRetroactive: dto.isRetroactive ?? false,
        ...(dto.retroactiveDate && { retroactiveDate: dto.retroactiveDate }),
        ...(dto.justification && { justification: dto.justification }),
        score: dto.score,
        minimumScore: 70,
        status: 'valid',
        verificationCode: `CERT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        publicVerificationUrl: `/verify/CERT-${Date.now()}`,
        durationHours: 8,
        createdAt: new Date().toISOString(),
      };

      return mapBackendToDomain(mockCertificate);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear el certificado',
      );
    }
  }

  async update(id: string, dto: UpdateCertificateDto): Promise<Certificate> {
    try {
      // Mock por ahora
      const existing = await this.findOne(id);
      const mockCertificate: BackendCertificate = {
        id: Number.parseInt(id),
        courseId: Number.parseInt(existing.courseId),
        courseName: existing.courseName,
        studentId: Number.parseInt(existing.studentId),
        studentName: existing.studentName,
        documentNumber: existing.documentNumber,
        instructorId: Number.parseInt(existing.instructor),
        instructorName: existing.instructorName,
        issuedDate: existing.issuedDate,
        expiryDate: existing.expiryDate,
        isRetroactive: dto.isRetroactive ?? existing.isRetroactive,
        ...(dto.retroactiveDate !== undefined && { retroactiveDate: dto.retroactiveDate }),
        ...(existing.retroactiveDate !== undefined && { retroactiveDate: existing.retroactiveDate }),
        ...(dto.justification !== undefined && { justification: dto.justification }),
        ...(existing.justification !== undefined && { justification: existing.justification }),
        score: existing.score,
        minimumScore: existing.minimumScore,
        status: existing.status,
        verificationCode: existing.verificationCode,
        publicVerificationUrl: existing.publicVerificationUrl,
        updatedAt: new Date().toISOString(),
        createdAt: existing.createdAt,
      };

      return mapBackendToDomain(mockCertificate);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar el certificado con ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Mock por ahora
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar el certificado con ID ${id}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async downloadPDF(id: string): Promise<Blob> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
      
      // Simular descarga de PDF
      const pdfContent = `%PDF-1.4\n... Certificado ${id} ...`;
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al descargar el certificado con ID ${id}`,
      );
    }
  }

  async verifyPublic(token: string): Promise<CertificateVerification> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.get(`/public/verify/${token}`);
      
      if (token === 'ABC123XYZ789' || token === 'ABC123XYZ') {
        const certificate = await this.findOne('1');
        return {
          certificate,
          isValid: true,
          message: 'Certificado válido',
          verifiedAt: new Date().toISOString(),
        };
      }

      return {
        certificate: null,
        isValid: false,
        message: 'Certificado no encontrado o inválido',
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al verificar el certificado',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getVerificationHistory(certificateId: string): Promise<CertificateVerificationHistory[]> {
    try {
      // Mock por ahora
      return [
        {
          id: 'v1',
          certificateId,
          verifiedAt: '2025-01-20T10:30:00Z',
          verifiedBy: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
        },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener el historial de verificaciones',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getStatistics(filters?: CertificateFilters): Promise<CertificateStatistics> {
    try {
      // Mock por ahora
      return {
        total: 245,
        valid: 198,
        expired: 45,
        revoked: 2,
        byCourse: {
          '1': 50,
          '2': 75,
          '3': 120,
        },
        expiringSoon: 23,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener estadísticas de certificados',
      );
    }
  }
}

// Exportar instancia singleton
export const certificatesService = new CertificatesService();

