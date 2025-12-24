// Puerto (interface) para el repositorio de usuarios
// Define el contrato que debe cumplir cualquier implementación

import type { User, UserListParams, UserFilters, UserStatistics } from '../../domain/user/models';
import type { PaginatedResponse } from '../training/training.repository.port';

// Re-exportar tipos del dominio para facilitar importaciones
export type { UserListParams, UserFilters, UserStatistics };

export interface CreateUserDto {
  name: string;
  email: string;
  document: string;
  documentType: 'CC' | 'CE' | 'PA' | 'TI' | 'NIT';
  phone?: string;
  role: 'admin' | 'institutional' | 'driver';
  personType: 'natural' | 'juridica';
  password: string;
  companyName?: string; // Para personas jurídicas
  isExternal?: boolean; // RF-04: Conductor externo
  specialty?: string; // Para instructores
  biography?: string; // Para instructores
  studentCode?: string; // Para alumnos
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>> & {
  password?: string;
  enabled?: boolean; // RF-05: Habilitar/deshabilitar usuario
  // Campos específicos del backend
  username?: string;
  rolPrincipalId?: number;
  habilitado?: boolean;
  activo?: boolean;
  debeCambiarPassword?: boolean;
  // Campos de persona (para actualización de datos personales)
  name?: string; // Nombre completo (se separará en nombres y apellidos)
  email?: string;
  phone?: string;
  birthDate?: string; // Fecha de nacimiento en formato ISO
  gender?: 'M' | 'F' | 'O';
  address?: string;
};

export interface IUserRepository {
  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  findAll(params: UserListParams): Promise<PaginatedResponse<User>>;

  /**
   * Obtener un usuario por ID
   */
  findOne(id: string): Promise<User>;

  /**
   * Crear un nuevo usuario
   */
  create(dto: CreateUserDto): Promise<User>;

  /**
   * Actualizar un usuario existente
   */
  update(id: string, dto: UpdateUserDto): Promise<User>;

  /**
   * Eliminar un usuario
   */
  remove(id: string): Promise<void>;

  /**
   * Habilitar/deshabilitar un usuario (RF-05)
   */
  toggleStatus(id: string, enabled: boolean): Promise<User>;

  /**
   * Obtener estadísticas de usuarios
   */
  getStatistics(filters?: UserFilters): Promise<UserStatistics>;

  /**
   * Habilitar múltiples usuarios (acción masiva)
   */
  bulkEnable(ids: string[]): Promise<void>;

  /**
   * Deshabilitar múltiples usuarios (acción masiva)
   */
  bulkDisable(ids: string[]): Promise<void>;
}

