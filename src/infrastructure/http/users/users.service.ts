// Implementación HTTP del repositorio de usuarios
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
  UserListParams,
  UserFilters,
  UserStatistics,
} from '../../../application/user/user.repository.port';
import type { User } from '../../../domain/user/models';
import type { PaginatedResponse } from '../../../application/training/training.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendPersona {
  id: number;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface BackendRol {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface BackendUser {
  id: number;
  persona: BackendPersona;
  username: string;
  rolPrincipal?: BackendRol;
  habilitado: boolean;
  activo: boolean;
  debeCambiarPassword: boolean;
  ultimoAcceso?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface BackendPaginatedResponse {
  data: BackendUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendUser): User {
  const persona = backendData.persona;
  const nombres = persona.nombres || '';
  const apellidos = persona.apellidos || '';
  const fullName = `${nombres} ${apellidos}`.trim() || persona.nombres || 'Sin nombre';

  const user: User = {
    id: backendData.id.toString(),
    personaId: persona.id.toString(), // ID de la persona para usar en inscripciones y certificados
    name: fullName,
    email: persona.email || '',
    document: persona.numeroDocumento || '',
    documentType: mapDocumentType(persona.tipoDocumento),
    phone: persona.telefono || '',
    role: mapRole(backendData.rolPrincipal?.codigo || ''),
    roleId: backendData.rolPrincipal?.id,
    username: backendData.username,
    personType: 'natural', // El backend no expone tipoPersona directamente, asumimos natural por defecto
    enabled: backendData.habilitado,
    active: backendData.activo,
    mustChangePassword: backendData.debeCambiarPassword,
    birthDate: persona.fechaNacimiento || undefined,
    gender: (persona.genero as 'M' | 'F' | 'O') || undefined,
    address: persona.direccion || undefined,
    createdAt: backendData.fechaCreacion || new Date().toISOString(),
  };

  if (backendData.ultimoAcceso) {
    user.lastLoginAt = backendData.ultimoAcceso;
  }
  if (backendData.fechaActualizacion) {
    user.updatedAt = backendData.fechaActualizacion;
  }

  return user;
}

function mapDocumentType(type: string): 'CC' | 'CE' | 'PA' | 'TI' | 'NIT' {
  const normalized = type?.toUpperCase() ?? 'CC';
  if (normalized === 'CE') return 'CE';
  if (normalized === 'PA') return 'PA';
  if (normalized === 'TI') return 'TI';
  if (normalized === 'NIT') return 'NIT';
  return 'CC';
}

function mapRole(role: string): 'admin' | 'institutional' | 'driver' {
  const normalized = role?.toUpperCase() ?? '';
  if (normalized === 'ADMIN') return 'admin';
  if (normalized === 'CLIENTE') return 'institutional';
  if (normalized === 'INSTRUCTOR') return 'admin'; // Los instructores se tratan como admin en el frontend
  if (normalized === 'ALUMNO') return 'driver'; // Los alumnos se tratan como drivers
  if (normalized === 'OPERADOR') return 'driver'; // Los operadores se tratan como drivers
  return 'driver';
}

function mapPersonType(type: string): 'natural' | 'juridica' {
  const normalized = type?.toLowerCase() ?? 'natural';
  if (normalized.includes('juridica') || normalized.includes('jurídica')) return 'juridica';
  return 'natural';
}

/**
 * Servicio HTTP para usuarios
 * Implementa el puerto IUserRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class UsersService implements IUserRepository {
  private readonly baseUrl = '/users';

  async findAll(params: UserListParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams: Record<string, string | number | boolean> = {
        page: params.page || 1,
        limit: params.limit || 10,
      };

      // Agregar filtros
      if (params.filters?.search) {
        queryParams.search = params.filters.search;
      }
      if (params.filters?.role) {
        // Mapear roles del frontend al backend
        const roleMap: Record<string, string> = {
          admin: 'ADMIN',
          institutional: 'CLIENTE',
          driver: 'ALUMNO',
        };
        queryParams.role = roleMap[params.filters.role] || params.filters.role.toUpperCase();
      }
      if (params.filters?.status) {
        queryParams.habilitado = params.filters.status === 'enabled';
      }
      if (params.filters?.personType) {
        // El backend no tiene filtro directo por tipo de persona, se puede agregar si es necesario
      }
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
      }
      if (params.sortOrder) {
        queryParams.sortOrder = params.sortOrder.toUpperCase();
      }

      const response = await api.get<BackendPaginatedResponse>(this.baseUrl, {
        params: queryParams,
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
        axiosError.response?.data?.message ?? 'Error al obtener la lista de usuarios',
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const response = await api.get<BackendUser>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener el usuario con ID ${id}`,
      );
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      // El backend no tiene endpoint de creación de usuarios directamente
      // Se debe usar el endpoint de registro o el de creación de conductores externos
      // Por ahora, lanzamos un error indicando que se debe usar el registro
      throw new Error(
        'La creación de usuarios debe realizarse a través del registro o creación de conductores externos',
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear el usuario',
      );
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      // Mapear DTO del frontend al formato del backend
      const backendDto: {
        username?: string;
        rolPrincipalId?: number;
        habilitado?: boolean;
        activo?: boolean;
        debeCambiarPassword?: boolean;
        // Campos de persona
        nombres?: string;
        apellidos?: string;
        email?: string;
        telefono?: string;
        fechaNacimiento?: string;
        genero?: string;
        direccion?: string;
      } = {};

      // El backend acepta estos campos directamente
      if (dto.username !== undefined) {
        backendDto.username = dto.username;
      }
      if (dto.rolPrincipalId !== undefined) {
        backendDto.rolPrincipalId = dto.rolPrincipalId;
      }
      if (dto.habilitado !== undefined) {
        backendDto.habilitado = dto.habilitado;
      }
      if (dto.activo !== undefined) {
        backendDto.activo = dto.activo;
      }
      if (dto.debeCambiarPassword !== undefined) {
        backendDto.debeCambiarPassword = dto.debeCambiarPassword;
      }

      // También mapear enabled del frontend a habilitado del backend
      if (dto.enabled !== undefined) {
        backendDto.habilitado = dto.enabled;
      }

      // Campos de persona
      if (dto.name !== undefined) {
        // Separar nombres y apellidos si viene como un solo campo
        const nameParts = dto.name.trim().split(' ');
        backendDto.nombres = nameParts[0] || '';
        backendDto.apellidos = nameParts.slice(1).join(' ') || '';
      }
      if (dto.email !== undefined) {
        backendDto.email = dto.email;
      }
      if (dto.phone !== undefined) {
        backendDto.telefono = dto.phone.replace(/\s+/g, '');
      }
      if (dto.birthDate !== undefined) {
        backendDto.fechaNacimiento = dto.birthDate;
      }
      if (dto.gender !== undefined) {
        backendDto.genero = dto.gender;
      }
      if (dto.address !== undefined) {
        backendDto.direccion = dto.address;
      }

      // Si hay campos de persona, intentar actualizarlos usando el endpoint de perfil
      // Nota: El endpoint de perfil solo funciona para el usuario autenticado
      // Por lo tanto, si hay campos de persona, necesitamos usar un endpoint específico
      // Por ahora, intentamos enviarlos en el mismo request al endpoint de usuarios
      // Si el backend no los acepta, se ignorarán
      const hasPersonData = backendDto.nombres || backendDto.apellidos || backendDto.email || 
                            backendDto.telefono || backendDto.fechaNacimiento || 
                            backendDto.genero || backendDto.direccion;

      if (hasPersonData) {
        // Intentar actualizar datos personales usando el endpoint de perfil del usuario
        // Esto requiere que el backend tenga un endpoint para administradores
        // Por ahora, enviamos los datos de persona junto con los datos de usuario
        // El backend debería procesarlos si tiene la funcionalidad implementada
      }

      const response = await api.put<BackendUser>(`${this.baseUrl}/${id}`, backendDto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar el usuario con ID ${id}`,
      );
    }
  }


  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar el usuario con ID ${id}`,
      );
    }
  }

  async toggleStatus(id: string, enabled: boolean): Promise<User> {
    try {
      const response = await api.put<BackendUser>(`${this.baseUrl}/${id}`, {
        habilitado: enabled,
      });
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al cambiar el estado del usuario con ID ${id}`,
      );
    }
  }

  async getStatistics(filters?: UserFilters): Promise<UserStatistics> {
    try {
      // Obtener todos los usuarios con los filtros aplicados y calcular estadísticas
      const params: UserListParams = {
        page: 1,
        limit: 1000, // Obtener muchos para calcular estadísticas
        filters,
      };

      const response = await this.findAll(params);
      const users = response.data;

      // Calcular estadísticas
      const enabled = users.filter((u) => u.enabled).length;
      const disabled = users.filter((u) => !u.enabled).length;
      const external = users.filter((u) => u.isExternal).length;

      const byRole: Record<string, number> = {
        admin: 0,
        institutional: 0,
        driver: 0,
      };
      users.forEach((u) => {
        byRole[u.role] = (byRole[u.role] || 0) + 1;
      });

      const byType: Record<string, number> = {
        natural: 0,
        juridica: 0,
      };
      users.forEach((u) => {
        byType[u.personType] = (byType[u.personType] || 0) + 1;
      });

      return {
        total: response.total,
        enabled,
        disabled,
        external,
        byRole: byRole as UserStatistics['byRole'],
        byType: byType as UserStatistics['byType'],
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener estadísticas de usuarios',
      );
    }
  }

  async bulkEnable(ids: string[]): Promise<void> {
    try {
      // El backend no tiene endpoint bulk, hacer múltiples llamadas
      await Promise.all(ids.map((id) => this.toggleStatus(id, true)));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al habilitar usuarios',
      );
    }
  }

  async bulkDisable(ids: string[]): Promise<void> {
    try {
      // El backend no tiene endpoint bulk, hacer múltiples llamadas
      await Promise.all(ids.map((id) => this.toggleStatus(id, false)));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al deshabilitar usuarios',
      );
    }
  }
}

// Exportar instancia singleton
export const usersService = new UsersService();

