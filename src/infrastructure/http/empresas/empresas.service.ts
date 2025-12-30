import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';

export interface Empresa {
  id: number;
  numeroDocumento: string;
  tipoDocumento: string;
  razonSocial: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

class EmpresasService {
  private readonly baseUrl = '/empresas';

  async findAll(): Promise<Empresa[]> {
    try {
      const response = await api.get<Empresa[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener las empresas',
      );
    }
  }
}

export const empresasService = new EmpresasService();

