// Implementación HTTP del repositorio de autenticación
// Adaptador que conecta la capa de aplicación con la API REST

import type { AxiosError } from 'axios';
import { api } from '../../../boot/axios';
import type {
  IAuthRepository,
  LoginDto,
  RegisterDto,
  CreateAdminDto,
  CreateAdminResponse,
  TokenResponse,
  UserProfile,
  RegisterResponse,
} from '../../../application/auth/auth.repository.port';

/**
 * Servicio HTTP para autenticación
 * Implementa el puerto IAuthRepository usando axios
 */
export class AuthService implements IAuthRepository {
  private readonly baseUrl = '/auth';

  async login(dto: LoginDto): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>(`${this.baseUrl}/login`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
        requiereAceptacionTerminos?: boolean;
      }>;

      // Verificar si el error es TERMS_NOT_ACCEPTED
      if (
        axiosError.response?.status === 401 &&
        (axiosError.response?.data?.error === 'TERMS_NOT_ACCEPTED' ||
          axiosError.response?.data?.requiereAceptacionTerminos === true)
      ) {
        console.log('🔍 TERMS_NOT_ACCEPTED detected, throwing specific error');
        const error = new Error('TERMS_NOT_ACCEPTED') as Error & {
          code: string;
          requiereAceptacionTerminos: boolean;
          response?: typeof axiosError.response;
        };
        error.code = 'TERMS_NOT_ACCEPTED';
        error.requiereAceptacionTerminos = true;
        error.response = axiosError.response;
        throw error;
      }

      // Manejo específico para credenciales incorrectas (401)
      if (axiosError.response?.status === 401) {
        // Usar directamente el mensaje del backend si está disponible
        const backendMessage = axiosError.response?.data?.message;

        // Prioridad 1: Usar el mensaje del backend si está disponible
        if (backendMessage) {
          const errorWithMessage = new Error(backendMessage) as Error & {
            response?: typeof axiosError.response;
          };
          errorWithMessage.response = axiosError.response;
          throw errorWithMessage;
        }

        // Prioridad 2: Si el error ya tiene un mensaje personalizado (del interceptor), usarlo
        if (
          error instanceof Error &&
          error.message &&
          error.message !== 'Request failed with status code 401' &&
          !error.message.includes('status code')
        ) {
          const enhancedError = error as Error & {
            response?: typeof axiosError.response;
          };
          enhancedError.response = axiosError.response;
          throw enhancedError;
        }

        // Mensaje genérico solo si no hay mensaje del backend
        throw new Error('Usuario y/o contraseña errados; inténtelo de nuevo');
      }

      // Error de conexión (red, timeout, etc.)
      if (!axiosError.response) {
        throw new Error('Error de conexión con el servidor. Verifique su conexión a internet.');
      }

      // Error genérico del servidor
      throw new Error(axiosError.response?.data?.message ?? 'Error al iniciar sesión');
    }
  }

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(`${this.baseUrl}/register`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al registrar usuario');
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>(`${this.baseUrl}/profile`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al obtener el perfil');
    }
  }

  async refreshToken(): Promise<TokenResponse> {
    try {
      const response = await api.get<TokenResponse>(`${this.baseUrl}/refresh`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al refrescar el token');
    }
  }

  async updateProfile(data: Partial<RegisterDto>): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/profile`, data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al actualizar el perfil');
    }
  }

  async createAdmin(dto: CreateAdminDto): Promise<CreateAdminResponse> {
    try {
      const response = await api.post<CreateAdminResponse>(`${this.baseUrl}/admin`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al crear el administrador');
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
