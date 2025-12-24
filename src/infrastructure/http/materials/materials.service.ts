// Implementación HTTP del repositorio de materiales
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IMaterialRepository,
  CreateMaterialDto,
  UpdateMaterialDto,
} from '../../../application/material/material.repository.port';
import type { Material } from '../../../domain/material/models';

/**
 * Tipos para las respuestas del backend
 */
interface BackendTipoMaterial {
  id: number;
  nombre: string;
  codigo: string;
}

interface BackendMaterial {
  id: number;
  capacitacion: {
    id: number;
  };
  tipoMaterial: BackendTipoMaterial;
  nombre: string;
  url: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendMaterial): Material {
  const material: Material = {
    id: backendData.id.toString(),
    capacitacionId: backendData.capacitacion.id,
    tipoMaterialId: backendData.tipoMaterial.id,
    tipoMaterial: {
      id: backendData.tipoMaterial.id,
      nombre: backendData.tipoMaterial.nombre,
      codigo: backendData.tipoMaterial.codigo,
    },
    nombre: backendData.nombre,
    url: backendData.url,
    orden: backendData.orden,
    activo: backendData.activo,
    fechaCreacion: backendData.fechaCreacion,
  };

  // Agregar descripción solo si existe (exactOptionalPropertyTypes: true)
  if (backendData.descripcion) {
    material.descripcion = backendData.descripcion;
  }

  return material;
}

/**
 * Servicio HTTP para materiales
 * Implementa el puerto IMaterialRepository usando axios
 */
export class MaterialsService implements IMaterialRepository {
  private readonly baseUrl = '/materiales';

  async create(dto: CreateMaterialDto): Promise<Material> {
    try {
      const response = await api.post<BackendMaterial>(this.baseUrl, dto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear el material',
      );
    }
  }

  async findByCapacitacion(capacitacionId: number): Promise<Material[]> {
    try {
      const response = await api.get<BackendMaterial[]>(
        `${this.baseUrl}/capacitacion/${capacitacionId}`,
      );
      return response.data.map(mapBackendToDomain);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al obtener materiales de la capacitación ${capacitacionId}`,
      );
    }
  }

  async findOne(id: number): Promise<Material> {
    try {
      const response = await api.get<BackendMaterial>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al obtener el material con ID ${id}`,
      );
    }
  }

  async update(id: number, dto: UpdateMaterialDto): Promise<Material> {
    try {
      const response = await api.patch<BackendMaterial>(
        `${this.baseUrl}/${id}`,
        dto,
      );
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al actualizar el material con ID ${id}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al eliminar el material con ID ${id}`,
      );
    }
  }
}

// Exportar instancia singleton
export const materialsService = new MaterialsService();

