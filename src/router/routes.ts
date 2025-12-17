import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../shared/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../presentation/main/pages/HomePage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../presentation/system/pages/ErrorNotFound.vue'),
  },
];

export default routes;
