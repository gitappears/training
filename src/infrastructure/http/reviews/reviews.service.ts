// Implementación HTTP del servicio de reseñas
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';

/**
 * Tipos para las respuestas del backend
 */
interface BackendResena {
  id: number;
  inscripcionId: number;
  calificacion: number;
  comentario: string | null;
  fechaCreacion: string;
  activo: boolean;
}

/**
 * Modelo de dominio para Reseña
 */
export interface Review {
  id: string;
  inscripcionId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
  active: boolean;
}

/**
 * DTO para crear una reseña
 */
export interface CreateReviewDto {
  inscripcionId: number;
  calificacion: number; // 1-5
  comentario?: string;
}

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendResena): Review {
  return {
    id: backendData.id.toString(),
    inscripcionId: backendData.inscripcionId.toString(),
    rating: backendData.calificacion,
    comment: backendData.comentario,
    createdAt: backendData.fechaCreacion,
    active: backendData.activo,
  };
}

/**
 * Servicio HTTP para gestionar reseñas
 */
export class ReviewsService {
  private readonly baseUrl = '/resenas';

  /**
   * Crea una nueva reseña
   */
  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    try {
      const response = await api.post<BackendResena>(this.baseUrl, createReviewDto);
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear la reseña',
      );
    }
  }

  /**
   * Obtiene una reseña por inscripción
   */
  async findByInscripcion(inscripcionId: number): Promise<Review | null> {
    try {
      const response = await api.get<BackendResena | null>(
        `${this.baseUrl}/inscripcion/${inscripcionId}`,
      );
      if (!response.data) {
        return null;
      }
      return mapBackendToDomain(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // Si es 404, retornar null (no hay reseña)
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la reseña',
      );
    }
  }
}

export const reviewsService = new ReviewsService();
