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
}

interface BackendModalidad {
  id: number;
  nombre: string;
}

interface BackendPersona {
  id: number;
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
  const training: Training = {
    id: backendData.id?.toString() ?? '',
    title: backendData.titulo ?? '',
    description: backendData.descripcion ?? '',
    type: mapTipoCapacitacion(backendData.tipoCapacitacion),
    modality: mapModalidad(backendData.modalidad),
    instructor: backendData.instructor?.nombreCompleto ?? backendData.instructor?.nombre ?? '',
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
    attachments: backendData.materiales?.filter((m: BackendMaterial) => m.tipoMaterial?.nombre === 'archivo').map((m: BackendMaterial) => ({
      id: m.id?.toString() ?? '',
      type: 'file' as const,
      label: m.nombre ?? '',
      url: m.url ?? '',
    })) ?? [],
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
    training.startDate = backendData.fechaInicio;
  }
  if (backendData.fechaFin) {
    training.endDate = backendData.fechaFin;
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

  return training;
}

function mapTipoCapacitacion(tipo: BackendTipoCapacitacion | undefined): 'standard' | 'certified' | 'survey' {
  if (!tipo) return 'standard';
  const nombre = tipo.nombre?.toLowerCase() ?? '';
  if (nombre.includes('certificad')) return 'certified';
  if (nombre.includes('encuesta') || nombre.includes('survey')) return 'survey';
  return 'standard';
}

function mapModalidad(modalidad: BackendModalidad | undefined): 'online' | 'onsite' | 'hybrid' {
  if (!modalidad) return 'online';
  const nombre = modalidad.nombre?.toLowerCase() ?? '';
  if (nombre.includes('presencial') || nombre.includes('onsite')) return 'onsite';
  if (nombre.includes('mixt') || nombre.includes('hybrid')) return 'hybrid';
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
    try {
      const response = await api.get<BackendCapacitacion>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
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
      const response = await api.patch<BackendCapacitacion>(`${this.baseUrl}/${id}`, dto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar la capacitación con ID ${id}`,
      );
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

