import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import type { UserRole } from '../shared/composables/useRole';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
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
      return result.aceptado;
    } catch (error: any) {
      // Si hay error 401, significa que no ha aceptado los términos
      // Otros errores también se consideran como no aceptados por seguridad
      if (error?.response?.status === 401 || error?.message?.includes('términos')) {
        return false;
      }
      // Para otros errores (red, servidor, etc.), permitir acceso para no bloquear al usuario
      // pero registrar el error
      console.error('Error verifying terms acceptance:', error);
      return true; // Permitir acceso en caso de error de red/servidor
    }
  }

  // Guard de navegación para proteger rutas que requieren autenticación y roles
  Router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('auth_token');
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiredRoles = to.meta.roles as UserRole[] | undefined;

    // Verificar autenticación
    if (requiresAuth && !token) {
      // Redirigir a login si la ruta requiere autenticación y no hay token
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Si ya está autenticado, redirigir al home desde login/register
    if (token && (to.name === 'login' || to.name === 'register')) {
      next('/');
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
