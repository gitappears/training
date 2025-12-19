// Implementación HTTP del repositorio de inscripciones
// Adaptador que conecta la capa de aplicación con la API REST

// import { api } from '../../../boot/axios'; // TODO: Descomentar cuando backend esté listo
import type { AxiosError } from 'axios';
import type {
  IInscriptionRepository,
  Inscription,
  CreateInscriptionDto,
  UpdateInscriptionDto,
  InscriptionListParams,
} from '../../../application/inscription/inscription.repository.port';

/**
 * Tipos para las respuestas del backend (mock por ahora)
 */
interface BackendInscription {
  id: number;
  courseId: number;
  courseName: string;
  userId: number;
  userName: string;
  enrolledDate: string;
  progress: number;
  status: string;
  completedDate?: string;
  score?: number;
  certificateId?: number;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendInscription): Inscription {
  const inscription: Inscription = {
    id: backendData.id?.toString() ?? '',
    courseId: backendData.courseId?.toString() ?? '',
    courseName: backendData.courseName ?? '',
    userId: backendData.userId?.toString() ?? '',
    userName: backendData.userName ?? '',
    enrolledDate: backendData.enrolledDate ?? new Date().toISOString(),
    progress: backendData.progress ?? 0,
    status: mapStatus(backendData.status),
  };

  if (backendData.completedDate) {
    inscription.completedDate = backendData.completedDate;
  }
  if (backendData.score !== undefined) {
    inscription.score = backendData.score;
  }
  if (backendData.certificateId) {
    inscription.certificateId = backendData.certificateId.toString();
  }

  return inscription;
}

function mapStatus(status: string): 'enrolled' | 'in_progress' | 'completed' | 'cancelled' {
  const normalized = status?.toLowerCase() ?? 'enrolled';
  if (normalized.includes('progress')) return 'in_progress';
  if (normalized.includes('complete')) return 'completed';
  if (normalized.includes('cancel')) return 'cancelled';
  return 'enrolled';
}

/**
 * Servicio HTTP para inscripciones
 * Implementa el puerto IInscriptionRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class InscriptionsService implements IInscriptionRepository {
  private readonly baseUrl = '/inscripciones';

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(params: InscriptionListParams): Promise<{
    data: Inscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Mock por ahora
      const mockInscriptions: BackendInscription[] = [
        {
          id: 1,
          courseId: 1,
          courseName: 'Primeros Auxilios',
          userId: 1,
          userName: 'Juan Pérez',
          enrolledDate: '2025-01-10T10:00:00Z',
          progress: 0.75,
          status: 'in_progress',
        },
      ];

      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = mockInscriptions.slice(start, end);

      return {
        data: paginated.map(mapBackendToDomain),
        total: mockInscriptions.length,
        page,
        limit,
        totalPages: Math.ceil(mockInscriptions.length / limit),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la lista de inscripciones',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findOne(id: string): Promise<Inscription> {
    try {
      // Mock por ahora
      const mockInscription: BackendInscription = {
        id: Number.parseInt(id),
        courseId: 1,
        courseName: 'Primeros Auxilios',
        userId: 1,
        userName: 'Juan Pérez',
        enrolledDate: '2025-01-10T10:00:00Z',
        progress: 0.75,
        status: 'in_progress',
      };

      return mapBackendToDomain(mockInscription);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener la inscripción con ID ${id}`,
      );
    }
  }

  async findByUser(userId: string): Promise<Inscription[]> {
    try {
      // Mock por ahora
      const result = await this.findAll({ page: 1, limit: 100 });
      return result.data.filter((ins) => ins.userId === userId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener las inscripciones del usuario ${userId}`,
      );
    }
  }

  async findByCourse(courseId: string): Promise<Inscription[]> {
    try {
      // Mock por ahora
      const result = await this.findAll({ page: 1, limit: 100 });
      return result.data.filter((ins) => ins.courseId === courseId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener las inscripciones del curso ${courseId}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(dto: CreateInscriptionDto): Promise<Inscription> {
    try {
      // Mock por ahora
      const mockInscription: BackendInscription = {
        id: Date.now(),
        courseId: Number.parseInt(dto.courseId),
        courseName: 'Curso',
        userId: Number.parseInt(dto.userId),
        userName: 'Usuario',
        enrolledDate: new Date().toISOString(),
        progress: 0,
        status: 'enrolled',
      };

      return mapBackendToDomain(mockInscription);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear la inscripción',
      );
    }
  }

  async update(id: string, dto: UpdateInscriptionDto): Promise<Inscription> {
    try {
      // Mock por ahora
      const existing = await this.findOne(id);
      const mockInscription: BackendInscription = {
        id: Number.parseInt(id),
        courseId: Number.parseInt(existing.courseId),
        courseName: existing.courseName,
        userId: Number.parseInt(existing.userId),
        userName: existing.userName,
        enrolledDate: existing.enrolledDate,
        progress: dto.progress ?? existing.progress,
        status: dto.status ?? existing.status,
        ...(dto.score !== undefined && { score: dto.score }),
        ...(existing.score !== undefined && { score: existing.score }),
        ...(existing.completedDate && { completedDate: existing.completedDate }),
      };

      return mapBackendToDomain(mockInscription);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar la inscripción con ID ${id}`,
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

