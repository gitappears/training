// Puerto (interface) para el repositorio de materiales
// Define el contrato que debe cumplir cualquier implementación

import type { Material } from '../../domain/material/models';

export interface CreateMaterialDto {
  capacitacionId: number;
  tipoMaterialId: number;
  nombre: string;
  url: string;
  descripcion?: string;
  orden?: number;
}

export interface UpdateMaterialDto {
  tipoMaterialId?: number;
  nombre?: string;
  url?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

export interface IMaterialRepository {
  /**
   * Crear un nuevo material
   */
  create(dto: CreateMaterialDto): Promise<Material>;

  /**
   * Obtener todos los materiales de una capacitación
   */
  findByCapacitacion(capacitacionId: number): Promise<Material[]>;

  /**
   * Obtener un material por ID
   */
  findOne(id: number): Promise<Material>;

  /**
   * Actualizar un material existente
   */
  update(id: number, dto: UpdateMaterialDto): Promise<Material>;

  /**
   * Eliminar un material
   */
  remove(id: number): Promise<void>;
}

