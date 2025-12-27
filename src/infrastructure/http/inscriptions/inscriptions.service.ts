// Implementación HTTP del repositorio de inscripciones
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import axios from 'axios';
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
// Extender Inscription para incluir documentNumber
export interface InscriptionWithDocument extends Inscription {
  documentNumber?: string;
  inscriptionId?: string; // ID de la inscripción para poder actualizar
}

function mapBackendToDomain(backendData: BackendInscripcion): InscriptionWithDocument {
  // Manejar caso cuando estudiante no está cargado (puede pasar en findByEstudiante)
  const estudiante = backendData.estudiante;
  const nombreCompleto = estudiante 
    ? `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim()
    : '';

  const inscription: InscriptionWithDocument = {
    id: backendData.id?.toString() ?? '',
    inscriptionId: backendData.id?.toString() ?? '', // Guardar ID de inscripción para actualizaciones
    courseId: backendData.capacitacion?.id?.toString() ?? '',
    courseName: backendData.capacitacion?.titulo ?? '',
    userId: estudiante?.id?.toString() ?? '',
    userName: nombreCompleto || estudiante?.numeroDocumento || 'Usuario desconocido',
    enrolledDate: backendData.fechaInscripcion ?? new Date().toISOString(),
    progress: backendData.progresoPorcentaje ? backendData.progresoPorcentaje / 100 : 0,
    status: mapStatus(backendData.estado),
    documentNumber: estudiante?.numeroDocumento,
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
      console.log(`📡 Obteniendo inscripciones para userId: ${userId}`);
      
      // Usar el endpoint específico /estudiante/:estudianteId que SÍ permite ALUMNO
      // El PaginationDto es opcional, pero si lo enviamos debe tener el formato correcto
      const pageSize = 100; // Máximo permitido por el backend
      let allInscriptions: BackendInscripcion[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`📡 Llamando a ${this.baseUrl}/estudiante/${userId}, página=${currentPage}`);
        
        // Enviar PaginationDto con tipos correctos (números, no strings)
        const response = await api.post<BackendPaginatedResponse>(
          `${this.baseUrl}/estudiante/${userId}`,
          {
            page: currentPage,
            limit: pageSize,
          },
        );
        
        console.log(`✅ Respuesta página ${currentPage}:`, response.data);
        
        if (response.data?.data && Array.isArray(response.data.data)) {
          allInscriptions = [...allInscriptions, ...response.data.data];
          
          // Verificar si hay más páginas
          hasMore = currentPage < (response.data.totalPages || 0);
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`✅ Total de inscripciones obtenidas: ${allInscriptions.length}`);
      // Mapear todas las inscripciones obtenidas
      return allInscriptions.map(mapBackendToDomain);
    } catch (error) {
      // Log completo del error para depuración
      console.error('❌ Error completo capturado:', error);
      console.error('❌ Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Stack del error:', error instanceof Error ? error.stack : 'No hay stack');
      
      // El interceptor de axios puede transformar el error, pero el error original
      // puede estar en error.cause o podemos acceder directamente al error de axios
      // Intentar obtener el error original de axios si está disponible
      let axiosError: AxiosError<{ message?: string | string[]; error?: string }> | null = null;
      
      // Verificar si es un error de axios directamente
      if (axios.isAxiosError(error)) {
        axiosError = error;
      } else if (error instanceof Error && 'cause' in error && axios.isAxiosError(error.cause)) {
        // El interceptor puede haber envuelto el error, intentar obtenerlo del cause
        axiosError = error.cause as AxiosError<{ message?: string | string[]; error?: string }>;
      }
      
      if (axiosError) {
        const axiosError = error as AxiosError<{ message?: string | string[]; error?: string }>;
        const status = axiosError.response?.status;
        const statusText = axiosError.response?.statusText;
        const errorData = axiosError.response?.data;
        const requestUrl = axiosError.config?.url;
        const requestMethod = axiosError.config?.method;
        
        console.error('❌ Error detallado de Axios:', {
          status,
          statusText,
          data: errorData,
          url: requestUrl,
          method: requestMethod,
          code: axiosError.code,
          message: axiosError.message,
          hasResponse: !!axiosError.response,
          fullResponse: axiosError.response,
        });
        
        // Proporcionar mensaje más descriptivo
        let errorMessage = `Error al obtener las inscripciones del usuario ${userId}`;
        
        // Si no hay respuesta, es un error de red
        if (!axiosError.response) {
          if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
            errorMessage = 'Timeout: El servidor tardó demasiado en responder';
          } else if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('Network Error')) {
            errorMessage = 'Error de red: No se pudo conectar al servidor';
          } else {
            errorMessage = `Error de conexión: ${axiosError.message || 'No se pudo establecer conexión con el servidor'}`;
          }
        } else if (status === 400) {
          // Error de validación - mostrar detalles del error
          if (Array.isArray(errorData?.message)) {
            errorMessage = `Errores de validación: ${errorData.message.join(', ')}`;
          } else {
            const validationErrors = errorData?.message || errorData?.error || 'Datos de petición inválidos';
            errorMessage = `Error de validación: ${validationErrors}`;
          }
        } else if (status === 404) {
          errorMessage = `No se encontraron inscripciones para el usuario ${userId}`;
        } else if (status === 401) {
          errorMessage = 'No autorizado. Verifique su sesión.';
        } else if (status === 403) {
          errorMessage = 'No tiene permisos para ver estas inscripciones.';
        } else if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (status) {
          errorMessage = `Error del servidor (${status}): ${statusText || 'Error desconocido'}`;
        }
        
        throw new Error(errorMessage);
      } else {
        // Error que no es de axios o fue transformado por el interceptor
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener inscripciones';
        console.error('❌ Error no relacionado con Axios o transformado:', errorMessage);
        console.error('❌ Error completo para análisis:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        // Si el mensaje contiene información del error HTTP, intentar extraerla
        if (errorMessage.includes('Error 400') || errorMessage.includes('400')) {
          throw new Error('Error de validación: Los datos enviados no son válidos. Verifique los logs del servidor.');
        } else if (errorMessage.includes('Error 404') || errorMessage.includes('404')) {
          throw new Error(`No se encontraron inscripciones para el usuario ${userId}`);
        } else {
          throw new Error(`Error al obtener inscripciones: ${errorMessage}`);
        }
      }
    }
  }

  async findByCourse(courseId: string): Promise<InscriptionWithDocument[]> {
    try {
      console.log(`📡 Obteniendo inscripciones para courseId: ${courseId}`);
      
      // El backend tiene un límite máximo de 100 por página según PaginationDto
      // Hacer múltiples peticiones si es necesario para obtener todas las inscripciones
      const pageSize = 100; // Máximo permitido por el backend
      let allInscriptions: BackendInscripcion[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`📡 Llamando a ${this.baseUrl}/capacitacion/${courseId}, página=${currentPage}`);
        
        // Enviar PaginationDto con tipos correctos (números, no strings)
        const response = await api.post<BackendPaginatedResponse>(
          `${this.baseUrl}/capacitacion/${courseId}`,
          {
            page: currentPage,
            limit: pageSize,
          },
        );
        
        console.log(`✅ Respuesta página ${currentPage}:`, response.data);
        
        if (response.data?.data && Array.isArray(response.data.data)) {
          allInscriptions = [...allInscriptions, ...response.data.data];
          
          // Verificar si hay más páginas
          hasMore = currentPage < (response.data.totalPages || 0);
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`✅ Total de inscripciones obtenidas: ${allInscriptions.length}`);
      // Mapear todas las inscripciones obtenidas
      return allInscriptions.map(mapBackendToDomain) as InscriptionWithDocument[];
    } catch (error) {
      console.error('❌ Error al obtener inscripciones del curso:', error);
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