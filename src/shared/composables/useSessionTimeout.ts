/**
 * Composable para manejar el cierre de sesión por inactividad y tiempo máximo
 * Implementa dos estrategias:
 * 1. Cierre por inactividad (sin actividad del usuario)
 * 2. Cierre por tiempo máximo de sesión (1 hora máximo)
 */

import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth.store';
import { configuracionSesionService } from '../../infrastructure/http/sesion/configuracion-sesion.service';
import { SesionUseCasesFactory } from '../../application/sesion/sesion.use-cases.factory';
import type { ConfiguracionSesion } from '../../application/sesion/sesion.repository.port';

/**
 * Eventos que se consideran actividad del usuario
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
] as const;

export function useSessionTimeout() {
  const router = useRouter();
  const $q = useQuasar();
  const authStore = useAuthStore();

  // Estado
  const configuracion = ref<ConfiguracionSesion | null>(null);
  const lastActivityTime = ref<Date>(new Date());
  const sessionStartTime = ref<Date | null>(null);
  const inactivityTimer = ref<number | null>(null);
  const inactivityWarningTimer = ref<number | null>(null);
  const inactivityCloseTimer = ref<number | null>(null);
  const maxSessionTimer = ref<number | null>(null);
  const maxSessionWarningTimer = ref<number | null>(null);
  const maxSessionCloseTimer = ref<number | null>(null);
  const showInactivityDialog = ref(false);
  const showMaxSessionDialog = ref(false);
  const warningTime = ref<number | null>(null); // Tiempo restante antes de cerrar
  const inactivityCheckInterval = ref<number | null>(null);

  // Use case
  const getActiveConfiguracionSesionUseCase =
    SesionUseCasesFactory.getGetActiveConfiguracionSesionUseCase(configuracionSesionService);

  /**
   * Carga la configuración activa desde el backend
   */
  const cargarConfiguracion = async () => {
    try {
      const config = await getActiveConfiguracionSesionUseCase.execute();
      configuracion.value = config;

      // Si hay configuración activa, inicializar los timers
      if (config && config.activo) {
        if (config.tiempoInactividadMinutos) {
          iniciarTimerInactividad();
        }
        if (config.tiempoMaximoSesionMinutos) {
          iniciarTimerMaximoSesion(config.tiempoMaximoSesionMinutos);
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración de sesión:', error);
      // Si falla, continuar sin configuración (no bloquear la app)
    }
  };

  /**
   * Actualiza el tiempo de última actividad
   */
  const updateActivity = () => {
    lastActivityTime.value = new Date();

    // Si hay un diálogo de inactividad abierto, cerrarlo y reiniciar
    if (showInactivityDialog.value) {
      showInactivityDialog.value = false;
      warningTime.value = null;
      if (inactivityCloseTimer.value) {
        clearTimeout(inactivityCloseTimer.value);
        inactivityCloseTimer.value = null;
      }
    }
  };

  /**
   * Verifica periódicamente la inactividad
   */
  const checkInactivity = () => {
    if (!configuracion.value?.tiempoInactividadMinutos || !authStore.isAuthenticated) {
      return;
    }

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityTime.value.getTime();
    const inactivityMs = configuracion.value.tiempoInactividadMinutos * 60 * 1000;
    const warningMs = 5 * 60 * 1000; // 5 minutos antes

    // Si ha pasado el tiempo de inactividad menos el warning
    if (timeSinceLastActivity >= inactivityMs - warningMs && !showInactivityDialog.value) {
      warningTime.value = Math.floor(warningMs / 1000 / 60);
      showInactivityDialog.value = true;

      // Timer para cerrar después del warning
      inactivityCloseTimer.value = window.setTimeout(() => {
        if (showInactivityDialog.value) {
          cerrarSesion('inactividad');
        }
      }, warningMs);
    }

    // Si ha pasado el tiempo completo de inactividad
    if (timeSinceLastActivity >= inactivityMs && !showInactivityDialog.value) {
      cerrarSesion('inactividad');
    }
  };

  /**
   * Inicia la verificación periódica de inactividad
   */
  const iniciarTimerInactividad = () => {
    // Limpiar intervalos anteriores
    if (inactivityCheckInterval.value) {
      clearInterval(inactivityCheckInterval.value);
    }
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
    }
    if (inactivityWarningTimer.value) {
      clearTimeout(inactivityWarningTimer.value);
    }
    if (inactivityCloseTimer.value) {
      clearTimeout(inactivityCloseTimer.value);
    }

    // Verificar cada 30 segundos
    inactivityCheckInterval.value = window.setInterval(() => {
      checkInactivity();
    }, 30 * 1000);
  };

  /**
   * Inicia el timer de tiempo máximo de sesión
   */
  const iniciarTimerMaximoSesion = (minutos: number) => {
    if (maxSessionTimer.value) {
      clearTimeout(maxSessionTimer.value);
    }
    if (maxSessionWarningTimer.value) {
      clearTimeout(maxSessionWarningTimer.value);
    }
    if (maxSessionCloseTimer.value) {
      clearTimeout(maxSessionCloseTimer.value);
    }

    // Limitar a máximo 60 minutos (1 hora)
    const maxMinutes = Math.min(minutos, 60);
    const ms = maxMinutes * 60 * 1000;
    const warningMs = 5 * 60 * 1000; // 5 minutos antes de cerrar

    sessionStartTime.value = new Date();

    // Si el tiempo configurado es menor a 5 minutos, no mostrar warning
    if (ms <= warningMs) {
      maxSessionTimer.value = window.setTimeout(() => {
        cerrarSesion('tiempo_maximo');
      }, ms);
      return;
    }

    // Timer para mostrar advertencia
    maxSessionWarningTimer.value = window.setTimeout(() => {
      warningTime.value = Math.floor(warningMs / 1000 / 60); // minutos restantes
      showMaxSessionDialog.value = true;

      // Timer para cerrar después del warning (5 minutos)
      maxSessionCloseTimer.value = window.setTimeout(() => {
        if (showMaxSessionDialog.value) {
          cerrarSesion('tiempo_maximo');
        }
      }, warningMs);
    }, ms - warningMs);
  };

  /**
   * Extiende la sesión refrescando el token
   */
  const extenderSesion = async () => {
    try {
      // Limpiar timers actuales
      if (inactivityCheckInterval.value) {
        clearInterval(inactivityCheckInterval.value);
        inactivityCheckInterval.value = null;
      }
      if (inactivityTimer.value) {
        clearTimeout(inactivityTimer.value);
        inactivityTimer.value = null;
      }
      if (inactivityWarningTimer.value) {
        clearTimeout(inactivityWarningTimer.value);
        inactivityWarningTimer.value = null;
      }
      if (inactivityCloseTimer.value) {
        clearTimeout(inactivityCloseTimer.value);
        inactivityCloseTimer.value = null;
      }
      if (maxSessionTimer.value) {
        clearTimeout(maxSessionTimer.value);
        maxSessionTimer.value = null;
      }
      if (maxSessionWarningTimer.value) {
        clearTimeout(maxSessionWarningTimer.value);
        maxSessionWarningTimer.value = null;
      }
      if (maxSessionCloseTimer.value) {
        clearTimeout(maxSessionCloseTimer.value);
        maxSessionCloseTimer.value = null;
      }

      await authStore.refreshToken();
      showInactivityDialog.value = false;
      showMaxSessionDialog.value = false;
      warningTime.value = null;
      lastActivityTime.value = new Date();
      sessionStartTime.value = new Date();

      // Reiniciar timers
      if (configuracion.value && configuracion.value.activo) {
        if (configuracion.value.tiempoInactividadMinutos) {
          iniciarTimerInactividad();
        }
        if (configuracion.value.tiempoMaximoSesionMinutos) {
          iniciarTimerMaximoSesion(configuracion.value.tiempoMaximoSesionMinutos);
        }
      }

      $q.notify({
        type: 'positive',
        message: 'Sesión extendida exitosamente',
        position: 'top',
      });
    } catch (error) {
      console.error('Error al extender sesión:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al extender la sesión. Será redirigido al login.',
        position: 'top',
      });
      cerrarSesion('error');
    }
  };

  /**
   * Cierra la sesión
   */
  const cerrarSesion = (razon: 'inactividad' | 'tiempo_maximo' | 'error' | 'usuario') => {
    // Limpiar timers
    if (inactivityCheckInterval.value) {
      clearInterval(inactivityCheckInterval.value);
      inactivityCheckInterval.value = null;
    }
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
      inactivityTimer.value = null;
    }
    if (inactivityWarningTimer.value) {
      clearTimeout(inactivityWarningTimer.value);
      inactivityWarningTimer.value = null;
    }
    if (inactivityCloseTimer.value) {
      clearTimeout(inactivityCloseTimer.value);
      inactivityCloseTimer.value = null;
    }
    if (maxSessionTimer.value) {
      clearTimeout(maxSessionTimer.value);
      maxSessionTimer.value = null;
    }
    if (maxSessionWarningTimer.value) {
      clearTimeout(maxSessionWarningTimer.value);
      maxSessionWarningTimer.value = null;
    }
    if (maxSessionCloseTimer.value) {
      clearTimeout(maxSessionCloseTimer.value);
      maxSessionCloseTimer.value = null;
    }

    // Cerrar diálogos
    showInactivityDialog.value = false;
    showMaxSessionDialog.value = false;
    warningTime.value = null;

    // Hacer logout
    authStore.logout();

    const mensajes: Record<typeof razon, string> = {
      inactividad: 'Sesión cerrada por inactividad',
      tiempo_maximo: 'Sesión cerrada por tiempo máximo alcanzado',
      error: 'Error en la sesión. Por favor, inicie sesión nuevamente',
      usuario: 'Sesión cerrada',
    };

    $q.notify({
      type: 'info',
      message: mensajes[razon],
      position: 'top',
    });

    void router.push('/auth/login');
  };

  // Escuchar eventos de actividad
  const setupActivityListeners = () => {
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });
  };

  const removeActivityListeners = () => {
    ACTIVITY_EVENTS.forEach((event) => {
      document.removeEventListener(event, updateActivity, true);
    });
  };

  // Inicializar cuando el usuario está autenticado
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        void cargarConfiguracion();
        setupActivityListeners();
        sessionStartTime.value = new Date();
      } else {
        removeActivityListeners();
        if (inactivityCheckInterval.value) {
          clearInterval(inactivityCheckInterval.value);
          inactivityCheckInterval.value = null;
        }
        if (inactivityTimer.value) {
          clearTimeout(inactivityTimer.value);
          inactivityTimer.value = null;
        }
        if (inactivityWarningTimer.value) {
          clearTimeout(inactivityWarningTimer.value);
          inactivityWarningTimer.value = null;
        }
        if (inactivityCloseTimer.value) {
          clearTimeout(inactivityCloseTimer.value);
          inactivityCloseTimer.value = null;
        }
        if (maxSessionTimer.value) {
          clearTimeout(maxSessionTimer.value);
          maxSessionTimer.value = null;
        }
        if (maxSessionWarningTimer.value) {
          clearTimeout(maxSessionWarningTimer.value);
          maxSessionWarningTimer.value = null;
        }
        if (maxSessionCloseTimer.value) {
          clearTimeout(maxSessionCloseTimer.value);
          maxSessionCloseTimer.value = null;
        }
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    if (authStore.isAuthenticated) {
      void cargarConfiguracion();
      setupActivityListeners();
    }
  });

  onUnmounted(() => {
    removeActivityListeners();
    if (inactivityCheckInterval.value) {
      clearInterval(inactivityCheckInterval.value);
    }
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value);
    }
    if (inactivityWarningTimer.value) {
      clearTimeout(inactivityWarningTimer.value);
    }
    if (inactivityCloseTimer.value) {
      clearTimeout(inactivityCloseTimer.value);
    }
    if (maxSessionTimer.value) {
      clearTimeout(maxSessionTimer.value);
    }
    if (maxSessionWarningTimer.value) {
      clearTimeout(maxSessionWarningTimer.value);
    }
    if (maxSessionCloseTimer.value) {
      clearTimeout(maxSessionCloseTimer.value);
    }
  });

  return {
    // Estado
    configuracion,
    showInactivityDialog,
    showMaxSessionDialog,
    warningTime,
    sessionStartTime,
    // Funciones
    extenderSesion,
    cerrarSesion,
    cargarConfiguracion,
  };
}
