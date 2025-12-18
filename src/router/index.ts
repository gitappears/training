import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

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

  // Guard de navegación para proteger rutas que requieren autenticación
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token');
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !token) {
      // Redirigir a login si la ruta requiere autenticación y no hay token
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (token && (to.name === 'login' || to.name === 'register')) {
      // Si ya está autenticado, redirigir al home desde login/register
      next('/');
    } else {
      next();
    }
  });

  return Router;
});
