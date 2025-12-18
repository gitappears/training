// Puerto (interface) para el repositorio de capacitaciones
// Define el contrato que debe cumplir cualquier implementación

import type { Training } from '../../domain/training/models';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, unknown>;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTrainingDto {
  titulo: string;
  descripcion?: string;
  tipoCapacitacionId: number;
  modalidadId: number;
  instructorId: number;
  areaId?: number;
  publicoObjetivo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  duracionHoras?: number;
  capacidadMaxima?: number;
  imagenPortadaUrl?: string;
  videoPromocionalUrl?: string;
  minimoAprobacion?: number;
  estado?: string;
  usuarioCreacion?: string;
}

export type UpdateTrainingDto = Partial<CreateTrainingDto>;

export interface ITrainingRepository {
  /**
   * Obtener lista de capacitaciones con paginación
   */
  findAll(params: PaginationParams): Promise<PaginatedResponse<Training>>;

  /**
   * Obtener una capacitación por ID
   */
  findOne(id: number): Promise<Training>;

  /**
   * Crear una nueva capacitación
   */
  create(dto: CreateTrainingDto): Promise<Training>;

  /**
   * Actualizar una capacitación existente
   */
  update(id: number, dto: UpdateTrainingDto): Promise<Training>;

  /**
   * Eliminar una capacitación
   */
  remove(id: number): Promise<void>;
}

