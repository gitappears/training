// Implementación HTTP del repositorio de pagos
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type { IPaymentsRepository } from '../../../application/payments/payments.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendPago {
  id: number;
  estudianteId: number;
  fechaPago: string;
  monto: number;
  metodoPago: string;
  numeroComprobante?: string;
  observaciones?: string;
  registradoPorId: number;
  fechaCreacion: string;
}

/**
 * Servicio HTTP para pagos
 * Implementa el puerto IPaymentsRepository usando axios
 */
export class PaymentsService implements IPaymentsRepository {
  private readonly baseUrl = '/payments';

  async createPayment(dto: IPaymentsRepository['CreatePaymentDto']): Promise<IPaymentsRepository['Payment']> {
    try {
      const createDto = {
        estudianteId: dto.estudianteId,
        fechaPago: dto.fechaPago,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        numeroComprobante: dto.numeroComprobante,
        observaciones: dto.observaciones,
      };

      const response = await api.post<BackendPago>(this.baseUrl, createDto);

      return {
        id: response.data.id,
        estudianteId: response.data.estudianteId,
        fechaPago: new Date(response.data.fechaPago),
        monto: response.data.monto,
        metodoPago: response.data.metodoPago,
        numeroComprobante: response.data.numeroComprobante,
        observaciones: response.data.observaciones,
        registradoPorId: response.data.registradoPorId,
        fechaCreacion: new Date(response.data.fechaCreacion),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al registrar el pago',
      );
    }
  }

  async enableDriver(studentId: number): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `${this.baseUrl}/${studentId}/enable`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al habilitar el conductor con ID ${studentId}`,
      );
    }
  }
}

// Exportar instancia singleton
export const paymentsService = new PaymentsService();

