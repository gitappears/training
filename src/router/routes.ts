import type { RouteRecordRaw } from 'vue-router';
import type { UserRole } from '../shared/composables/useRole';

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
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('../presentation/auth/pages/ForgotPasswordPage.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('../presentation/auth/pages/ResetPasswordPage.vue'),
      },
      {
        path: 'policies/:type',
        name: 'policies',
        component: () => import('../presentation/auth/pages/PoliciesPage.vue'),
      },
      {
        path: 'terms-acceptance',
        name: 'terms-acceptance',
        component: () => import('../presentation/auth/pages/TermsAcceptancePage.vue'),
        meta: {
          requiresAuth: true,
        },
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
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },
      {
        path: 'trainings/new',
        component: () => import('../presentation/trainings/pages/TrainingCreatePage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR'] as UserRole[],
        },
      },
      {
        path: 'trainings/:id/edit',
        name: 'training-edit',
        component: () => import('../presentation/trainings/pages/TrainingEditPage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR'] as UserRole[],
        },
      },
      {
        path: 'trainings/:id',
        component: () => import('../presentation/trainings/pages/TrainingDetailPage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },

      // Usuarios (Gestión de usuarios según RF-01 a RF-07) - Solo ADMIN
      {
        path: 'users',
        component: () => import('../presentation/users/pages/UsersListPage.vue'),
        meta: {
          roles: ['ADMIN'] as UserRole[],
        },
      },
      {
        path: 'users/new',
        component: () => import('../presentation/users/pages/UserCreatePage.vue'),
        meta: {
          roles: ['ADMIN'] as UserRole[],
        },
      },
      {
        path: 'users/:id',
        component: () => import('../presentation/users/pages/UserDetailPage.vue'),
        meta: {
          roles: ['ADMIN'] as UserRole[],
        },
      },

      // Evaluaciones (RF-16 a RF-21)
      {
        path: 'evaluations',
        component: () => import('../presentation/evaluations/pages/EvaluationsListPage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },
      {
        path: 'evaluations/:id',
        component: () => import('../presentation/evaluations/pages/EvaluationTakePage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },

      // Certificados (RF-22 a RF-24)
      {
        path: 'certificates',
        component: () => import('../presentation/certificates/pages/CertificatesListPage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },
      {
        path: 'certificates/:id',
        component: () => import('../presentation/certificates/pages/CertificateDetailPage.vue'),
        meta: {
          roles: ['ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },
      
      // Certificados - Vigencias y Alertas (RF-35 a RF-39)
      {
        path: 'certificates/expiring',
        name: 'expiring-certificates',
        component: () => import('../presentation/certificates/pages/ExpiringCertificatesPage.vue'),
        meta: {
          roles: ['ADMIN', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
      },
      {
        path: 'admin/alert-config',
        name: 'alert-configuration',
        component: () => import('../presentation/admin/pages/AlertConfigurationPage.vue'),
        meta: {
          roles: ['ADMIN'] as UserRole[],
        },
      },

      // Perfil
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../presentation/users/pages/ProfilePage.vue'),
      },

      // Reportes (RF-40 a RF-42) - Solo ADMIN, CLIENTE, OPERADOR
      {
        path: 'reports',
        component: () => import('../presentation/reports/pages/ReportsPage.vue'),
        meta: {
          roles: ['ADMIN', 'CLIENTE', 'OPERADOR'] as UserRole[],
        },
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
  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('../presentation/system/pages/ErrorNotFound.vue'),
  // },
];

export default routes;
