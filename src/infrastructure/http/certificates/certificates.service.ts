// Implementación HTTP del repositorio de certificados
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
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
 * Tipos para las respuestas del backend
 */
interface BackendCertificate {
  id: number;
  numeroCertificado: string;
  fechaEmision: string;
  fechaAprobacionReal?: string;
  fechaRetroactiva?: string;
  esRetroactivo: boolean;
  justificacionRetroactiva?: string;
  fechaVencimiento?: string;
  urlCertificado?: string;
  urlVerificacionPublica: string;
  hashVerificacion: string;
  codigoQr?: string;
  firmaDigital?: string;
  activo: boolean;
  inscripcion?: {
    id: number;
    estudiante?: {
      id: number;
      nombres: string;
      apellidos: string;
      numeroDocumento: string;
    };
    capacitacion?: {
      id: number;
      titulo: string;
      duracionHoras?: number;
      instructor?: {
        id: number;
        nombres: string;
        apellidos: string;
      };
    };
    calificacionFinal?: number;
    minimoAprobacion?: number;
  };
}

interface BackendPaginatedResponse {
  data: BackendCertificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendCertificate): Certificate {
  const inscripcion = backendData.inscripcion;
  const estudiante = inscripcion?.estudiante;
  const capacitacion = inscripcion?.capacitacion;
  const instructor = capacitacion?.instructor;

  // Calcular fecha de emisión (retroactiva si aplica) (RF-28, RF-31)
  const fechaEmision = backendData.esRetroactivo && backendData.fechaRetroactiva
    ? new Date(backendData.fechaRetroactiva).toISOString()
    : backendData.fechaEmision;

  const certificate: Certificate = {
    id: backendData.id?.toString() ?? '',
    courseId: capacitacion?.id?.toString() ?? '',
    courseName: capacitacion?.titulo ?? '',
    studentId: estudiante?.id?.toString() ?? '',
    studentName: estudiante
      ? `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim()
      : '',
    documentNumber: estudiante?.numeroDocumento ?? '',
    instructor: instructor?.id?.toString() ?? '',
    instructorName: instructor
      ? `${instructor.nombres || ''} ${instructor.apellidos || ''}`.trim()
      : '',
    issuedDate: fechaEmision,
    expiryDate: backendData.fechaVencimiento
      ? new Date(backendData.fechaVencimiento).toISOString()
      : new Date().toISOString(),
    isRetroactive: backendData.esRetroactivo ?? false,
    score: inscripcion?.calificacionFinal ?? 0,
    minimumScore: inscripcion?.minimoAprobacion ?? 70,
    status: mapStatus(backendData),
    verificationCode: backendData.hashVerificacion ?? '',
    publicVerificationUrl: backendData.urlVerificacionPublica ?? '',
    createdAt: backendData.fechaEmision ?? new Date().toISOString(),
  };

  if (backendData.fechaRetroactiva) {
    certificate.retroactiveDate = new Date(backendData.fechaRetroactiva).toISOString();
  }
  if (backendData.justificacionRetroactiva) {
    certificate.justification = backendData.justificacionRetroactiva;
  }
  if (backendData.codigoQr) {
    certificate.qrCodeUrl = backendData.codigoQr;
  }
  if (backendData.urlCertificado) {
    certificate.pdfUrl = backendData.urlCertificado;
  }
  if (backendData.firmaDigital) {
    certificate.digitalSignature = backendData.firmaDigital;
  }
  if (capacitacion?.duracionHoras) {
    certificate.durationHours = capacitacion.duracionHoras;
  }

  return certificate;
}

function mapStatus(backendData: BackendCertificate): CertificateStatus {
  if (!backendData.activo) return 'revoked';
  
  if (backendData.fechaVencimiento) {
    const fechaVencimiento = new Date(backendData.fechaVencimiento);
    if (new Date() > fechaVencimiento) {
      return 'expired';
    }
  }
  
  return 'valid';
}

/**
 * Servicio HTTP para certificados
 * Implementa el puerto ICertificateRepository usando axios
 */
export class CertificatesService implements ICertificateRepository {
  private readonly baseUrl = '/certificados';

  async findAll(params: CertificateListParams): Promise<PaginatedResponse<Certificate>> {
    try {
      const pagination = {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.filters?.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters: params.filters,
      };

      const response = await api.post<BackendPaginatedResponse>(
        `${this.baseUrl}/list`,
        pagination,
      );

      return {
        data: response.data.data.map(mapBackendToDomain),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la lista de certificados',
      );
    }
  }

  async findOne(id: string): Promise<Certificate> {
    try {
      const response = await api.get<BackendCertificate>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener el certificado con ID ${id}`,
      );
    }
  }

  async findByUser(userId: string, filters?: CertificateFilters): Promise<Certificate[]> {
    try {
      const params: CertificateListParams = {
        page: 1,
        limit: 100,
        filters: {
          ...filters,
          studentId: userId,
        },
      };
      const result = await this.findAll(params);
      return result.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener los certificados del usuario ${userId}`,
      );
    }
  }

  async create(dto: CreateCertificateDto): Promise<Certificate> {
    try {
      const createDto = {
        inscripcionId: Number.parseInt(dto.studentId), // Asumiendo que studentId es inscripcionId
        esRetroactivo: dto.isRetroactive ?? false,
        fechaRetroactiva: dto.retroactiveDate,
        justificacionRetroactiva: dto.justification,
      };

      const response = await api.post<BackendCertificate>(this.baseUrl, createDto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear el certificado',
      );
    }
  }

  async update(id: string, dto: UpdateCertificateDto): Promise<Certificate> {
    try {
      const updateDto: {
        esRetroactivo?: boolean;
        fechaRetroactiva?: string;
        justificacionRetroactiva?: string;
      } = {};
      
      if (dto.isRetroactive !== undefined) {
        updateDto.esRetroactivo = dto.isRetroactive;
      }
      if (dto.retroactiveDate !== undefined) {
        updateDto.fechaRetroactiva = dto.retroactiveDate;
      }
      if (dto.justification !== undefined) {
        updateDto.justificacionRetroactiva = dto.justification;
      }

      const response = await api.patch<BackendCertificate>(
        `${this.baseUrl}/${id}/retroactivo`,
        updateDto,
      );
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar el certificado con ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar el certificado con ID ${id}`,
      );
    }
  }

  async downloadPDF(id: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al descargar el certificado con ID ${id}`,
      );
    }
  }

  /**
   * Obtiene el PDF del certificado para visualización (sin descargar)
   * @param id ID del certificado
   * @returns Blob del PDF
   */
  async getPDFForView(id: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/view`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener el certificado con ID ${id} para visualización`,
      );
    }
  }

  async verifyPublic(token: string): Promise<CertificateVerification> {
    try {
      const response = await api.get<{
        isValid: boolean;
        isExpired: boolean;
        fechaEmision: string;
        fechaVencimiento: string | null;
        certificado: {
          numeroCertificado: string;
          nombreCompleto: string;
          numeroDocumento: string;
          nombreCurso: string;
          estado: string;
        };
      }>(`/public/verify/${token}`);

      // Mapear respuesta pública a CertificateVerification
      return {
        certificate: response.data.certificado
          ? {
              id: '',
              courseId: '',
              courseName: response.data.certificado.nombreCurso,
              studentId: '',
              studentName: response.data.certificado.nombreCompleto,
              documentNumber: response.data.certificado.numeroDocumento,
              instructor: '',
              instructorName: '',
              issuedDate: response.data.fechaEmision,
              expiryDate: response.data.fechaVencimiento || new Date().toISOString(),
              isRetroactive: false,
              score: 0,
              minimumScore: 70,
              status: response.data.isExpired ? 'expired' : 'valid',
              verificationCode: token,
              publicVerificationUrl: `/verify/${token}`,
              createdAt: response.data.fechaEmision,
            }
          : null,
        isValid: response.data.isValid,
        message: response.data.isExpired
          ? 'Certificado vencido'
          : response.data.isValid
            ? 'Certificado válido'
            : 'Certificado inválido',
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 404) {
        return {
          certificate: null,
          isValid: false,
          message: 'Certificado no encontrado o inválido',
          verifiedAt: new Date().toISOString(),
        };
      }
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al verificar el certificado',
      );
    }
  }

  getVerificationHistory(_certificateId: string): Promise<CertificateVerificationHistory[]> {
    // TODO: Implementar endpoint en backend si es necesario
    // Por ahora retornar array vacío
    void _certificateId;
    return Promise.resolve([]);
  }

  async getStatistics(filters?: CertificateFilters): Promise<CertificateStatistics> {
    try {
      // TODO: Implementar endpoint en backend si es necesario
      // Por ahora retornar estadísticas básicas
      const result = await this.findAll({ page: 1, limit: 100, filters: filters ?? {} });
      
      const valid = result.data.filter((c) => c.status === 'valid').length;
      const expired = result.data.filter((c) => c.status === 'expired').length;
      const revoked = result.data.filter((c) => c.status === 'revoked').length;
      
      const byCourse: Record<string, number> = {};
      result.data.forEach((cert) => {
        if (cert.courseId) {
          byCourse[cert.courseId] = (byCourse[cert.courseId] || 0) + 1;
        }
      });

      return {
        total: result.total,
        valid,
        expired,
        revoked,
        byCourse,
        expiringSoon: 0, // TODO: Calcular certificados próximos a vencer
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener estadísticas de certificados',
      );
    }
  }

  async getExpiringCertificatesReport(params: {
    fechaVencimientoDesde?: string;
    fechaVencimientoHasta?: string;
    estado?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
    busqueda?: string;
    pagina?: number;
    limite?: number;
  }): Promise<{
    certificados: Certificate[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.fechaVencimientoDesde) {
        queryParams.append('fechaVencimientoDesde', params.fechaVencimientoDesde);
      }
      if (params.fechaVencimientoHasta) {
        queryParams.append('fechaVencimientoHasta', params.fechaVencimientoHasta);
      }
      if (params.estado) {
        queryParams.append('estado', params.estado);
      }
      if (params.busqueda) {
        queryParams.append('busqueda', params.busqueda);
      }
      if (params.pagina) {
        queryParams.append('pagina', params.pagina.toString());
      }
      if (params.limite) {
        queryParams.append('limite', params.limite.toString());
      }

      const response = await api.get<{
        certificados: BackendCertificate[];
        total: number;
        pagina: number;
        totalPaginas: number;
      }>(`/certificates/expiring-report?${queryParams.toString()}`);

      return {
        certificados: response.data.certificados.map(mapBackendToDomain),
        total: response.data.total,
        pagina: response.data.pagina,
        totalPaginas: response.data.totalPaginas,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener el reporte de certificados próximos a vencer',
      );
    }
  }

  async getAlertConfigurations(): Promise<Array<{
    id: number;
    diasAntesVencimiento: number;
    activo: boolean;
  }>> {
    try {
      const response = await api.get<Array<{
        id: number;
        diasAntesVencimiento: number;
        activo: boolean;
      }>>('/certificates/alert-configurations');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener configuraciones de alertas',
      );
    }
  }

  async updateAlertConfiguration(
    id: number,
    dto: { diasAntesVencimiento: number; activo: boolean },
  ): Promise<{
    id: number;
    diasAntesVencimiento: number;
    activo: boolean;
  }> {
    try {
      const response = await api.patch<{
        id: number;
        diasAntesVencimiento: number;
        activo: boolean;
      }>(`/certificates/alert-configurations/${id}`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar la configuración de alerta con ID ${id}`,
      );
    }
  }

  async checkExpirationsManually(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.get<{ success: boolean; message: string }>(
        '/certificates/check-expirations-manual',
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al ejecutar la verificación de vencimientos',
      );
    }
  }
}

// Exportar instancia singleton
export const certificatesService = new CertificatesService();
