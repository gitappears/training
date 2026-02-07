// Implementación HTTP del repositorio de documentos legales
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IDocumentosLegalesRepository,
  DocumentoLegal,
  CreateDocumentoLegalDto,
  UpdateDocumentoLegalDto,
} from '../../../application/documentos-legales/documentos-legales.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendDocumentoLegal {
  id: number;
  tipo: string;
  titulo: string;
  contenido: string;
  version: string;
  requiereFirmaDigital: number | boolean; // El backend puede enviar 1/0 o boolean
  activo: number | boolean; // El backend puede enviar 1/0 o boolean
  fechaCreacion: string;
  fechaActualizacion: string;
}

/**
 * Servicio HTTP para documentos legales
 * Implementa el puerto IDocumentosLegalesRepository usando axios
 */
export class DocumentosLegalesService implements IDocumentosLegalesRepository {
  private readonly baseUrl = '/documentos-legales';

  async findAll(activo?: boolean): Promise<DocumentoLegal[]> {
    try {
      const params = activo !== undefined ? { activo: activo.toString() } : {};
      const response = await api.get<BackendDocumentoLegal[]>(this.baseUrl, {
        params,
      });

      return response.data.map((doc) => ({
        id: doc.id,
        tipo: doc.tipo,
        titulo: doc.titulo,
        contenido: doc.contenido,
        version: doc.version,
        // Convertir número (1/0) a boolean
        requiereFirmaDigital:
          typeof doc.requiereFirmaDigital === 'number'
            ? doc.requiereFirmaDigital === 1
            : !!doc.requiereFirmaDigital,
        activo: typeof doc.activo === 'number' ? doc.activo === 1 : !!doc.activo,
        fechaCreacion: new Date(doc.fechaCreacion),
        fechaActualizacion: new Date(doc.fechaActualizacion),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al obtener documentos legales');
    }
  }

  async findOne(id: number): Promise<DocumentoLegal | null> {
    try {
      const response = await api.get<BackendDocumentoLegal>(`${this.baseUrl}/${id}`);

      return {
        id: response.data.id,
        tipo: response.data.tipo,
        titulo: response.data.titulo,
        contenido: response.data.contenido,
        version: response.data.version,
        // Convertir número (1/0) a boolean
        requiereFirmaDigital:
          typeof response.data.requiereFirmaDigital === 'number'
            ? response.data.requiereFirmaDigital === 1
            : !!response.data.requiereFirmaDigital,
        // Convertir número (1/0) a boolean
        activo:
          typeof response.data.activo === 'number'
            ? response.data.activo === 1
            : !!response.data.activo,
        fechaCreacion: new Date(response.data.fechaCreacion),
        fechaActualizacion: new Date(response.data.fechaActualizacion),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw new Error(axiosError.response?.data?.message ?? 'Error al obtener el documento legal');
    }
  }

  async findByTipo(tipo: string, activo?: boolean): Promise<DocumentoLegal[]> {
    try {
      const allDocuments = await this.findAll(activo);
      return allDocuments.filter((doc) => doc.tipo === tipo);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener documentos legales de tipo ${tipo}`,
      );
    }
  }

  async create(dto: CreateDocumentoLegalDto): Promise<DocumentoLegal> {
    try {
      // Convertir boolean a número (1/0) para el backend
      const dtoParaBackend = {
        ...dto,
        activo: dto.activo !== undefined ? (dto.activo ? 1 : 0) : undefined,
        requiereFirmaDigital:
          dto.requiereFirmaDigital !== undefined ? (dto.requiereFirmaDigital ? 1 : 0) : undefined,
      };
      const response = await api.post<BackendDocumentoLegal>(this.baseUrl, dtoParaBackend);

      return {
        id: response.data.id,
        tipo: response.data.tipo,
        titulo: response.data.titulo,
        contenido: response.data.contenido,
        version: response.data.version,
        // Convertir número (1/0) a boolean
        requiereFirmaDigital:
          typeof response.data.requiereFirmaDigital === 'number'
            ? response.data.requiereFirmaDigital === 1
            : !!response.data.requiereFirmaDigital,
        activo:
          typeof response.data.activo === 'number'
            ? response.data.activo === 1
            : !!response.data.activo,
        fechaCreacion: new Date(response.data.fechaCreacion),
        fechaActualizacion: new Date(response.data.fechaActualizacion),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al crear el documento legal');
    }
  }

  async update(id: number, dto: UpdateDocumentoLegalDto): Promise<DocumentoLegal> {
    try {
      // Convertir boolean a número (1/0) para el backend
      const dtoParaBackend: Record<string, unknown> = { ...dto };
      if (dto.activo !== undefined) {
        dtoParaBackend.activo = dto.activo ? 1 : 0;
      }
      if (dto.requiereFirmaDigital !== undefined) {
        dtoParaBackend.requiereFirmaDigital = dto.requiereFirmaDigital ? 1 : 0;
      }
      const response = await api.put<BackendDocumentoLegal>(
        `${this.baseUrl}/${id}`,
        dtoParaBackend,
      );

      return {
        id: response.data.id,
        tipo: response.data.tipo,
        titulo: response.data.titulo,
        contenido: response.data.contenido,
        version: response.data.version,
        // Convertir número (1/0) a boolean
        requiereFirmaDigital:
          typeof response.data.requiereFirmaDigital === 'number'
            ? response.data.requiereFirmaDigital === 1
            : !!response.data.requiereFirmaDigital,
        activo:
          typeof response.data.activo === 'number'
            ? response.data.activo === 1
            : !!response.data.activo,
        fechaCreacion: new Date(response.data.fechaCreacion),
        fechaActualizacion: new Date(response.data.fechaActualizacion),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al actualizar el documento legal',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al eliminar el documento legal');
    }
  }
}

// Exportar instancia singleton
export const documentosLegalesService = new DocumentosLegalesService();
