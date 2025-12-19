// Puerto (interface) para el repositorio de inscripciones
// Define el contrato que debe cumplir cualquier implementación

export interface Inscription {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  enrolledDate: string;
  progress: number; // 0-1
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  completedDate?: string;
  score?: number;
  certificateId?: string;
}

export interface CreateInscriptionDto {
  courseId: string;
  userId: string;
  paymentId?: string; // RF-06, RF-07: Para conductores externos
}

export type UpdateInscriptionDto = Partial<Pick<Inscription, 'progress' | 'status' | 'score'>>;

export interface InscriptionListParams {
  page?: number;
  limit?: number;
  courseId?: string | null;
  userId?: string | null;
  status?: Inscription['status'] | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IInscriptionRepository {
  /**
   * Obtener lista de inscripciones con paginación
   */
  findAll(params: InscriptionListParams): Promise<{
    data: Inscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Obtener una inscripción por ID
   */
  findOne(id: string): Promise<Inscription>;

  /**
   * Obtener inscripciones de un usuario
   */
  findByUser(userId: string): Promise<Inscription[]>;

  /**
   * Obtener inscripciones de un curso
   */
  findByCourse(courseId: string): Promise<Inscription[]>;

  /**
   * Crear una nueva inscripción
   */
  create(dto: CreateInscriptionDto): Promise<Inscription>;

  /**
   * Actualizar una inscripción
   */
  update(id: string, dto: UpdateInscriptionDto): Promise<Inscription>;

  /**
   * Eliminar una inscripción
   */
  remove(id: string): Promise<void>;

  /**
   * Asignar curso a usuario (crear inscripción)
   */
  assignCourse(courseId: string, userId: string, paymentId?: string): Promise<Inscription>;
}

