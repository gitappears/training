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

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userFullName = computed(() => {
    if (!profile.value) return '';
    return `${profile.value.nombres} ${profile.value.apellidos}`.trim();
  });

  // Actions - Usando casos de uso en lugar de llamar directamente a infrastructure
  async function login(dto: LoginDto): Promise<void> {
    loading.value = true;
    try {
      const loginUseCase = AuthUseCasesFactory.getLoginUseCase(authService);
      const response: TokenResponse = await loginUseCase.execute(dto);
      token.value = response.access_token;
      localStorage.setItem(TOKEN_KEY, response.access_token);

      // Obtener perfil después del login
      await fetchProfile();
    } finally {
      loading.value = false;
    }
  }

  async function register(dto: RegisterDto): Promise<void> {
    loading.value = true;
    try {
      const registerUseCase = AuthUseCasesFactory.getRegisterUseCase(authService);
      const response: TokenResponse = await registerUseCase.execute(dto);
      token.value = response.access_token;
      localStorage.setItem(TOKEN_KEY, response.access_token);

      // Obtener perfil después del registro
      await fetchProfile();
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile(): Promise<void> {
    try {
      const getProfileUseCase = AuthUseCasesFactory.getGetProfileUseCase(authService);
      const userProfile = await getProfileUseCase.execute();
      profile.value = userProfile;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
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
    if (token.value && !profile.value) {
      void fetchProfile();
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
    fetchProfile,
    refreshToken,
    logout,
    init,
  };
});

