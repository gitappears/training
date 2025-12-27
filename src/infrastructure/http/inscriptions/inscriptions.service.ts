// Implementación HTTP del repositorio de inscripciones
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IInscriptionRepository,
  Inscription,
  CreateInscriptionDto,
  UpdateInscriptionDto,
  InscriptionListParams,
} from '../../../application/inscription/inscription.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendCapacitacion {
  id: number;
  titulo: string;
}

interface BackendPersona {
  id: number;
  nombres: string;
  apellidos: string;
  numeroDocumento?: string;
  email?: string;
}

interface BackendInscripcion {
  id: number;
  capacitacion: BackendCapacitacion;
  estudiante: BackendPersona;
  fechaInscripcion: string;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;
  progresoPorcentaje: number;
  estado: 'inscrito' | 'en_progreso' | 'completado' | 'abandonado';
  calificacionFinal?: number | null;
  aprobado?: boolean | null;
  pago?: {
    id: number;
  } | null;
}

interface BackendPaginatedResponse {
  data: BackendInscripcion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Mapea el estado del backend al modelo del frontend
 */
function mapStatus(
  estado: 'inscrito' | 'en_progreso' | 'completado' | 'abandonado',
): 'enrolled' | 'in_progress' | 'completed' | 'cancelled' {
  const estadoMap: Record<string, 'enrolled' | 'in_progress' | 'completed' | 'cancelled'> = {
    inscrito: 'enrolled',
    en_progreso: 'in_progress',
    completado: 'completed',
    abandonado: 'cancelled',
  };
  return estadoMap[estado] || 'enrolled';
}

/**
 * Mapea el estado del frontend al backend
 */
function mapStatusToBackend(
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled',
): 'inscrito' | 'en_progreso' | 'completado' | 'abandonado' {
  const statusMap: Record<string, 'inscrito' | 'en_progreso' | 'completado' | 'abandonado'> = {
    enrolled: 'inscrito',
    in_progress: 'en_progreso',
    completed: 'completado',
    cancelled: 'abandonado',
  };
  return statusMap[status] || 'inscrito';
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendInscripcion): Inscription {
  // Validar que los datos necesarios estén presentes
  if (!backendData) {
    throw new Error('Datos de inscripción no válidos');
  }

  const estudiante = backendData.estudiante;
  const capacitacion = backendData.capacitacion;

  // Construir nombre completo de forma segura
  let nombreCompleto = '';
  if (estudiante) {
    const nombres = estudiante.nombres || '';
    const apellidos = estudiante.apellidos || '';
    nombreCompleto = `${nombres} ${apellidos}`.trim();
  }

  const inscription: Inscription = {
    id: backendData.id?.toString() ?? '',
    courseId: capacitacion?.id?.toString() ?? '',
    courseName: capacitacion?.titulo ?? 'Curso sin nombre',
    userId: estudiante?.id?.toString() ?? '',
    userName: nombreCompleto || estudiante?.numeroDocumento || 'Usuario desconocido',
    enrolledDate: backendData.fechaInscripcion ?? new Date().toISOString(),
    progress: backendData.progresoPorcentaje ? backendData.progresoPorcentaje / 100 : 0,
    status: mapStatus(backendData.estado),
  };

  if (backendData.fechaFinalizacion) {
    inscription.completedDate = backendData.fechaFinalizacion;
  }

  if (backendData.calificacionFinal !== null && backendData.calificacionFinal !== undefined) {
    inscription.score = backendData.calificacionFinal;
  }

  return inscription;
}

/**
 * Servicio HTTP para inscripciones
 * Implementa el puerto IInscriptionRepository usando axios
 */
export class InscriptionsService implements IInscriptionRepository {
  private readonly baseUrl = '/inscripciones';

  async findAll(params: InscriptionListParams): Promise<{
    data: Inscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const requestBody: {
        page: number;
        limit: number;
        filters?: {
          capacitacionId?: number;
          estudianteId?: number;
          estado?: string;
        };
        sortField?: string;
        sortOrder?: string;
      } = {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      };

      // Agregar filtros si existen
      if (params.courseId || params.userId || params.status) {
        requestBody.filters = {};
        if (params.courseId) {
          requestBody.filters.capacitacionId = Number.parseInt(params.courseId);
        }
        if (params.userId) {
          requestBody.filters.estudianteId = Number.parseInt(params.userId);
        }
        if (params.status) {
          requestBody.filters.estado = mapStatusToBackend(params.status);
        }
      }

      // Agregar ordenamiento
      if (params.sortBy) {
        requestBody.sortField = params.sortBy;
        requestBody.sortOrder = params.sortOrder?.toUpperCase() || 'ASC';
      }

      const response = await api.post<BackendPaginatedResponse>(`${this.baseUrl}/list`, requestBody);

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
        axiosError.response?.data?.message ?? 'Error al obtener la lista de inscripciones',
      );
    }
  }

  async findOne(id: string): Promise<Inscription> {
    try {
      const response = await api.get<BackendInscripcion>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener la inscripción con ID ${id}`,
      );
    }
  }

  async findByUser(userId: string): Promise<Inscription[]> {
    try {
      // Validar que userId sea un número válido
      const estudianteId = Number.parseInt(userId, 10);
      if (Number.isNaN(estudianteId)) {
        throw new Error(`ID de usuario inválido: ${userId}`);
      }

      const response = await api.post<BackendPaginatedResponse>(
        `${this.baseUrl}/estudiante/${estudianteId}`,
        {
          page: 1,
          limit: 100, // Máximo permitido por el backend
        },
      );
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Respuesta inesperada del backend:', response.data);
        return [];
      }
      
      // Mapear las inscripciones con manejo de errores individual
      const inscriptions: Inscription[] = [];
      for (const item of response.data.data) {
        try {
          const inscription = mapBackendToDomain(item);
          inscriptions.push(inscription);
        } catch (error) {
          console.error('Error al mapear inscripción:', error, item);
          // Continuar con las siguientes inscripciones
        }
      }
      
      return inscriptions;
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
        console.warn(`No se encontraron inscripciones para el usuario ${userId}`);
        return [];
      }
      
      const errorMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        `Error al obtener las inscripciones del usuario ${userId}`;
      
      throw new Error(errorMessage);
    }
  }

  async findByCourse(courseId: string): Promise<Inscription[]> {
    try {
      const response = await api.post<BackendPaginatedResponse>(
        `${this.baseUrl}/capacitacion/${courseId}`,
        {
          page: 1,
          limit: 100, // Máximo permitido por el backend
        },
      );
      return response.data.data.map(mapBackendToDomain);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener las inscripciones del curso ${courseId}`,
      );
    }
  }

  async create(dto: CreateInscriptionDto): Promise<Inscription> {
    try {
      const requestBody: {
        capacitacionId: number;
        estudianteId: number;
        pagoId?: number;
      } = {
        capacitacionId: Number.parseInt(dto.courseId),
        estudianteId: Number.parseInt(dto.userId),
      };

      if (dto.paymentId) {
        requestBody.pagoId = Number.parseInt(dto.paymentId);
      }

      const response = await api.post<BackendInscripcion>(this.baseUrl, requestBody);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ?? 'Error al crear la inscripción';
      throw new Error(errorMessage);
    }
  }

  async update(id: string, dto: UpdateInscriptionDto): Promise<Inscription> {
    try {
      const requestBody: {
        estado?: string;
        progresoPorcentaje?: number;
        calificacionFinal?: number;
      } = {};

      if (dto.status) {
        requestBody.estado = mapStatusToBackend(dto.status);
      }

      if (dto.progress !== undefined) {
        requestBody.progresoPorcentaje = dto.progress * 100; // Convertir de 0-1 a 0-100
      }

      if (dto.score !== undefined) {
        requestBody.calificacionFinal = dto.score;
      }

      const response = await api.patch<BackendInscripcion>(`${this.baseUrl}/${id}`, requestBody);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar la inscripción con ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar la inscripción con ID ${id}`,
      );
    }
  }

  async assignCourse(courseId: string, userId: string, paymentId?: string): Promise<Inscription> {
    const dto: CreateInscriptionDto = { courseId, userId };
    if (paymentId) {
      dto.paymentId = paymentId;
    }
    return this.create(dto);
  }
}

// Exportar instancia singleton
export const inscriptionsService = new InscriptionsService();