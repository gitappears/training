// Implementación HTTP del repositorio de autenticación
// Adaptador que conecta la capa de aplicación con la API REST

import type { AxiosError } from 'axios';
import { api } from '../../../boot/axios';
import type {
  IAuthRepository,
  LoginDto,
  RegisterDto,
  TokenResponse,
  UserProfile,
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
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al iniciar sesión',
      );
    }
  }

  async register(dto: RegisterDto): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>(`${this.baseUrl}/register`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al registrar usuario',
      );
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>(`${this.baseUrl}/profile`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener el perfil',
      );
    }
  }

  async refreshToken(): Promise<TokenResponse> {
    try {
      const response = await api.get<TokenResponse>(`${this.baseUrl}/refresh`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al refrescar el token',
      );
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();

