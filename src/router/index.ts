import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import type { UserRole } from '../shared/composables/useRole';
import { isTokenExpired } from '../shared/utils/token-validator';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  /* 
   * FORCE HASH MODE to solve URL resolution issues in Docker/Production
   * The env var might be defaulting to history in some contexts
   */
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Helper para verificar roles
  function hasRole(userRole: string | null | undefined, allowedRoles: UserRole[]): boolean {
    if (!userRole) return false;
    const normalizedRol = userRole.toUpperCase() as UserRole;
    return allowedRoles.includes(normalizedRol);
  }

  // Función para verificar aceptación de términos
  async function checkTermsAcceptance(): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) return true; // Si no hay token, no se puede verificar

    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { termsService } = await import('../infrastructure/http/terms/terms.service');
      const { TermsUseCasesFactory } = await import('../application/terms/terms.use-cases.factory');

      const verifyUseCase = TermsUseCasesFactory.getVerifyAcceptanceUseCase(termsService);
      const result = await verifyUseCase.execute();
      // Retornar el valor de aceptado directamente
      return result.aceptado === true;
    } catch (error: unknown) {
      // El servicio ya maneja el 401 y retorna { aceptado: false } sin lanzar error
      // Si llegamos aquí, es un error de red/servidor u otro error inesperado
      console.error('Error verifying terms acceptance:', error);
      // En caso de error de red/servidor, permitir acceso para no bloquear al usuario
      // pero solo si no es un error de autenticación
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 401
      ) {
        return false; // No aceptado si es 401
      }
      return true; // Permitir acceso en caso de error de red/servidor
    }
  }

  // Guard de navegación para proteger rutas que requieren autenticación y roles
  Router.beforeEach(async (to, from, next) => {
    // ✅ BYPASS: Si la ruta es pública de verificación, permitir acceso inmediato
    if (to.path.includes('/verify/')) {
        next();
        return;
    }

    const token = localStorage.getItem('auth_token');
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles as UserRole[] | undefined;

    // Validar token si existe
    if (token) {
      // Verificar si el token ha expirado
      if (isTokenExpired(token)) {
        // Token expirado: limpiar datos y redirigir a login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_profile');
        
        // Si está intentando acceder a una ruta protegida, redirigir a login
        if (requiresAuth) {
          next({ name: 'login', query: { redirect: to.fullPath, expired: 'true' } });
          return;
        }
        // Si no requiere auth pero hay token expirado, limpiar y continuar
        // (permite acceso a rutas públicas)
      }
    }

    // Verificar autenticación
    if (requiresAuth && !token) {
      // Redirigir a login si la ruta requiere autenticación y no hay token
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Verificar aceptación de términos para rutas protegidas (excepto la página de aceptación)
    if (requiresAuth && token && to.name !== 'terms-acceptance') {
      const termsAccepted = await checkTermsAcceptance();
      if (!termsAccepted) {
        // Usuario no ha aceptado los términos, redirigir a página de aceptación
        next({
          name: 'terms-acceptance',
          query: { redirect: to.fullPath },
        });
        return;
      }
    }

    // Si está en la página de términos y ya los aceptó, redirigir al home o a la ruta de redirección
    if (token && to.name === 'terms-acceptance') {
      const termsAccepted = await checkTermsAcceptance();
      if (termsAccepted) {
        const redirect = (to.query.redirect as string) || '/';
        next(redirect);
        return;
      }
    }

    // Si ya está autenticado y los términos están aceptados, redirigir al home desde login/register
    if (token && (to.name === 'login' || to.name === 'register')) {
      // Verificar términos antes de redirigir
      const termsAccepted = await checkTermsAcceptance();
      if (termsAccepted) {
        next('/');
        return;
      } else {
        // Si no ha aceptado términos, redirigir a la página de aceptación
        next({
          name: 'terms-acceptance',
          query: { redirect: '/' },
        });
        return;
      }
    }

    // Verificar roles si la ruta los requiere
    if (requiresAuth && requiredRoles && requiredRoles.length > 0 && token) {
      // Obtener el perfil del localStorage (el store puede no estar inicializado aún)
      const profileStr = localStorage.getItem('auth_profile');
      let userRole: string | null = null;

      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          userRole = profile?.rol || null;
        } catch (e) {
          console.error('Error parsing profile from localStorage:', e);
        }
      }

      if (!hasRole(userRole, requiredRoles)) {
        // Usuario no tiene el rol requerido, redirigir al home con mensaje
        next({
          path: '/',
          query: { error: 'no_permission' },
        });
        return;
      }
    }

    next();
  });

  return Router;
});
