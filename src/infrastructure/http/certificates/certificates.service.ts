// Implementación HTTP del repositorio de certificados
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from '../../../stores/auth.store';

/** Timeout para descarga de PDF (conexiones lentas o PDFs grandes) */
const DOWNLOAD_PDF_TIMEOUT_MS = 60000;

/**
 * Cuando la petición usa responseType: 'blob', los errores 4xx/5xx llegan con
 * response.data como Blob (no JSON). Extrae el mensaje del backend si existe.
 */
async function getMessageFromBlobError(
  axiosError: AxiosError<Blob | { message?: string }>,
  fallback: string,
): Promise<string> {
  const data = axiosError.response?.data;
  if (!data) return fallback;
  if (typeof (data as { message?: string }).message === 'string') {
    return (data as { message: string }).message;
  }
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const json = JSON.parse(text) as { message?: string };
      if (typeof json.message === 'string') return json.message;
    } catch {
      // ignorar si no es JSON válido
    }
  }
  if (axiosError.response?.status) {
    return `Error ${axiosError.response.status}: ${axiosError.response.statusText || 'Error en el servidor'}`;
  }
  return fallback;
}
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
  codigo_qr?: string; // Fallback para formato snake_case del backend
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
  const fechaEmision =
    backendData.esRetroactivo && backendData.fechaRetroactiva
      ? new Date(backendData.fechaRetroactiva).toISOString()
      : backendData.fechaEmision;

  // Asegurar que siempre tengamos un código de verificación y URL
  const hashVerificacion =
    backendData.hashVerificacion?.trim() || backendData.numeroCertificado || '';
  const urlVerificacionPublica = backendData.urlVerificacionPublica?.trim() || '';

  // Fix: Quasar hash mode requires /#/ followed by the route.
  // The 'real' path reported by user on Render: /#/verify/TOKEN
  const finalVerificationUrl = urlVerificacionPublica?.startsWith('http')
    ? urlVerificacionPublica
    : hashVerificacion
      ? `/#/verify/${hashVerificacion}`
      : '';

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
    verificationCode: hashVerificacion,
    publicVerificationUrl: finalVerificationUrl,
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
  } else if (backendData.codigo_qr) {
    certificate.qrCodeUrl = backendData.codigo_qr;
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
  // El backend garantiza que solo se crean certificados para inscripciones aprobadas
  // (ver create-certificado.use-case.ts línea 63-67)
  // Por lo tanto, solo verificamos si está activo, revocado o vencido

  if (!backendData.activo) return 'revoked';

  // Verificar si está vencido
  if (backendData.fechaVencimiento) {
    const fechaVencimiento = new Date(backendData.fechaVencimiento);
    const ahora = new Date();

    // Debug fecha
    console.log(
      `[Cert Status] ID: ${backendData.id}, Vence: ${fechaVencimiento.toISOString()}, Ahora: ${ahora.toISOString()}`,
    );

    if (ahora > fechaVencimiento) {
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
      const f = params.filters;
      const statusVal = f?.status != null ? String(f.status).trim() : undefined;
      const body = {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: f?.search || undefined,
        sortField: params.sortBy || undefined,
        sortOrder: (params.sortOrder?.toUpperCase() as 'ASC' | 'DESC') || undefined,
        filters: {
          ...(f?.studentId && { studentId: f.studentId }),
          ...(f?.courseId && { courseId: f.courseId }),
          ...(statusVal && { status: statusVal }),
        },
      };
      // Eliminar filters si está vacío para no enviar {} innecesario
      if (Object.keys(body.filters).length === 0) {
        delete (body as Record<string, unknown>).filters;
      }

      const response = await api.post<BackendPaginatedResponse>(`${this.baseUrl}/list`, body);

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
      // Validar que userId sea un número válido
      const estudianteId = Number.parseInt(userId, 10);
      if (Number.isNaN(estudianteId)) {
        throw new Error(`ID de usuario inválido: ${userId}`);
      }

      // Usar el nuevo endpoint específico para obtener certificados por estudiante
      const pagination = {
        page: 1,
        limit: 100, // Máximo permitido
        search: filters?.search,
        sortField: 'fechaEmision',
        sortOrder: 'DESC',
      };

      const response = await api.post<BackendPaginatedResponse>(
        `${this.baseUrl}/estudiante/${estudianteId}`,
        pagination,
      );

      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Respuesta inesperada del backend:', response.data);
        return [];
      }

      // Mapear las certificados con manejo de errores individual
      const certificates: Certificate[] = [];
      for (const item of response.data.data) {
        try {
          const certificate = mapBackendToDomain(item);
          certificates.push(certificate);
        } catch (error) {
          console.error('Error al mapear certificado:', error, item);
          // Continuar con los siguientes certificados
        }
      }

      return certificates;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;

      // Log detallado del error para debugging
      console.error('Error en findByUser:', {
        userId,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      // Si es un error 404, retornar array vacío en lugar de lanzar error
      if (axiosError.response?.status === 404) {
        console.warn(`No se encontraron certificados para el usuario ${userId}`);
        return [];
      }

      const errorMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        `Error al obtener los certificados del usuario ${userId}`;

      throw new Error(errorMessage);
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
      throw new Error(axiosError.response?.data?.message ?? 'Error al crear el certificado');
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
        timeout: DOWNLOAD_PDF_TIMEOUT_MS,
      });
      return response.data as Blob;
    } catch (error) {
      const axiosError = error as AxiosError<Blob | { message?: string }>;
      const message = await getMessageFromBlobError(
        axiosError,
        `Error al descargar el certificado con ID ${id}`,
      );
      throw new Error(message);
    }
  }

  /**
   * Buscar certificado por inscripción ID
   * @param inscripcionId ID de la inscripción
   * @returns Certificado encontrado o null si no existe
   */
  async findByInscripcion(inscripcionId: number): Promise<Certificate | null> {
    try {
      // Obtener el personaId del usuario actual
      const authStore = useAuthStore();
      const profile = authStore.profile as { personaId?: number; persona?: { id?: number } } | null;
      const personaId = profile?.personaId || profile?.persona?.id;

      if (!personaId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Buscar certificados del usuario usando el endpoint de estudiante
      // y filtrar por inscripcionId
      const estudianteId = Number.parseInt(personaId.toString(), 10);
      const response = await api.post<BackendPaginatedResponse>(
        `${this.baseUrl}/estudiante/${estudianteId}`,
        {
          page: 1,
          limit: 100,
          sortField: 'fechaEmision',
          sortOrder: 'DESC',
        },
      );

      if (!response.data || !Array.isArray(response.data.data)) {
        return null;
      }

      // Buscar el certificado que tenga inscripcion.id === inscripcionId
      for (const item of response.data.data) {
        if (item.inscripcion?.id === inscripcionId) {
          return mapBackendToDomain(item);
        }
      }

      return null;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Error al buscar certificado por inscripción:', error);
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al buscar el certificado para la inscripción ${inscripcionId}`,
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
        timeout: DOWNLOAD_PDF_TIMEOUT_MS,
      });
      return response.data as Blob;
    } catch (error) {
      const axiosError = error as AxiosError<Blob | { message?: string }>;
      const message = await getMessageFromBlobError(
        axiosError,
        `Error al obtener el certificado con ID ${id} para visualización`,
      );
      throw new Error(message);
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
          idCapacitacion?: number | string;
        };
      }>(`/public/verify/${token}`);

      // Mapear respuesta pública a CertificateVerification
      return {
        certificate: response.data.certificado
          ? {
              id: '',
              courseId: String(response.data.certificado.idCapacitacion ?? ''),
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
      throw new Error(axiosError.response?.data?.message ?? 'Error al verificar el certificado');
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
        axiosError.response?.data?.message ??
          'Error al obtener el reporte de certificados próximos a vencer',
      );
    }
  }

  async getAlertConfigurations(): Promise<
    Array<{
      id: number;
      diasAntesVencimiento: number;
      activo: boolean;
    }>
  > {
    try {
      const response = await api.get<
        Array<{
          id: number;
          diasAntesVencimiento: number;
          activo: number | boolean; // El backend puede enviar número (1/0) o boolean
        }>
      >('/certificates/alert-configurations');
      // Convertir número (1/0) a boolean
      return response.data.map((config) => ({
        id: config.id,
        diasAntesVencimiento: config.diasAntesVencimiento,
        activo: typeof config.activo === 'number' ? config.activo === 1 : Boolean(config.activo),
      }));
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
      // Convertir boolean a número (1/0) para enviar al backend
      const dtoParaBackend = {
        diasAntesVencimiento: dto.diasAntesVencimiento,
        activo: dto.activo ? 1 : 0,
      };

      const response = await api.patch<{
        id: number;
        diasAntesVencimiento: number;
        activo: number | boolean; // El backend puede retornar número (1/0) o boolean
      }>(`/certificates/alert-configurations/${id}`, dtoParaBackend);

      // Convertir número (1/0) a boolean en la respuesta
      return {
        id: response.data.id,
        diasAntesVencimiento: response.data.diasAntesVencimiento,
        activo:
          typeof response.data.activo === 'number'
            ? response.data.activo === 1
            : Boolean(response.data.activo),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al actualizar la configuración de alerta con ID ${id}`,
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

  /**
   * Buscar certificados por hash o texto (para editor de PDF)
   * @param search Término de búsqueda (hash, nombre estudiante, curso, etc.)
   * @param limit Límite de resultados (default: 20)
   * @returns Lista de certificados con información básica
   */
  async searchHashes(
    search?: string,
    limit: number = 20,
  ): Promise<
    Array<{
      id: number;
      hashVerificacion: string;
      numeroCertificado: string;
      estudianteNombre: string;
      cursoNombre: string;
      fechaEmision: string;
    }>
  > {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await api.get<
        Array<{
          id: number;
          hashVerificacion: string;
          numeroCertificado: string;
          estudianteNombre: string;
          cursoNombre: string;
          fechaEmision: string;
        }>
      >(`${this.baseUrl}/search/hashes?${params.toString()}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al buscar certificados');
    }
  }
}

// Exportar instancia singleton
export const certificatesService = new CertificatesService();
