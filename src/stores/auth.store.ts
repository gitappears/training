// Store de autenticación usando Pinia
// Gestiona el estado de autenticación del usuario
// ✅ CORREGIDO: Usa casos de uso en lugar de llamar directamente a infrastructure

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../infrastructure/http/auth/auth.service';
import { AuthUseCasesFactory } from '../application/auth/auth.use-cases.factory';
import type {
  LoginDto,
  RegisterDto,
  RegisterResponse,
  TokenResponse,
  UserProfile,
} from '../application/auth/auth.repository.port';

const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'auth_profile';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const storedProfile = localStorage.getItem(PROFILE_KEY);
  const profile = ref<UserProfile | null>(
    storedProfile ? (JSON.parse(storedProfile) as UserProfile) : null,
  );
  const loading = ref(false);

  // Log del perfil inicial desde localStorage
  if (profile.value) {
    console.log('📋 Perfil cargado desde localStorage:', JSON.stringify(profile.value, null, 2));
    console.log('🏢 Empresa en perfil desde localStorage:', profile.value.persona?.empresa);
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userFullName = computed(() => {
    if (!profile.value?.persona?.nombres) return '';
    return `${profile.value.persona.nombres} ${profile.value.persona.apellidos ?? ''}`.trim();
  });

  // Actions - Usando casos de uso en lugar de llamar directamente a infrastructure
  async function login(dto: LoginDto): Promise<void> {
    loading.value = true;
    try {
      const loginUseCase = AuthUseCasesFactory.getLoginUseCase(authService);
      const response: TokenResponse = await loginUseCase.execute(dto);
      token.value = response.access_token;
      localStorage.setItem(TOKEN_KEY, response.access_token);

      // Obtener perfil después del login (siempre recargar para obtener datos actualizados)
      await fetchProfile();

      // Verificar que el perfil tenga la empresa (especialmente para CLIENTE)
      if (profile.value) {
        const tieneEmpresa = !!profile.value.persona?.empresa;
        const tieneEmpresaId =
          profile.value.persona?.empresaId !== undefined &&
          profile.value.persona?.empresaId !== null;
        const esCliente = profile.value.rol === 'CLIENTE';

        if (esCliente && !tieneEmpresa) {
          console.log('⚠️ Usuario CLIENTE sin empresa después del login, recargando...');
          await fetchProfile();
        } else if (tieneEmpresaId && !tieneEmpresa) {
          console.log('⚠️ Perfil sin empresa pero con empresaId, recargando...');
          await fetchProfile();
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function register(dto: RegisterDto): Promise<RegisterResponse> {
    loading.value = true;
    try {
      const registerUseCase = AuthUseCasesFactory.getRegisterUseCase(authService);
      return await registerUseCase.execute(dto);
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: Partial<RegisterDto>): Promise<void> {
    loading.value = true;
    console.log('Updating profile with payload:', data);
    try {
      const updateProfileUseCase = AuthUseCasesFactory.getUpdateProfileUseCase(authService);
      await updateProfileUseCase.execute(data);
      // Refresh profile data
      console.log('Profile updated on backend, refetching...');
      await fetchProfile();
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile(): Promise<void> {
    try {
      const getProfileUseCase = AuthUseCasesFactory.getGetProfileUseCase(authService);
      const userProfile = await getProfileUseCase.execute();
      console.log('📥 Fetched profile from backend:', JSON.stringify(userProfile, null, 2));
      console.log(
        '🏢 Empresa en perfil recibido:',
        JSON.stringify(userProfile.persona?.empresa, null, 2),
      );
      console.log('🏢 empresaId en perfil recibido:', userProfile.persona?.empresaId);

      // Verificar que los datos de empresa estén presentes antes de guardar
      if (userProfile.persona) {
        console.log('✅ persona existe en perfil');
        if (userProfile.persona.empresaId) {
          console.log('✅ empresaId existe:', userProfile.persona.empresaId);
        } else {
          console.warn('⚠️ empresaId NO existe en persona');
        }
        if (userProfile.persona.empresa) {
          console.log('✅ empresa existe:', JSON.stringify(userProfile.persona.empresa, null, 2));
        } else {
          console.warn('⚠️ empresa NO existe en persona');
        }
      }

      profile.value = userProfile;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
      console.log('💾 Profile saved to localStorage.');

      // Verificar que se guardó correctamente
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      console.log(
        '🔍 Profile en store después de guardar:',
        JSON.stringify(profile.value, null, 2),
      );
      console.log(
        '🔍 Profile en localStorage después de guardar:',
        JSON.stringify(savedProfile, null, 2),
      );
      console.log('🔍 empresaId en profile.value:', profile.value?.persona?.empresaId);
      console.log(
        '🔍 empresa en profile.value:',
        JSON.stringify(profile.value?.persona?.empresa, null, 2),
      );
    } catch (error) {
      // Si falla obtener el perfil, hacer logout
      logout();
      throw error;
    }
  }

  async function refreshToken(): Promise<void> {
    try {
      const refreshTokenUseCase = AuthUseCasesFactory.getRefreshTokenUseCase(authService);
      const response: TokenResponse = await refreshTokenUseCase.execute();
      token.value = response.access_token;
      localStorage.setItem(TOKEN_KEY, response.access_token);
    } catch (error) {
      // Si falla el refresh, hacer logout
      logout();
      throw error;
    }
  }

  function logout(): void {
    token.value = null;
    profile.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  // Inicializar: verificar si hay token y cargar perfil
  function init(): void {
    // Evitar cargar perfil en la página de verificación pública
    // Esto previene errores 401 si hay un token vencido, los cuales causarían una redirección al login
    if (window.location.href.includes('/verify')) {
      return;
    }

    if (token.value) {
      // Si no hay perfil, cargarlo
      if (!profile.value) {
        console.log('📋 No hay perfil, cargando desde backend...');
        void fetchProfile();
      } else {
        // Verificar si el perfil tiene empresaId pero no tiene empresa
        const tieneEmpresaId =
          profile.value.persona?.empresaId !== undefined &&
          profile.value.persona?.empresaId !== null;
        const tieneEmpresa = !!profile.value.persona?.empresa;

        console.log('🔍 Verificando perfil en init:');
        console.log(
          '  - tieneEmpresaId:',
          tieneEmpresaId,
          'valor:',
          profile.value.persona?.empresaId,
        );
        console.log('  - tieneEmpresa:', tieneEmpresa);
        console.log('  - persona completa:', JSON.stringify(profile.value.persona, null, 2));

        // Si tiene empresaId pero no tiene empresa, o si es CLIENTE y no tiene empresa, recargar
        if (tieneEmpresaId && !tieneEmpresa) {
          console.log('🔄 Perfil sin empresa pero con empresaId, recargando desde backend...');
          void fetchProfile();
        } else if (profile.value.rol === 'CLIENTE' && !tieneEmpresa) {
          console.log('🔄 Usuario CLIENTE sin empresa, recargando desde backend...');
          void fetchProfile();
        } else {
          console.log('✅ Perfil completo, no es necesario recargar');
        }
      }
    }
  }

  return {
    // State
    token,
    profile,
    loading,
    // Getters
    isAuthenticated,
    userFullName,
    // Actions
    login,
    register,
    updateProfile,
    fetchProfile,
    refreshToken,
    logout,
    init,
  };
});
