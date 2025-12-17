<template>
  <q-layout view="lhh lpR lFf">
    <q-header elevated class="q-px-lg bg-white text-primary app-header">
      <q-toolbar class="no-wrap app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center">
          <q-avatar size="28px" color="primary" text-color="white" class="q-mr-sm"> TD </q-avatar>
          <span class="text-weight-medium">Trainigns DO</span>
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <q-btn flat round dense icon="notifications" />
          <q-avatar size="32px">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="User" />
          </q-avatar>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" :width="260" class="app-drawer">
      <div class="column fit q-pa-md q-gutter-md">
        <!-- Logo plataforma -->
        <div class="row items-center q-mb-sm">
          <q-avatar size="34px" color="primary" text-color="white" class="q-mr-sm"> TD </q-avatar>
          <div class="column">
            <span class="text-body2 text-weight-medium">Trainigns DO</span>
            <span class="text-caption text-grey-6">Plataforma de capacitación</span>
          </div>
        </div>

        <div class="text-caption text-grey-5 q-mb-sm">MENÚ PRINCIPAL</div>

        <q-list padding class="q-mb-md">
          <q-item v-ripple clickable to="/" exact class="rounded-borders nav-item">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
              <q-item-label caption>Resumen de capacitación</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-ripple clickable class="rounded-borders nav-item">
            <q-item-section avatar>
              <q-icon name="school" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Cursos</q-item-label>
              <q-item-label caption>Gestión de catálogo</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-ripple clickable class="rounded-borders nav-item">
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Usuarios</q-item-label>
              <q-item-label caption>Participantes y roles</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-ripple clickable class="rounded-borders nav-item">
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Calendario</q-item-label>
              <q-item-label caption>Próximas sesiones</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator dark spaced />

        <div class="text-caption text-grey-5 q-mb-sm">MÉTRICAS</div>

        <q-list padding class="q-mb-md">
          <q-item v-ripple clickable class="rounded-borders nav-item">
            <q-item-section avatar>
              <q-icon name="insights" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Reportes</q-item-label>
              <q-item-label caption>Desempeño y KPIs</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator dark spaced />

        <div class="row items-center q-mt-sm">
          <q-avatar size="32px" class="q-mr-sm">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="User" />
          </q-avatar>
          <div class="column">
            <span class="text-body2">Admin</span>
            <span class="text-caption text-grey-5">Plataforma de capacitación</span>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const leftDrawerOpen = ref(true);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
