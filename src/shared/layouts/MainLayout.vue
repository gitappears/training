<template>
  <q-layout view="lhh lpR lFf">
    <!-- Header -->
    <q-header elevated :class="themeStore.isDark ? 'bg-dark text-white' : 'bg-white text-primary'" class="app-header">
      <q-toolbar class="no-wrap app-toolbar q-px-lg">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          class="q-mr-md"
          @click="toggleLeftDrawer"
        />

        <q-space />

        <div class="row items-center q-gutter-md">
          <!-- Toggle Dark Mode -->
          <q-btn
            flat
            round
            dense
            :icon="themeStore.isDark ? 'light_mode' : 'dark_mode'"
            class="relative-position"
            @click="themeStore.toggleTheme()"
          >
            <q-tooltip>{{ themeStore.isDark ? 'Modo Claro' : 'Modo Oscuro' }}</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="notifications" class="relative-position">
            <q-badge v-if="false" color="negative" floating rounded />
            <q-tooltip>Notificaciones</q-tooltip>
          </q-btn>

          <q-btn flat round class="q-pa-xs">
            <q-avatar size="36px" class="cursor-pointer">
              <img :src="userImageUrl" alt="User" />
            </q-avatar>
            <q-menu
              anchor="bottom right"
              self="top right"
              :offset="[0, 8]"
              class="q-mt-sm"
            >
              <q-list style="min-width: 280px" class="q-pa-sm">
                <q-item class="q-pa-md">
                  <q-item-section avatar>
                    <q-avatar size="48px">
                      <img :src="userImageUrl" alt="User" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ authStore.userFullName || 'Usuario' }}</q-item-label>
                    <q-item-label caption class="text-grey-7">{{ authStore.profile?.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />

                <q-item clickable v-close-popup :to="{ name: 'profile' }" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Editar Perfil</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup class="q-py-md" @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Cerrar Sesión</q-item-label>
                    <q-item-label caption class="text-grey-6">Salir de tu cuenta</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigation -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      :width="280"
      :breakpoint="1024"
      bordered
      class="app-drawer"
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = false"
    >
      <!-- Logo Section -->
      <div class="drawer-header q-pa-lg">
        <div class="row items-center no-wrap">
          <q-avatar
            size="40px"
            color="primary"
            text-color="white"
            class="q-mr-sm cursor-pointer"
            @click="$router.push('/')"
          >
            <span class="text-weight-bold">TD</span>
          </q-avatar>
          <div v-if="!miniState" class="column col">
            <div class="text-body1 text-weight-bold text-primary">Formar 360</div>
            <div class="text-caption text-grey-6">Plataforma de capacitación</div>
          </div>
        </div>
      </div>

      <q-scroll-area class="fit drawer-scroll">
        <q-list padding class="q-pa-sm">
          <!-- Main Navigation -->
          <div v-if="!miniState" class="text-uppercase text-caption text-grey-6 q-px-md q-py-sm text-weight-medium">
            Menú Principal
          </div>

          <q-item
            v-ripple
            clickable
            to="/"
            exact
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="dashboard" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Dashboard</q-item-label>
              <q-item-label caption class="text-grey-6">Resumen de capacitación</q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Dashboard
            </q-tooltip>
          </q-item>

          <!-- Cursos - Visible para todos los roles autenticados -->
          <q-item
            v-if="canViewTrainings"
            v-ripple
            clickable
            to="/trainings"
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="school" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Cursos</q-item-label>
              <q-item-label caption class="text-grey-6">
                {{ canManageTrainings ? 'Gestión de catálogo' : 'Ver capacitaciones' }}
              </q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Cursos
            </q-tooltip>
          </q-item>

          <!-- Usuarios - Solo ADMIN -->
          <q-item
            v-if="canManageUsers"
            v-ripple
            clickable
            to="/users"
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="people" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Usuarios</q-item-label>
              <q-item-label caption class="text-grey-6">Participantes y roles</q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Usuarios
            </q-tooltip>
          </q-item>

          <!-- Evaluaciones - Visible para todos los roles autenticados -->
          <q-item
            v-if="canViewEvaluations"
            v-ripple
            clickable
            to="/evaluations"
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="quiz" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Evaluaciones</q-item-label>
              <q-item-label caption class="text-grey-6">Realizar evaluaciones</q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Evaluaciones
            </q-tooltip>
          </q-item>

          <!-- Certificados - Visible para todos los roles autenticados -->
          <q-item
            v-if="canViewCertificates"
            v-ripple
            clickable
            to="/certificates"
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="verified" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Certificados</q-item-label>
              <q-item-label caption class="text-grey-6">Mis certificados</q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Certificados
            </q-tooltip>
          </q-item>

          <!-- Separator - Solo si hay sección de métricas visible -->
          <q-separator v-if="canViewReports" class="q-my-md" />

          <!-- Metrics Section - Solo ADMIN, CLIENTE, OPERADOR -->
          <div
            v-if="canViewReports && !miniState"
            class="text-uppercase text-caption text-grey-6 q-px-md q-py-sm text-weight-medium"
          >
            Métricas
          </div>

          <!-- Reportes - Solo ADMIN, CLIENTE, OPERADOR -->
          <q-item
            v-if="canViewReports"
            v-ripple
            clickable
            to="/reports"
            class="nav-item q-my-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar class="q-mr-none">
              <q-icon name="insights" size="22px" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="text-weight-medium">Reportes</q-item-label>
              <q-item-label caption class="text-grey-6">Desempeño y KPIs</q-item-label>
            </q-item-section>
            <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[10, 0]">
              Reportes
            </q-tooltip>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- User Profile Footer -->
      <div class="drawer-footer q-pa-md">
        <q-separator class="q-mb-md" />
        <div v-if="!miniState" class="row items-center q-mb-md">
          <q-avatar size="40px" class="q-mr-sm">
            <img :src="userImageUrl" alt="User" />
          </q-avatar>
          <div class="column col">
            <span class="text-body2 text-weight-medium">{{ authStore.userFullName || 'Usuario' }}</span>
            <span class="text-caption text-grey-6">{{ authStore.profile?.email || 'Usuario' }}</span>
          </div>
        </div>
        <q-btn
          v-if="!miniState"
          flat
          unelevated
          color="negative"
          icon="logout"
          label="Cerrar Sesión"
          class="full-width"
          @click="handleLogout"
        />
        <q-btn
          v-else
          flat
          round
          color="negative"
          icon="logout"
          class="full-width"
          @click="handleLogout"
        >
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Cerrar Sesión
          </q-tooltip>
        </q-btn>
      </div>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { useRole } from '../composables/useRole';
import { api } from 'boot/axios';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const {
  canViewTrainings,
  canManageTrainings,
  canManageUsers,
  canViewEvaluations,
  canViewCertificates,
  canViewReports,
} = useRole();

const userImageUrl = computed(() => {
  const fotoUrl = authStore.profile?.fotoUrl;
  if (!fotoUrl) {
    // Return a default or a generated avatar if no photo is set
    return `https://api.dicebear.com/8.x/adventurer/svg?seed=${authStore.profile?.username || 'default'}`;
  }
  if (fotoUrl.startsWith('http')) {
    return fotoUrl;
  }
  return `${api.defaults.baseURL}${fotoUrl}`;
});


// Sincronizar el tema con el body
watch(
  () => themeStore.isDark,
  (isDark) => {
    document.body.classList.toggle('body--dark', isDark);
    document.body.classList.toggle('body--light', !isDark);
  },
  { immediate: true },
);

const leftDrawerOpen = ref(true);
const miniState = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  authStore.logout();
  $q.notify({
    type: 'info',
    message: 'Sesión cerrada exitosamente',
    position: 'top',
  });
  void router.push('/auth/login');
}
</script>

<style lang="scss" scoped>
.app-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

body.body--light .app-header {
  background: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

body.body--dark .app-header {
  background: rgba(30, 27, 75, 0.95) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.app-toolbar {
  min-height: 64px;
}

.app-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

body.body--light .app-drawer {
  background: #ffffff !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

body.body--dark .app-drawer {
  background: #1e1b4b !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 0.3s ease, border-color 0.3s ease;
}

body.body--light .drawer-header {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(255, 255, 255, 1) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

body.body--dark .drawer-header {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(30, 27, 75, 1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-scroll {
  height: calc(100vh - 200px);
}

.drawer-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: background 0.3s ease, border-color 0.3s ease;
}

body.body--light .drawer-footer {
  background: rgba(249, 250, 251, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

body.body--dark .drawer-footer {
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  border-radius: 12px;
  margin: 2px 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: transparent;
    transition: background 0.2s ease;
  }

  .q-item__section--avatar {
    min-width: 40px;
    justify-content: center;
  }

  .q-icon {
    transition: all 0.2s ease;
  }

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    transform: translateX(2px);

    .q-icon {
      color: #4f46e5;
      transform: scale(1.1);
    }
  }
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(79, 70, 229, 0.06) 100%);
  color: #4f46e5;
  font-weight: 600;

  &:before {
    background: #4f46e5;
  }

  .q-icon {
    color: #4f46e5;
  }

  .q-item__label {
    color: #4f46e5;
    font-weight: 600;
  }

  .q-item__label--caption {
    color: rgba(79, 70, 229, 0.7);
  }
}

// Responsive adjustments
@media (max-width: 1023px) {
  .app-drawer {
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
  }
}

// Smooth scrollbar
.drawer-scroll :deep(.q-scrollarea__thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: 6px;
}

.drawer-scroll :deep(.q-scrollarea__bar) {
  opacity: 0.3;
  transition: opacity 0.3s;
}

.drawer-scroll:hover :deep(.q-scrollarea__bar) {
  opacity: 1;
}
</style>
