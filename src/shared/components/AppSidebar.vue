<template>
  <q-drawer
    :model-value="modelValue"
    show-if-above
    side="left"
    :width="280"
    :breakpoint="1024"
    bordered
    class="app-drawer"
    :mini="localMiniState"
    @update:model-value="emit('update:modelValue', $event)"
    @mouseover="localMiniState = false"
    @mouseout="localMiniState = false"
  >
    <!-- Logo Section -->
    <div class="drawer-header q-pa-lg">
      <div class="row items-center no-wrap cursor-pointer" @click="$router.push('/')">
        <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm cursor-pointer">
          <span class="text-weight-bold logo-letter">TD</span>
        </q-avatar>
        <div v-if="!localMiniState" class="column col">
          <div class="text-body1 text-weight-bold logo-text">Formar 360</div>
          <div class="text-caption text-grey-6">Plataforma de capacitación</div>
        </div>
      </div>
    </div>

    <q-scroll-area class="fit">
      <q-list padding class="q-pa-md">
        <template v-for="(section, sectionIndex) in menuSections" :key="sectionIndex">
          <!-- Section Header -->
          <div
            v-if="section.title && !localMiniState && section.visible"
            class="text-uppercase text-caption text-grey-6 q-px-md q-py-md text-weight-bold section-header"
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
              class="nav-item"
              active-class="nav-item-active"
            >
              <q-item-section avatar class="q-mr-sm">
                <q-icon
                  :name="item.icon"
                  :size="item.iconSize || '20px'"
                  :class="`icon-${item.iconColor || 'default'}`"
                />
              </q-item-section>
              <q-item-section v-if="!localMiniState">
                <q-item-label class="text-weight-medium nav-label">{{ item.label }}</q-item-label>
                <q-item-label v-if="item.caption" caption class="text-grey-6 nav-caption">
                  {{ typeof item.caption === 'function' ? item.caption() : item.caption }}
                </q-item-label>
              </q-item-section>
              <q-tooltip
                v-if="localMiniState"
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
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

// Crear estado local reactivo para miniState
const localMiniState = ref(props.miniState);

// Sincronizar con cambios en la prop
watch(
  () => props.miniState,
  (newValue) => {
    localMiniState.value = newValue;
  },
  { immediate: true },
);

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
  caption?: string | (() => string);
  icon: string;
  iconColor?: 'blue' | 'orange' | 'purple' | 'teal' | 'light-blue' | 'green' | 'red' | 'default';
  iconSize?: string;
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
          iconColor: 'blue',
          to: '/',
          exact: true,
          visible: canViewDashboard.value,
        },
        {
          label: 'Cursos',
          caption: canManageTrainings.value ? 'Gestión de catálogo' : 'Ver capacitaciones',
          icon: 'school',
          iconColor: 'orange',
          to: '/trainings',
          visible: canViewTrainings.value,
        },
        {
          label: 'Usuarios',
          caption: 'Participantes y roles',
          icon: 'people',
          iconColor: 'purple',
          to: '/users',
          visible: canManageUsers.value,
        },
        {
          label: 'Evaluaciones',
          caption: 'Realizar evaluaciones',
          icon: 'quiz',
          iconColor: 'teal',
          to: '/evaluations',
          visible: canViewEvaluations.value,
        },
        {
          label: 'Certificados',
          caption: 'Mis certificados',
          icon: 'verified',
          iconColor: 'green',
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
          iconColor: 'light-blue',
          to: '/reports',
          visible: canViewReports.value,
        },
        {
          label: 'Alertas',
          caption: 'Configuración de vencimientos',
          icon: 'notifications_active',
          iconColor: 'orange',
          to: '/admin/alert-config',
          visible: canManageAlerts.value,
        },
        {
          label: 'Nuevo Conductor',
          caption: 'Registrar conductor externo',
          icon: 'person_add',
          iconColor: 'purple',
          to: '/people/external-drivers/new',
          visible: canCreateExternalDrivers.value,
        },
        {
          label: 'Pagos',
          caption: 'Registrar y habilitar',
          icon: 'payment',
          iconColor: 'red',
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

const userInitials = computed(() => {
  const persona = user.value?.persona;
  if (!persona) return 'U';
  const nombres = persona.nombres || '';
  const apellidos = persona.apellidos || '';
  const firstInitial = nombres.charAt(0).toUpperCase() || '';
  const secondInitial = apellidos.charAt(0).toUpperCase() || '';
  return `${firstInitial}${secondInitial}` || 'U';
});

function handleLogout() {
  logout();
  emit('logout');
}
</script>

<style lang="scss" scoped>
.app-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

body.body--light .app-drawer {
  background: #ffffff !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

body.body--dark .app-drawer {
  background: #1e1b4b !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}

body.body--light .drawer-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

body.body--dark .drawer-header {
  background: #1e1b4b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-letter {
  font-size: 16px;
  font-weight: 700;
}

.logo-text {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

body.body--dark .logo-text {
  color: #ffffff;
}

.drawer-scroll {
  height: calc(100vh - 180px);
}

.section-header {
  letter-spacing: 0.5px;
  font-size: 11px;
  margin-top: 8px;
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
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

body.body--dark .drawer-footer {
  background: #1e1b4b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

body.body--dark .user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  background: #7c3aed !important;
  color: white !important;
  font-size: 14px;
}

.nav-item {
  border-radius: 8px;
  margin: 2px 0;
  padding: 8px 12px;
  transition: all 0.2s ease;
  min-height: 40px;

  .q-item__section--avatar {
    min-width: 32px;
    justify-content: flex-start;
  }

  .nav-label {
    font-size: 14px;
    color: #475569;
  }

  .nav-caption {
    font-size: 12px;
    margin-top: 2px;
  }

  body.body--dark & .nav-label {
    color: #cbd5e1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.04);

    body.body--dark & {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.nav-item-active {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6;

  body.body--dark & {
    background: rgba(59, 130, 246, 0.2) !important;
    color: #60a5fa;
  }

  .nav-label {
    color: #3b82f6;
    font-weight: 600;

    body.body--dark & {
      color: #60a5fa;
    }
  }

  // Mantener el color del icono según su tipo cuando está activo
  .q-icon.icon-blue {
    color: #3b82f6 !important;
  }

  body.body--dark & .q-icon.icon-blue {
    color: #60a5fa !important;
  }
}

// Icon colors
.icon-blue {
  color: #3b82f6 !important;
}

.icon-orange {
  color: #f97316 !important;
}

.icon-purple {
  color: #7c3aed !important;
}

.icon-teal {
  color: #14b8a6 !important;
}

.icon-light-blue {
  color: #0ea5e9 !important;
}

.icon-green {
  color: #22c55e !important;
}

.icon-red {
  color: #ef4444 !important;
}

.icon-default {
  color: #64748b !important;
}

body.body--dark {
  .icon-blue {
    color: #60a5fa !important;
  }

  .icon-orange {
    color: #fb923c !important;
  }

  .icon-purple {
    color: #a78bfa !important;
  }

  .icon-teal {
    color: #2dd4bf !important;
  }

  .icon-light-blue {
    color: #38bdf8 !important;
  }

  .icon-green {
    color: #4ade80 !important;
  }

  .icon-red {
    color: #f87171 !important;
  }

  .icon-default {
    color: #94a3b8 !important;
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
