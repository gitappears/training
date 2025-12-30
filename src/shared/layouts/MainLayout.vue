<template>
  <!-- lhh lpR lFf -->
  <q-layout view="lHh Lpr lff">
    <!-- Header -->
    <q-header
      elevated
      :class="themeStore.isDark ? 'bg-dark text-white' : 'bg-white text-primary'"
      class="app-header"
    >
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
            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" class="q-mt-sm">
              <q-list style="min-width: 280px" class="q-pa-sm">
                <q-item class="q-pa-md">
                  <q-item-section avatar>
                    <q-avatar size="48px">
                      <img :src="userImageUrl" alt="User" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ userFullName }}</q-item-label>
                    <q-item-label caption class="text-grey-7 text-uppercase" style="font-size: 0.75rem;">{{ userRole }}</q-item-label>
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
    <AppSidebar v-model="leftDrawerOpen" :mini-state="miniState" @logout="handleLogout" />

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../../stores/theme.store';
import { useAuth } from '../composables';
import { api } from 'boot/axios';
import AppSidebar from '../components/AppSidebar.vue';

const router = useRouter();
const themeStore = useThemeStore();
const { logout, user } = useAuth();

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
  const u = user.value;
  if (!u) return 'Usuario';
  
  // Try persona object first
  if (u.persona) {
    const nombres = u.persona.nombres || '';
    const apellidos = u.persona.apellidos || '';
    if (nombres || apellidos) {
        return `${nombres} ${apellidos}`.trim();
    }
  }
  
  // Fallback to top level properties if they exist
  const nombres = (u as any).nombres || '';
  const apellidos = (u as any).apellidos || '';
  if (nombres || apellidos) {
    return `${nombres} ${apellidos}`.trim();
  }

  // Fallback to username
  if (u.username) return u.username;

  return 'Usuario';
});

const userRole = computed(() => {
  const roles = user.value?.roles;
  if (roles && roles.length > 0) {
    // Assuming roles is array of strings or objects with name
    // Adjust based on your Auth Store interface. 
    // Usually it's ['ADMIN'] or [{name: 'ADMIN'}]
    // Let's assume strings for now based on typical JWT
    const role = roles[0];
    return typeof role === 'string' ? role : (role as any).name || 'Usuario';
  }
  return 'Usuario';
});

const userEmail = computed(() => {
  return user.value?.persona?.email || user.value?.email || '';
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
  logout();
  void router.push('/auth/login');
}
</script>

<style lang="scss" scoped>
.app-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
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
</style>
