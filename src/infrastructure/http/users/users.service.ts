// Implementación HTTP del repositorio de usuarios
// Adaptador que conecta la capa de aplicación con la API REST

// import { api } from '../../../boot/axios'; // TODO: Descomentar cuando backend esté listo
import type { AxiosError } from 'axios';
import type {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
  UserListParams,
  UserFilters,
  UserStatistics,
} from '../../../application/user/user.repository.port';
import type { User } from '../../../domain/user/models';
import type { PaginatedResponse } from '../../../application/training/training.repository.port';

/**
 * Tipos para las respuestas del backend (mock por ahora)
 */
interface BackendUser {
  id: number;
  name: string;
  email: string;
  document: string;
  documentType: string;
  phone?: string;
  role: string;
  personType: string;
  enabled: boolean;
  isExternal?: boolean;
  company?: string;
  companyName?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// interface BackendPaginatedResponse { // TODO: Usar cuando backend esté listo
//   data: BackendUser[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendUser): User {
  const user: User = {
    id: backendData.id?.toString() ?? '',
    name: backendData.name ?? '',
    email: backendData.email ?? '',
    document: backendData.document ?? '',
    documentType: mapDocumentType(backendData.documentType),
    phone: backendData.phone ?? '',
    role: mapRole(backendData.role),
    personType: mapPersonType(backendData.personType),
    enabled: backendData.enabled ?? false,
    createdAt: backendData.createdAt ?? new Date().toISOString(),
  };

  if (backendData.isExternal !== undefined) {
    user.isExternal = backendData.isExternal;
  }
  if (backendData.company) {
    user.company = backendData.company;
  }
  if (backendData.companyName) {
    user.companyName = backendData.companyName;
  }
  if (backendData.updatedAt) {
    user.updatedAt = backendData.updatedAt;
  }
  if (backendData.lastLoginAt) {
    user.lastLoginAt = backendData.lastLoginAt;
  }

  return user;
}

function mapDocumentType(type: string): 'CC' | 'CE' | 'PA' | 'TI' | 'NIT' {
  const normalized = type?.toUpperCase() ?? 'CC';
  if (normalized === 'CE') return 'CE';
  if (normalized === 'PA') return 'PA';
  if (normalized === 'TI') return 'TI';
  if (normalized === 'NIT') return 'NIT';
  return 'CC';
}

function mapRole(role: string): 'admin' | 'institutional' | 'driver' {
  const normalized = role?.toLowerCase() ?? 'driver';
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('institutional') || normalized.includes('cliente')) return 'institutional';
  return 'driver';
}

function mapPersonType(type: string): 'natural' | 'juridica' {
  const normalized = type?.toLowerCase() ?? 'natural';
  if (normalized.includes('juridica') || normalized.includes('jurídica')) return 'juridica';
  return 'natural';
}

/**
 * Servicio HTTP para usuarios
 * Implementa el puerto IUserRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class UsersService implements IUserRepository {
  private readonly baseUrl = '/usuarios';

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(params: UserListParams): Promise<PaginatedResponse<User>> {
    try {
      // Por ahora, simular respuesta con datos mock
      // Cuando el backend esté listo, cambiar a:
      // const response = await api.post<BackendPaginatedResponse>(`${this.baseUrl}/list`, { ... });
      
      // Mock data
      const mockUsers: BackendUser[] = [
        {
          id: 1,
          name: 'Juan Pérez',
          email: 'juan.perez@example.com',
          document: '12345678',
          documentType: 'CC',
          phone: '+57 300 123 4567',
          role: 'driver',
          personType: 'natural',
          enabled: true,
          isExternal: false,
          createdAt: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          name: 'María González',
          email: 'maria.gonzalez@example.com',
          document: '87654321',
          documentType: 'CC',
          phone: '+57 300 987 6543',
          role: 'driver',
          personType: 'natural',
          enabled: true,
          isExternal: true,
          createdAt: '2025-01-10T08:00:00Z',
        },
      ];

      // Aplicar filtros mock
      let filtered = [...mockUsers];
      if (params.filters?.search) {
        const search = params.filters.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.document.includes(search),
        );
      }
      if (params.filters?.role) {
        filtered = filtered.filter((u) => mapRole(u.role) === params.filters?.role);
      }
      if (params.filters?.status) {
        const enabled = params.filters.status === 'enabled';
        filtered = filtered.filter((u) => u.enabled === enabled);
      }

      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      return {
        data: paginated.map(mapBackendToDomain),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la lista de usuarios',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findOne(id: string): Promise<User> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.get<BackendUser>(`${this.baseUrl}/${id}`);
      
      const mockUser: BackendUser = {
        id: Number.parseInt(id),
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        document: '12345678',
        documentType: 'CC',
        phone: '+57 300 123 4567',
        role: 'driver',
        personType: 'natural',
        enabled: true,
        isExternal: false,
        createdAt: '2025-01-15T10:00:00Z',
      };

      return mapBackendToDomain(mockUser);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener el usuario con ID ${id}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(dto: CreateUserDto): Promise<User> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.post<BackendUser>(this.baseUrl, dto);
      
      const mockUser: BackendUser = {
        id: Date.now(),
        name: dto.name,
        email: dto.email,
        document: dto.document,
        documentType: dto.documentType,
        role: dto.role,
        personType: dto.personType,
        enabled: false, // RF-05: Por defecto deshabilitado si es externo
        createdAt: new Date().toISOString(),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.isExternal !== undefined && { isExternal: dto.isExternal }),
        ...(dto.companyName && { companyName: dto.companyName }),
      };

      return mapBackendToDomain(mockUser);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear el usuario',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.patch<BackendUser>(`${this.baseUrl}/${id}`, dto);
      
      const mockUser: BackendUser = {
        id: Number.parseInt(id),
        name: dto.name ?? 'Usuario Actualizado',
        email: dto.email ?? 'usuario@example.com',
        document: dto.document ?? '12345678',
        documentType: dto.documentType ?? 'CC',
        role: dto.role ?? 'driver',
        personType: dto.personType ?? 'natural',
        enabled: dto.enabled ?? true,
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.isExternal !== undefined && { isExternal: dto.isExternal }),
        ...(dto.companyName && { companyName: dto.companyName }),
        updatedAt: new Date().toISOString(),
        createdAt: '2025-01-15T10:00:00Z',
      };

      return mapBackendToDomain(mockUser);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar el usuario con ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: await api.delete(`${this.baseUrl}/${id}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar el usuario con ID ${id}`,
      );
    }
  }

  async toggleStatus(id: string, enabled: boolean): Promise<User> {
    return this.update(id, { enabled });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getStatistics(filters?: UserFilters): Promise<UserStatistics> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.get<UserStatistics>(`${this.baseUrl}/statistics`, { params: filters });
      
      return {
        total: 100,
        enabled: 85,
        disabled: 15,
        external: 20,
        byRole: {
          admin: 5,
          institutional: 10,
          driver: 85,
        },
        byType: {
          natural: 90,
          juridica: 10,
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener estadísticas de usuarios',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async bulkEnable(ids: string[]): Promise<void> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: await api.post(`${this.baseUrl}/bulk-enable`, { ids });
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al habilitar usuarios',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async bulkDisable(ids: string[]): Promise<void> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: await api.post(`${this.baseUrl}/bulk-disable`, { ids });
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al deshabilitar usuarios',
      );
    }
  }
}

// Exportar instancia singleton
export const usersService = new UsersService();

