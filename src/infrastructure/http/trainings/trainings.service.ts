// Implementación HTTP del repositorio de capacitaciones
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  ITrainingRepository,
  PaginationParams,
  PaginatedResponse,
  CreateTrainingDto,
  UpdateTrainingDto,
} from '../../../application/training/training.repository.port';
import type { Training, TrainingSection, TrainingStudent, TrainingStatus } from '../../../domain/training/models';

/**
 * Tipos para las respuestas del backend
 */
interface BackendTipoCapacitacion {
  id: number;
  nombre: string;
  codigo?: string;
}

interface BackendModalidad {
  id: number;
  nombre: string;
  codigo?: string;
}

interface BackendPersona {
  id: number;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  nombre?: string;
  email?: string;
}

interface BackendLeccion {
  id: number;
  titulo: string;
  descripcion?: string;
  contenido?: string;
  videoUrl?: string;
  duracionMinutos?: number;
  orden: number;
  activo: boolean;
}

interface BackendSeccion {
  id: number;
  titulo: string;
  descripcion?: string;
  lecciones?: BackendLeccion[];
  orden: number;
  activo: boolean;
}

interface BackendMaterial {
  id: number;
  nombre: string;
  url: string;
  tipoMaterial?: {
    nombre: string;
  };
}

interface BackendInscripcion {
  id: number;
  progreso?: number;
  calificacionFinal?: number;
  alumno?: {
    id: number;
    persona?: BackendPersona;
  };
  resena?: {
    calificacion: number;
  };
}

interface BackendResena {
  id: number;
  alumnoId?: number;
  calificacion: number;
  comentario?: string;
  fechaCreacion?: string;
}

interface BackendEvaluacion {
  id: number;
  titulo: string;
  descripcion?: string;
  tiempoLimiteMinutos?: number;
  intentosPermitidos: number;
  minimoAprobacion: number;
  activo: boolean;
}

interface BackendCapacitacion {
  id: number;
  titulo: string;
  descripcion?: string;
  tipoCapacitacion?: BackendTipoCapacitacion;
  modalidad?: BackendModalidad;
  instructor?: BackendPersona;
  areaId?: number;
  publicoObjetivo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  duracionHoras?: number;
  capacidadMaxima?: number;
  imagenPortadaUrl?: string;
  videoPromocionalUrl?: string;
  promedioCalificacion?: number;
  estado?: 'borrador' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  secciones?: BackendSeccion[];
  materiales?: BackendMaterial[];
  inscripciones?: BackendInscripcion[];
  resenas?: BackendResena[];
  evaluaciones?: BackendEvaluacion[];
}

interface BackendPaginatedResponse {
  data: BackendCapacitacion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendCapacitacion): Training {
  // Debug: Log para ver qué datos estamos recibiendo del backend
  if (!backendData.tipoCapacitacion || !backendData.modalidad) {
    console.warn('[mapBackendToDomain] Datos incompletos:', {
      id: backendData.id,
      titulo: backendData.titulo,
      tipoCapacitacion: backendData.tipoCapacitacion,
      modalidad: backendData.modalidad,
      evaluaciones: backendData.evaluaciones?.length || 0,
    });
  } else {
    console.log('[mapBackendToDomain] Datos recibidos:', {
      id: backendData.id,
      titulo: backendData.titulo,
      tipoCapacitacion: {
        id: backendData.tipoCapacitacion.id,
        nombre: backendData.tipoCapacitacion.nombre,
        codigo: backendData.tipoCapacitacion.codigo,
      },
      modalidad: {
        id: backendData.modalidad.id,
        nombre: backendData.modalidad.nombre,
        codigo: backendData.modalidad.codigo,
      },
      evaluaciones: backendData.evaluaciones?.map((e: BackendEvaluacion) => ({
        id: e.id,
        titulo: e.titulo,
        activo: e.activo,
      })) || [],
      totalEvaluaciones: backendData.evaluaciones?.length || 0,
    });
  }
  
  const training: Training = {
    id: backendData.id?.toString() ?? '',
    title: backendData.titulo ?? '',
    description: backendData.descripcion ?? '',
    type: mapTipoCapacitacion(backendData.tipoCapacitacion),
    modality: mapModalidad(backendData.modalidad),
    instructor: backendData.instructor
      ? backendData.instructor.nombreCompleto ||
        (backendData.instructor.nombres && backendData.instructor.apellidos
          ? `${backendData.instructor.nombres} ${backendData.instructor.apellidos}`.trim()
          : backendData.instructor.nombres || backendData.instructor.nombre || '')
      : '',
    area: backendData.areaId?.toString() ?? '',
    studentsCount: backendData.inscripciones?.length ?? 0,
    averageRating: backendData.promedioCalificacion ?? 0,
    sections: backendData.secciones
      ?.filter((s: BackendSeccion) => s.activo !== false)
      .sort((a: BackendSeccion, b: BackendSeccion) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((s: BackendSeccion): TrainingSection => {
        const leccionesActivas = s.lecciones?.filter((l: BackendLeccion) => l.activo !== false) ?? [];
        const duracionTotal = leccionesActivas.reduce(
          (total: number, l: BackendLeccion) => total + (l.duracionMinutos ?? 0),
          0,
        );

        const section: TrainingSection = {
          id: s.id?.toString() ?? '',
          title: s.titulo ?? '',
          lessonsCount: leccionesActivas.length,
          durationMinutes: duracionTotal || 0,
        };
        if (s.descripcion) {
          section.description = s.descripcion;
        }
        return section;
      }) ?? [],
    attachments: backendData.materiales
      ?.filter((m: BackendMaterial) => {
        const tipoNombre = m.tipoMaterial?.nombre?.toLowerCase() || '';
        // Incluir archivos (PDF, Word, etc.) y videos
        return tipoNombre.includes('archivo') || tipoNombre === 'video';
      })
      .map((m: BackendMaterial) => {
        const tipoNombre = m.tipoMaterial?.nombre?.toLowerCase() || '';
        const isVideo = tipoNombre === 'video';
        const attachmentType: 'file' | 'video' = isVideo ? 'video' : 'file';
        return {
          id: m.id?.toString() ?? '',
          type: attachmentType,
          label: m.nombre ?? '',
          url: m.url ?? '',
        };
      }) ?? [],
    images: backendData.materiales?.filter((m: BackendMaterial) => m.tipoMaterial?.nombre === 'imagen').map((m: BackendMaterial) => ({
      id: m.id?.toString() ?? '',
      url: m.url ?? '',
      alt: m.nombre,
    })) ?? [],
    students: backendData.inscripciones?.map((i: BackendInscripcion): TrainingStudent => {
      const student: TrainingStudent = {
        id: i.alumno?.id?.toString() ?? '',
        name: i.alumno?.persona?.nombreCompleto ?? '',
        email: i.alumno?.persona?.email ?? '',
        progress: i.progreso ?? 0,
      };
      if (i.calificacionFinal !== undefined && i.calificacionFinal !== null) {
        student.score = i.calificacionFinal;
      }
      if (i.resena?.calificacion !== undefined && i.resena?.calificacion !== null) {
        student.rating = i.resena.calificacion;
      }
      return student;
    }) ?? [],
    reviews: backendData.resenas?.map((r: BackendResena) => ({
      id: r.id?.toString() ?? '',
      studentId: r.alumnoId?.toString() ?? '',
      rating: r.calificacion ?? 0,
      comment: r.comentario ?? '',
      createdAt: r.fechaCreacion ?? '',
    })) ?? [],
  };

  // Agregar propiedades opcionales solo si existen
  if (backendData.imagenPortadaUrl) {
    training.coverImageUrl = backendData.imagenPortadaUrl;
  }
  if (backendData.videoPromocionalUrl) {
    training.promoVideoUrl = backendData.videoPromocionalUrl;
  }
  if (backendData.publicoObjetivo) {
    training.targetAudience = backendData.publicoObjetivo;
  }
  if (backendData.fechaInicio) {
    // Convertir fecha a string en formato YYYY-MM-DD para el input date
    const fechaInicio = typeof backendData.fechaInicio === 'string' 
      ? backendData.fechaInicio 
      : new Date(backendData.fechaInicio).toISOString().split('T')[0];
    if (fechaInicio) {
      training.startDate = fechaInicio;
    }
  }
  if (backendData.fechaFin) {
    // Convertir fecha a string en formato YYYY-MM-DD para el input date
    const fechaFin = typeof backendData.fechaFin === 'string'
      ? backendData.fechaFin
      : new Date(backendData.fechaFin).toISOString().split('T')[0];
    if (fechaFin) {
      training.endDate = fechaFin;
    }
  }
  if (backendData.duracionHoras !== undefined && backendData.duracionHoras !== null) {
    training.durationHours = backendData.duracionHoras;
  }
  if (backendData.capacidadMaxima !== undefined && backendData.capacidadMaxima !== null) {
    training.capacity = backendData.capacidadMaxima;
  }

  // Mapear estado del backend al frontend
  if (backendData.estado) {
    const estadoMap: Record<string, TrainingStatus> = {
      borrador: 'draft',
      publicada: 'published',
      en_curso: 'active',
      finalizada: 'finished',
      cancelada: 'cancelled',
    };
    training.status = estadoMap[backendData.estado] || 'draft';
  } else {
    // Si no hay estado, inferir según otros campos
    training.status = 'draft';
  }

  // Extender el objeto Training para incluir evaluaciones (usado por TrainingWithEvaluations)
  const trainingWithEvals = training as Training & { evaluations?: Array<{ id: number | string }> };
  
  // Mapear evaluaciones del backend
  if (backendData.evaluaciones && backendData.evaluaciones.length > 0) {
    trainingWithEvals.evaluations = backendData.evaluaciones
      .filter((e: BackendEvaluacion) => e.activo !== false)
      .map((e: BackendEvaluacion) => ({
        id: e.id,
      }));
  }

  return trainingWithEvals as Training;
}

function mapTipoCapacitacion(tipo: BackendTipoCapacitacion | undefined): 'standard' | 'certified' | 'survey' {
  if (!tipo) {
    console.warn('[mapTipoCapacitacion] Tipo no definido, usando default: standard');
    return 'standard';
  }
  
  // Usar el código si está disponible (viene en mayúsculas del backend)
  const codigo = tipo.codigo?.toUpperCase() ?? '';
  const nombre = tipo.nombre?.toLowerCase() ?? '';
  
  // Debug: Log para ver qué datos estamos recibiendo
  if (!codigo) {
    console.warn('[mapTipoCapacitacion] Tipo sin código, usando nombre:', { nombre, tipo });
  }
  
  // Mapear códigos del backend a valores del frontend
  if (codigo) {
    if (codigo === 'STANDARD' || codigo === 'ESTANDAR') return 'standard';
    if (codigo === 'CERTIFIED' || codigo === 'CERTIFICADA') return 'certified';
    if (codigo === 'SURVEY' || codigo === 'ENCUESTA') return 'survey';
  }
  
  // Fallback: inferir del nombre si no hay código o no coincide
  if (nombre.includes('certificad')) return 'certified';
  if (nombre.includes('encuesta') || nombre.includes('survey')) return 'survey';
  if (nombre.includes('estandar') || nombre.includes('standard')) return 'standard';
  
  console.warn('[mapTipoCapacitacion] No se pudo mapear tipo, usando default:', { codigo, nombre, tipo });
  return 'standard';
}

function mapModalidad(modalidad: BackendModalidad | undefined): 'online' | 'onsite' | 'hybrid' {
  if (!modalidad) {
    console.warn('[mapModalidad] Modalidad no definida, usando default: online');
    return 'online';
  }
  
  // Usar el código si está disponible (viene en mayúsculas del backend)
  const codigo = modalidad.codigo?.toUpperCase() ?? '';
  const nombre = modalidad.nombre?.toLowerCase() ?? '';
  
  // Debug: Log para ver qué datos estamos recibiendo
  if (!codigo) {
    console.warn('[mapModalidad] Modalidad sin código, usando nombre:', { nombre, modalidad });
  }
  
  // Mapear códigos del backend a valores del frontend
  if (codigo) {
    if (codigo === 'ONLINE') return 'online';
    if (codigo === 'ONSITE' || codigo === 'PRESENCIAL') return 'onsite';
    if (codigo === 'HYBRID' || codigo === 'MIXTA') return 'hybrid';
  }
  
  // Fallback: inferir del nombre si no hay código o no coincide
  if (nombre.includes('presencial') || nombre.includes('onsite')) return 'onsite';
  if (nombre.includes('mixt') || nombre.includes('hybrid')) return 'hybrid';
  
  console.warn('[mapModalidad] No se pudo mapear modalidad, usando default:', { codigo, nombre, modalidad });
  return 'online';
}

/**
 * Servicio HTTP para capacitaciones
 * Implementa el puerto ITrainingRepository usando axios
 */
export class TrainingsService implements ITrainingRepository {
  private readonly baseUrl = '/capacitaciones';

  async findAll(params: PaginationParams): Promise<PaginatedResponse<Training>> {
    try {
      const response = await api.post<BackendPaginatedResponse>(`${this.baseUrl}/list`, {
        page: params.page,
        limit: params.limit,
        search: params.search,
        filters: params.filters,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
      });

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
        axiosError.response?.data?.message ?? 'Error al obtener la lista de capacitaciones',
      );
    }
  }

  async findOne(id: number): Promise<Training> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/794b7ee2-a122-493a-b76e-867daeb9e2ee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trainings.service.ts:287',message:'findOne entry',data:{id,url:`${this.baseUrl}/${id}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/794b7ee2-a122-493a-b76e-867daeb9e2ee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trainings.service.ts:289',message:'before api.get',data:{id,url:`${this.baseUrl}/${id}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const response = await api.get<BackendCapacitacion>(`${this.baseUrl}/${id}`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/794b7ee2-a122-493a-b76e-867daeb9e2ee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trainings.service.ts:290',message:'api.get success',data:{id,status:response.status,hasData:!!response.data,dataKeys:response.data?Object.keys(response.data):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/794b7ee2-a122-493a-b76e-867daeb9e2ee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trainings.service.ts:292',message:'api.get error',data:{id,status:axiosError.response?.status,statusText:axiosError.response?.statusText,errorMessage:axiosError.response?.data?.message,hasResponse:!!axiosError.response,errorCode:axiosError.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener la capacitación con ID ${id}`,
      );
    }
  }

  async create(dto: CreateTrainingDto): Promise<Training> {
    try {
      const response = await api.post<BackendCapacitacion>(this.baseUrl, dto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear la capacitación',
      );
    }
  }

  async update(id: number, dto: UpdateTrainingDto): Promise<Training> {
    try {
      console.log(`[TrainingsService] Updating training ${id} with DTO:`, JSON.stringify(dto, null, 2));
      const response = await api.patch<BackendCapacitacion>(`${this.baseUrl}/${id}`, dto);
      console.log(`[TrainingsService] Update successful for training ${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const errorMessage = axiosError.response?.data?.message
        ?? axiosError.response?.data?.error
        ?? axiosError.message
        ?? `Error al actualizar la capacitación con ID ${id}`;

      console.error(`[TrainingsService] Error updating training ${id}:`, {
        message: errorMessage,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        dto: JSON.stringify(dto, null, 2),
      });

      throw new Error(errorMessage);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar la capacitación con ID ${id}`,
      );
    }
  }
}

// Exportar instancia singleton
export const trainingsService = new TrainingsService();

