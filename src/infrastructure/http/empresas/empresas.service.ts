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
  eliminada?: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface EmpresaSearchParams {
  search?: string;
  activo?: boolean;
  /** true = solo empresas eliminadas. Si no se envía, el backend excluye eliminadas de todos los filtros. */
  eliminadas?: boolean;
  tipoDocumento?: string;
  page?: number;
  limit?: number;
}

export interface EmpresaSearchResponse {
  data: Empresa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  async search(params: EmpresaSearchParams): Promise<EmpresaSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.activo !== undefined && params.activo !== null) {
        searchParams.set('activo', String(params.activo));
      }
      if (params.eliminadas === true) searchParams.set('eliminadas', 'true');
      if (params.tipoDocumento) searchParams.set('tipoDocumento', params.tipoDocumento);
      if (params.page != null) searchParams.set('page', String(params.page));
      if (params.limit != null) searchParams.set('limit', String(params.limit));
      const query = searchParams.toString();
      const url = query ? `${this.baseUrl}/buscar?${query}` : `${this.baseUrl}/buscar`;
      const response = await api.get<EmpresaSearchResponse>(url);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al buscar empresas',
      );
    }
  }

  async toggleStatus(id: number): Promise<Empresa> {
    try {
      const response = await api.patch<Empresa>(`${this.baseUrl}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const errorMessage = Array.isArray(axiosError.response?.data?.message)
        ? axiosError.response.data.message.join(', ')
        : axiosError.response?.data?.message ?? 'Error al cambiar el estado de la empresa';
      throw new Error(errorMessage);
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

