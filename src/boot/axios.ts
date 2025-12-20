import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// Configuración de la API
// En desarrollo: http://localhost:3000
// En producción: usar variable de entorno VITE_API_URL
const apiBaseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuración de timeout
const REQUEST_TIMEOUT = 30000; // 30 segundos
api.defaults.timeout = REQUEST_TIMEOUT;

// Configuración de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

/**
 * Función para retry de peticiones fallidas
 */
async function retryRequest(
  requestFn: () => Promise<unknown>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
): Promise<unknown> {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

/**
 * Determina si un error es retryable
 */
function shouldRetry(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    const status = axiosError.response?.status;
    // Retry en errores de red, timeout, o errores 5xx
    return (
      status === undefined ||
      status === 408 ||
      status === 429 ||
      (status !== undefined && status >= 500 && status < 600)
    );
  }
  return false;
}

/**
 * Logger para peticiones HTTP (solo en desarrollo)
 */
function logRequest(method: string, url: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    console.log(`[HTTP] ${method.toUpperCase()} ${url}`, data ? { data } : '');
  }
}

function logResponse(method: string, url: string, status: number, data?: unknown): void {
  if (import.meta.env.DEV) {
    console.log(`[HTTP] ${method.toUpperCase()} ${url} → ${status}`, data ? { data } : '');
  }
}

function logError(method: string, url: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[HTTP ERROR] ${method.toUpperCase()} ${url}`, error);
  }
}

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en desarrollo
    if (config.url && config.method) {
      logRequest(config.method, config.url, config.data);
    }

    return config;
  },
  (error) => {
    // Convertir el error a Error si no lo es ya
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('Error en la petición'));
  },
);

// Interceptor para manejar errores globalmente y logging
api.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (response.config.url && response.config.method) {
      logResponse(
        response.config.method,
        response.config.url,
        response.status,
        response.data,
      );
    }
    return response;
  },
  async (error) => {
    const config = error?.config;

    // Logging de errores
    if (config?.url && config?.method) {
      logError(config.method, config.url, error);
    }

    // Si el error es 401 (No autorizado), redirigir a login
    if (error?.response?.status === 401) {
      // Si el error 401 ocurre en la página de login, no redirigir, solo mostrar el error
      if (window.location.pathname !== '/auth/login') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_profile');
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión de nuevo.'));
      }
    }

    // Retry automático para errores retryables
    if (config && shouldRetry(error) && !config._retry) {
      config._retry = true;
      try {
        return await retryRequest(() => api.request(config));
      } catch (retryError) {
        // Si el retry falla, continuar con el manejo de errores normal
        error = retryError; // Propagar el error del último intento de retry
      }
    }

    // Determinar el mensaje de error final
    let finalErrorMessage: string;
    if (axios.isAxiosError(error) && error.response) {
      // Si hay un mensaje específico del backend, usarlo
      if (typeof error.response.data.message === 'string') {
        finalErrorMessage = error.response.data.message;
      } else if (Array.isArray(error.response.data.message) && error.response.data.message.length > 0) {
        // Si el backend envía un array de mensajes (ej. por ValidationPipe), usar el primero o unirlos
        finalErrorMessage = error.response.data.message[0];
      } else {
        // Mensaje genérico para errores de respuesta HTTP
        finalErrorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error instanceof Error) {
      finalErrorMessage = error.message;
    } else {
      finalErrorMessage = 'Error desconocido en la petición';
    }

    return Promise.reject(new Error(finalErrorMessage));
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
