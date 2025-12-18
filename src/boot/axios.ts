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

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado), redirigir a login
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_profile');
      // Solo redirigir si no estamos ya en la página de login
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    
    // Convertir el error a Error si no lo es ya
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    
    // Si es un error de Axios, crear un Error con el mensaje apropiado
    const errorMessage =
      error?.response?.data?.message ??
      error?.message ??
      'Error desconocido en la petición';
    
    return Promise.reject(new Error(errorMessage));
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
