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
        console.log('🔍 TERMS_NOT_ACCEPTED detected in auth.service, throwing specific error');
        const termsError = new Error('TERMS_NOT_ACCEPTED') as Error & {
          code: string;
          requiereAceptacionTerminos: boolean;
          response?: typeof axiosError.response;
          message: string;
        };
        termsError.code = 'TERMS_NOT_ACCEPTED';
        termsError.requiereAceptacionTerminos = true;
        termsError.message = 'TERMS_NOT_ACCEPTED';
        termsError.response = axiosError.response;
        console.log('🔍 Error object created:', {
          code: termsError.code,
          requiereAceptacionTerminos: termsError.requiereAceptacionTerminos,
          message: termsError.message,
          hasResponse: !!termsError.response,
        });
        throw termsError;
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
      // Usar endpoint público para registro de nuevos usuarios
      const response = await api.post<RegisterResponse>(`${this.baseUrl}/public/register`, dto);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al registrar usuario');
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<{
        id: number;
        username: string;
        rol?: string;
        nombres: string;
        apellidos?: string;
        email?: string;
        telefono?: string;
        direccion?: string;
        fechaNacimiento?: string;
        genero?: string;
        biografia?: string;
        fotoUrl?: string;
        numeroDocumento?: string;
        personaId?: number;
        empresaId?: number;
        empresa?: {
          id: number;
          razonSocial: string;
          numeroDocumento: string;
        };
      }>(`${this.baseUrl}/profile`);
      
      // Mapear la respuesta plana del backend a la estructura esperada por el frontend
      const backendData = response.data;
      console.log('📦 Backend profile response (RAW):', JSON.stringify(backendData, null, 2));
      console.log('🔍 backendData.empresaId:', backendData.empresaId, 'type:', typeof backendData.empresaId);
      console.log('🔍 backendData.empresa:', JSON.stringify(backendData.empresa, null, 2));
      console.log('🔍 backendData.empresa existe?', !!backendData.empresa);
      
      // Construir el objeto empresa si existe
      let empresaMapeada: { id: number; razonSocial: string; numeroDocumento: string } | undefined = undefined;
      if (backendData.empresa) {
        empresaMapeada = {
          id: backendData.empresa.id,
          razonSocial: backendData.empresa.razonSocial,
          numeroDocumento: backendData.empresa.numeroDocumento,
        };
        console.log('✅ Empresa mapeada:', JSON.stringify(empresaMapeada, null, 2));
      } else {
        console.warn('⚠️ backendData.empresa es null/undefined');
      }
      
      // Mapear empresaId
      const empresaIdMapeado = backendData.empresaId !== undefined && backendData.empresaId !== null 
        ? Number(backendData.empresaId) 
        : undefined;
      console.log('✅ empresaId mapeado:', empresaIdMapeado, 'type:', typeof empresaIdMapeado);
      
      // Asegurar que empresaId y empresa se mapeen correctamente dentro de persona
      const userProfile: UserProfile = {
        id: backendData.id,
        username: backendData.username,
        rol: backendData.rol || '',
        personaId: backendData.personaId,
        persona: {
          id: backendData.personaId,
          numeroDocumento: backendData.numeroDocumento || '',
          nombres: backendData.nombres,
          apellidos: backendData.apellidos,
          email: backendData.email,
          fotoUrl: backendData.fotoUrl,
          telefono: backendData.telefono,
          direccion: backendData.direccion,
          fechaNacimiento: backendData.fechaNacimiento,
          genero: backendData.genero,
          biografia: backendData.biografia,
          // Mapear empresaId desde el nivel raíz a persona.empresaId
          empresaId: empresaIdMapeado,
          // Mapear empresa desde el nivel raíz a persona.empresa
          empresa: empresaMapeada,
        },
      };
      
      console.log('✅ Mapped user profile:', JSON.stringify(userProfile, null, 2));
      console.log('🏢 Empresa en perfil mapeado:', JSON.stringify(userProfile.persona.empresa, null, 2));
      console.log('🏢 empresaId en perfil mapeado:', userProfile.persona.empresaId);
      
      // Verificación adicional
      if (!userProfile.persona.empresa && backendData.empresa) {
        console.error('❌ ERROR: empresa no se mapeó correctamente!');
        console.error('backendData.empresa:', backendData.empresa);
        console.error('empresaMapeada:', empresaMapeada);
      }
      if (!userProfile.persona.empresaId && backendData.empresaId) {
        console.error('❌ ERROR: empresaId no se mapeó correctamente!');
        console.error('backendData.empresaId:', backendData.empresaId);
        console.error('empresaIdMapeado:', empresaIdMapeado);
      }
      
      // Verificación final antes de retornar
      console.log('🔍 Verificación final - userProfile.persona tiene empresaId?', !!userProfile.persona.empresaId);
      console.log('🔍 Verificación final - userProfile.persona tiene empresa?', !!userProfile.persona.empresa);
      
      return userProfile;
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

  async validatePassword(password: string): Promise<{ valid: boolean }> {
    try {
      const response = await api.post<{ valid: boolean }>(`${this.baseUrl}/profile/validate-password`, {
        password,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // Si es 401, la contraseña es inválida
      if (axiosError.response?.status === 401) {
        return { valid: false };
      }
      throw new Error(axiosError.response?.data?.message ?? 'Error al validar la contraseña');
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

  async uploadProfilePhoto(file: File, isPublic: boolean = false): Promise<{ fotoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Usar endpoint público durante el registro, autenticado para actualizar perfil
      const endpoint = isPublic 
        ? `${this.baseUrl}/register/photo`
        : `${this.baseUrl}/profile/photo`;
      
      const response = await api.post<{ message: string; fotoUrl: string }>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return { fotoUrl: response.data.fotoUrl };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al subir la foto de perfil');
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
