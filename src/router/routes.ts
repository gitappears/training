import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rutas de autenticación (layout independiente)
  {
    path: '/auth',
    component: () => import('../shared/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../presentation/auth/pages/LoginPage.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../presentation/auth/pages/RegisterPage.vue'),
      },
      {
        path: 'policies/:type',
        name: 'policies',
        component: () => import('../presentation/auth/pages/PoliciesPage.vue'),
      },
    ],
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: '/',
    component: () => import('../shared/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      { path: '', component: () => import('../presentation/main/pages/HomePage.vue') },

      // Cursos (Capacitaciones)
      {
        path: 'trainings',
        component: () => import('../presentation/trainings/pages/TrainingsListPage.vue'),
      },
      {
        path: 'trainings/new',
        component: () => import('../presentation/trainings/pages/TrainingCreatePage.vue'),
      },
      {
        path: 'trainings/:id',
        component: () => import('../presentation/trainings/pages/TrainingDetailPage.vue'),
      },

      // Usuarios (Gestión de usuarios según RF-01 a RF-07)
      {
        path: 'users',
        component: () => import('../presentation/users/pages/UsersListPage.vue'),
      },
      {
        path: 'users/new',
        component: () => import('../presentation/users/pages/UserCreatePage.vue'),
      },
      {
        path: 'users/:id',
        component: () => import('../presentation/users/pages/UserDetailPage.vue'),
      },

      // Evaluaciones (RF-16 a RF-21)
      {
        path: 'evaluations',
        component: () => import('../presentation/evaluations/pages/EvaluationsListPage.vue'),
      },
      {
        path: 'evaluations/:id',
        component: () => import('../presentation/evaluations/pages/EvaluationTakePage.vue'),
      },

      // Certificados (RF-22 a RF-24)
      {
        path: 'certificates',
        component: () => import('../presentation/certificates/pages/CertificatesListPage.vue'),
      },
      {
        path: 'certificates/:id',
        component: () => import('../presentation/certificates/pages/CertificateDetailPage.vue'),
      },

      // Reportes (RF-40 a RF-42)
      {
        path: 'reports',
        component: () => import('../presentation/reports/pages/ReportsPage.vue'),
      },
    ],
  },

  // Ruta pública para verificación de certificados (RF-32 a RF-34)
  {
    path: '/verify/:token',
    component: () => import('../presentation/certificates/pages/CertificateVerificationPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../presentation/system/pages/ErrorNotFound.vue'),
  },
];

export default routes;
