<template>
  <q-drawer
    :model-value="modelValue"
    show-if-above
    side="left"
    :width="280"
    :breakpoint="1024"
    bordered
    class="app-drawer"
    :mini="miniState"
    @update:model-value="emit('update:modelValue', $event)"
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
        <template v-for="(section, sectionIndex) in menuSections" :key="sectionIndex">
          <!-- Section Header -->
          <div
            v-if="section.title && !miniState && section.visible"
            class="text-uppercase text-caption text-grey-6 q-px-md q-py-sm text-weight-medium"
          >
            {{ section.title }}
          </div>

          <!-- Section Items -->
          <template v-for="(item, itemIndex) in section.items" :key="itemIndex">
            <q-item
              v-if="item.visible"
              v-ripple
              clickable
              :to="item.to"
              :exact="item.exact"
              class="nav-item q-my-xs"
              active-class="nav-item-active"
            >
              <q-item-section avatar class="q-mr-none">
                <q-icon :name="item.icon" size="22px" />
              </q-item-section>
              <q-item-section v-if="!miniState">
                <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
                <q-item-label caption class="text-grey-6">{{ item.caption }}</q-item-label>
              </q-item-section>
              <q-tooltip
                v-if="miniState"
                anchor="center right"
                self="center left"
                :offset="[10, 0]"
              >
                {{ item.label }}
              </q-tooltip>
            </q-item>
          </template>

          <!-- Section Separator -->
          <q-separator
            v-if="section.separator && section.visible && sectionIndex < menuSections.length - 1"
            class="q-my-md"
          />
        </template>
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
          <span class="text-body2 text-weight-medium">{{ userFullName || 'Usuario' }}</span>
          <span class="text-caption text-grey-6">{{ userEmail || 'Usuario' }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRole, useAuth } from '../composables';
import { api } from 'boot/axios';

interface Props {
  modelValue: boolean;
  miniState?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'logout'): void;
}

const props = withDefaults(defineProps<Props>(), {
  miniState: false,
});

const emit = defineEmits<Emits>();

const router = useRouter();
const { user, logout } = useAuth();
const {
  canViewDashboard,
  canViewTrainings,
  canManageTrainings,
  canManageUsers,
  canViewEvaluations,
  canViewCertificates,
  canViewReports,
  canManageAlerts,
  canCreateExternalDrivers,
  canManagePayments,
} = useRole();

interface MenuItem {
  label: string;
  caption: string | (() => string);
  icon: string;
  to: string;
  exact?: boolean;
  visible: boolean;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
  separator?: boolean;
  visible: boolean;
}

// Configuración del menú
const menuSections = computed<MenuSection[]>(() => {
  const sections: MenuSection[] = [
    {
      title: 'Menú Principal',
      separator: false,
      visible: true,
      items: [
        {
          label: 'Dashboard',
          caption: 'Resumen de capacitación',
          icon: 'dashboard',
          to: '/',
          exact: true,
          visible: canViewDashboard.value,
        },
        {
          label: 'Cursos',
          caption: canManageTrainings.value ? 'Gestión de catálogo' : 'Ver capacitaciones',
          icon: 'school',
          to: '/trainings',
          visible: canViewTrainings.value,
        },
        {
          label: 'Usuarios',
          caption: 'Participantes y roles',
          icon: 'people',
          to: '/users',
          visible: canManageUsers.value,
        },
        {
          label: 'Evaluaciones',
          caption: 'Realizar evaluaciones',
          icon: 'quiz',
          to: '/evaluations',
          visible: canViewEvaluations.value,
        },
        {
          label: 'Certificados',
          caption: 'Mis certificados',
          icon: 'verified',
          to: '/certificates',
          visible: canViewCertificates.value,
        },
      ],
    },
    {
      title: 'Administración',
      separator: true,
      visible:
        canViewReports.value ||
        canManageAlerts.value ||
        canCreateExternalDrivers.value ||
        canManagePayments.value,
      items: [
        {
          label: 'Reportes',
          caption: 'Desempeño y KPIs',
          icon: 'insights',
          to: '/reports',
          visible: canViewReports.value,
        },
        {
          label: 'Alertas',
          caption: 'Configuración de vencimientos',
          icon: 'notifications_active',
          to: '/admin/alert-config',
          visible: canManageAlerts.value,
        },
        {
          label: 'Nuevo Conductor',
          caption: 'Registrar conductor externo',
          icon: 'person_add',
          to: '/people/external-drivers/new',
          visible: canCreateExternalDrivers.value,
        },
        {
          label: 'Pagos',
          caption: 'Registrar y habilitar',
          icon: 'payment',
          to: '/payments',
          visible: canManagePayments.value,
        },
      ],
    },
  ];

  return sections;
});

const userImageUrl = computed(() => {
  const fotoUrl = user.value?.persona?.fotoUrl;
  if (!fotoUrl) {
    return `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.value?.username || 'default'}`;
  }
  if (fotoUrl.startsWith('http')) {
    return fotoUrl;
  }
  return `${api.defaults.baseURL}${fotoUrl}`;
});

const userFullName = computed(() => {
  const persona = user.value?.persona;
  if (!persona) return 'Usuario';
  const nombres = persona.nombres || '';
  const apellidos = persona.apellidos || '';
  return `${nombres} ${apellidos}`.trim() || 'Usuario';
});

const userEmail = computed(() => {
  return user.value?.persona?.email || '';
});

function handleLogout() {
  logout();
  emit('logout');
}
</script>

<style lang="scss" scoped>
.app-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
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
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
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
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
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
