import { api } from '../../../boot/axios';
import type { Material } from '../../../domain/material/models';
import type { CreateMaterialDto, UpdateMaterialDto } from '../../../application/material/material.repository.port';

export interface UploadFileResponse {
  url: string;
  originalName: string;
}

interface BackendTipoMaterial {
  id: number;
  nombre: string;
  codigo: string;
}

interface BackendMaterial {
  id: number;
  capacitacion?: {
    id: number;
  };
  tipoMaterial?: BackendTipoMaterial;
  nombre: string;
  url: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
}

/**
 * Construye una URL completa para un material
 * @param url - URL relativa o absoluta del material
 * @returns URL completa que puede ser usada directamente en el frontend
 */
function buildFullMaterialUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Si ya es una URL completa (http/https), retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es una ruta relativa, construir URL completa
  const baseUrl = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${cleanUrl}`;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 * Aplica principios SOLID:
 * - Single Responsibility: Solo mapea datos del backend al dominio
 * - Dependency Inversion: No depende de implementaciones concretas
 */
function mapBackendToDomain(backendData: BackendMaterial): Material {
  const material: Material = {
    id: backendData.id?.toString() ?? '',
    capacitacionId: backendData.capacitacion?.id ?? 0,
    tipoMaterialId: backendData.tipoMaterial?.id ?? 0,
    tipoMaterial: {
      id: backendData.tipoMaterial?.id ?? 0,
      nombre: backendData.tipoMaterial?.nombre ?? '',
      codigo: backendData.tipoMaterial?.codigo ?? '',
    },
    nombre: backendData.nombre ?? '',
    url: buildFullMaterialUrl(backendData.url), // Construir URL completa
    orden: backendData.orden ?? 0,
    activo: backendData.activo ?? true,
    fechaCreacion: backendData.fechaCreacion ?? new Date().toISOString(),
  };

  if (backendData.descripcion) {
    material.descripcion = backendData.descripcion;
  }

  return material;
}

export const materialsService = {
  /**
   * Sube un archivo (PDF o imagen) al servidor
   * @param file Archivo a subir
   * @param onUploadProgress Callback para el progreso de upload
   * @returns URL del archivo subido
   */
  async uploadFile(
    file: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>(
      '/materiales/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onUploadProgress(percentCompleted);
          }
        },
      },
    );

    return response.data;
  },

  /**
   * Crear un nuevo material
   */
  async create(dto: CreateMaterialDto): Promise<Material> {
    const response = await api.post<BackendMaterial>('/materiales', dto);
    return mapBackendToDomain(response.data);
  },

  /**
   * Obtener todos los materiales de una capacitación
   */
  async findByCapacitacion(capacitacionId: number): Promise<Material[]> {
    const response = await api.get<BackendMaterial[]>(
      `/materiales/capacitacion/${capacitacionId}`,
    );
    return response.data.map(mapBackendToDomain);
  },

  /**
   * Obtener un material por ID
   */
  async findOne(id: number): Promise<Material> {
    const response = await api.get<BackendMaterial>(`/materiales/${id}`);
    return mapBackendToDomain(response.data);
  },

  /**
   * Actualizar un material existente
   */
  async update(id: number, dto: UpdateMaterialDto): Promise<Material> {
    const response = await api.patch<BackendMaterial>(`/materiales/${id}`, dto);
    return mapBackendToDomain(response.data);
  },

  /**
   * Eliminar un material
   */
  async remove(id: number): Promise<void> {
    await api.delete(`/materiales/${id}`);
  },
};
