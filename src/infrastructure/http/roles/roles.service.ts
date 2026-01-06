// Implementación HTTP del repositorio de roles
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type { IRoleRepository } from '../../../application/role/role.repository.port';
import type { Role } from '../../../domain/role/models';

/**
 * Tipos para las respuestas del backend
 */
interface BackendRole {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

interface BackendRolesResponse {
  data: BackendRole[];
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendRole): Role {
  const role: Role = {
    id: backendData.id,
    nombre: backendData.nombre,
    codigo: backendData.codigo,
    activo: backendData.activo,
    fechaCreacion: backendData.fechaCreacion,
  };

  if (backendData.descripcion) {
    role.descripcion = backendData.descripcion;
  }

  return role;
}

/**
 * Servicio HTTP para roles
 * Implementa el puerto IRoleRepository usando axios
 */
export class RolesService implements IRoleRepository {
  private readonly baseUrl = '/roles';

  async findAll(): Promise<Role[]> {
    try {
      const response = await api.get<BackendRolesResponse>(this.baseUrl);
      return response.data.data.map(mapBackendToDomain);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al obtener la lista de roles');
    }
  }
}

// Exportar instancia singleton
export const rolesService = new RolesService();
