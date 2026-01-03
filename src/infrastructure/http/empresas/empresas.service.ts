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

export interface CreateEmpresaDto {
  numeroDocumento: string;
  tipoDocumento?: string;
  razonSocial: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {
  activo?: boolean;
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

  async create(dto: CreateEmpresaDto): Promise<Empresa> {
    try {
      const response = await api.post<Empresa>(this.baseUrl, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const errorMessage = Array.isArray(axiosError.response?.data?.message)
        ? axiosError.response.data.message.join(', ')
        : axiosError.response?.data?.message ?? 'Error al crear la empresa';
      throw new Error(errorMessage);
    }
  }

  async update(id: number, dto: UpdateEmpresaDto): Promise<Empresa> {
    try {
      const response = await api.put<Empresa>(`${this.baseUrl}/${id}`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const errorMessage = Array.isArray(axiosError.response?.data?.message)
        ? axiosError.response.data.message.join(', ')
        : axiosError.response?.data?.message ?? 'Error al actualizar la empresa';
      throw new Error(errorMessage);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al eliminar la empresa',
      );
    }
  }
}

export const empresasService = new EmpresasService();

