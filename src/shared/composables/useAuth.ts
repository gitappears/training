import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth.store';
import type { LoginDto, RegisterDto } from '../../application/auth/auth.repository.port';

/**
 * Composable para manejar la lógica de autenticación
 * Centraliza el manejo de login, registro, logout y errores relacionados
 */
export function useAuth() {
  const router = useRouter();
  const route = useRoute();
  const $q = useQuasar();
  const authStore = useAuthStore();

  const loading = computed(() => authStore.loading);

  /**
   * Maneja el proceso de login
   */
  async function login(credentials: LoginDto) {
    try {
      await authStore.login(credentials);
      $q.notify({
        type: 'positive',
        message: 'Sesión iniciada exitosamente',
      });
      
      // Redirigir a la ruta original o al home
      const redirect = (route.query.redirect as string) || '/';
      void router.push(redirect);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Error al iniciar sesión';
      let errorData = null;

      // Extraer mensaje y datos del error
      if (error?.response?.data) {
        errorData = error.response.data;
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Verificar si el error es TERMS_NOT_ACCEPTED
      // Buscar en el string del mensaje o en el código de error específico del backend
      if (
        errorMessage.includes('TERMS_NOT_ACCEPTED') ||
        (errorData && errorData.error === 'TERMS_NOT_ACCEPTED')
      ) {
        // Redirigir a la página de aceptación de términos
        const redirect = (route.query.redirect as string) || '/';
        void router.push({
          name: 'terms-acceptance',
          query: { redirect },
        });
        return;
      }
      
      // Manejar PASSWORD_CHANGE_REQUIRED si es necesario (generalmente lo maneja el backend via header o body, 
      // pero si el login falla con este error, podemos redirigir aquí o mostrar un mensaje específico)
      if (errorData && errorData.error === 'PASSWORD_CHANGE_REQUIRED') {
         // Aquí podrías redirigir a cambio de contraseña, pero por ahora mostramos el mensaje
         errorMessage = 'Debe cambiar su contraseña. Por favor contacte al administrador o use la opción de recuperación.';
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        icon: 'warning',
        timeout: 6000,
        actions: [
          { label: 'Cerrar', color: 'white', handler: () => { /* dismiss */ } }
        ]
      });
      
      throw error;
    }
  }

  /**
   * Maneja el proceso de registro
   */
  async function register(data: RegisterDto) {
    try {
      await authStore.register(data);
      $q.notify({
        color: 'positive',
        message: 'Registro exitoso. Espere aprobación del administrador. Su cuenta está deshabilitada temporalmente.',
        icon: 'check',
        timeout: 5000,
      });
      await router.push({ name: 'login' });
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Error al registrar usuario';

      if (error?.response?.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        timeout: 5000,
      });
      
      throw error;
    }
  }

  /**
   * Maneja el proceso de logout
   */
  function logout() {
    authStore.logout();
    $q.notify({
      type: 'info',
      message: 'Sesión cerrada exitosamente',
      position: 'top',
    });
    void router.push('/auth/login');
  }

  /**
   * Actualiza el perfil del usuario
   */
  async function updateProfile(data: Partial<RegisterDto>) {
    try {
      await authStore.updateProfile(data);
      $q.notify({
        type: 'positive',
        message: 'Perfil actualizado exitosamente',
      });
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    }
  }

  return {
    loading,
    login,
    register,
    logout,
    updateProfile,
    user: computed(() => authStore.profile),
    isAuthenticated: computed(() => authStore.isAuthenticated),
  };
}

