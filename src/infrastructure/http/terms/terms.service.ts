// Implementación HTTP del repositorio de términos y aceptaciones
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  ITermsRepository,
  DocumentoLegal,
  Aceptacion,
} from '../../../application/terms/terms.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendDocumentoLegal {
  id: number;
  tipo: string;
  titulo: string;
  contenido: string;
  version: string;
  requiereFirmaDigital: boolean;
  activo: boolean;
}

interface BackendAceptacion {
  id: number;
  documentoLegalId: number;
  version: string;
  fechaAceptacion: string;
}

/**
 * Servicio HTTP para términos y aceptaciones
 * Implementa el puerto ITermsRepository usando axios
 */
export class TermsService implements ITermsRepository {
  private readonly baseUrl = '/terms';

  async getActiveDocuments(): Promise<DocumentoLegal[]> {
    try {
      const response = await api.get<BackendDocumentoLegal[]>(`${this.baseUrl}/active-documents`);

      return response.data.map((doc) => ({
        id: doc.id,
        tipo: doc.tipo,
        titulo: doc.titulo,
        contenido: doc.contenido,
        version: doc.version,
        requiereFirmaDigital: doc.requiereFirmaDigital,
        activo: doc.activo,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener documentos legales activos',
      );
    }
  }

  async acceptTerms(documentosIds: number[]): Promise<Aceptacion[]> {
    try {
      const response = await api.post<BackendAceptacion[]>(`${this.baseUrl}/accept`, {
        documentosIds,
      });

      return response.data.map((aceptacion) => ({
        id: aceptacion.id,
        documentoLegalId: aceptacion.documentoLegalId,
        version: aceptacion.version,
        fechaAceptacion: new Date(aceptacion.fechaAceptacion),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al aceptar términos y condiciones',
      );
    }
  }

  async verifyAcceptance(): Promise<{ aceptado: boolean; message: string }> {
    try {
      const response = await api.get<{ aceptado: boolean; message: string }>(
        `${this.baseUrl}/verify`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // Si el error es 401, significa que no ha aceptado los términos
      if (axiosError.response?.status === 401) {
        return {
          aceptado: false,
          message:
            axiosError.response?.data?.message ?? 'No ha aceptado los términos y condiciones',
        };
      }
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al verificar aceptación de términos',
      );
    }
  }

  /**
   * Acepta términos y condiciones con credenciales (endpoint público)
   * Útil cuando el usuario no puede autenticarse porque no ha aceptado términos
   */
  async acceptTermsWithCredentials(
    username: string,
    password: string,
    documentosIds: number[],
  ): Promise<Aceptacion[]> {
    try {
      const response = await api.post<BackendAceptacion[]>(`${this.baseUrl}/public/accept`, {
        username,
        password,
        documentosIds,
      });

      return response.data.map((aceptacion) => ({
        id: aceptacion.id,
        documentoLegalId: aceptacion.documentoLegalId,
        version: aceptacion.version,
        fechaAceptacion: new Date(aceptacion.fechaAceptacion),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al aceptar términos y condiciones',
      );
    }
  }

  /**
   * Acepta términos y condiciones en nombre de otro usuario (solo para administradores)
   */
  async acceptTermsForUser(userId: string, documentosIds: number[]): Promise<Aceptacion[]> {
    try {
      // Convertir userId de string a número para el backend
      const userIdNumber = Number.parseInt(userId, 10);
      if (Number.isNaN(userIdNumber)) {
        throw new Error('ID de usuario inválido');
      }

      const response = await api.post<BackendAceptacion[]>(
        `${this.baseUrl}/accept-for-user/${userIdNumber}`,
        { documentosIds },
      );

      return response.data.map((aceptacion) => ({
        id: aceptacion.id,
        documentoLegalId: aceptacion.documentoLegalId,
        version: aceptacion.version,
        fechaAceptacion: new Date(aceptacion.fechaAceptacion),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          'Error al aceptar términos y condiciones para el usuario',
      );
    }
  }
}

// Exportar instancia singleton
export const termsService = new TermsService();
