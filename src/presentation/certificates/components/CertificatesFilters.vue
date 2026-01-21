<template>
  <FiltersPanel :active-filters-count="activeFiltersCount" @clear="$emit('clear-filters')" class="q-mb-lg">
    <div class="col-12 col-md-4">
      <q-input
        :model-value="searchInput"
        outlined
        dense
        placeholder="Buscar por curso, nombre, código..."
        clearable
        @update:model-value="(v) => $emit('update-search', v ?? '')"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="col-12 col-md-3">
      <q-select
        :model-value="courseId"
        outlined
        dense
        :options="courseOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        clearable
        placeholder="Curso"
        @update:model-value="(v) => $emit('update-course', v)"
      >
        <template #prepend>
          <q-icon name="school" />
        </template>
      </q-select>
    </div>
    <div class="col-12 col-md-3">
      <q-select
        :model-value="status"
        outlined
        dense
        :options="statusOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        clearable
        placeholder="Estado (válido, vencido, revocado)"
        @update:model-value="(v) => $emit('update-status', v)"
      >
        <template #prepend>
          <q-icon name="toggle_on" />
        </template>
      </q-select>
    </div>
    <div class="col-12 col-md-1">
      <q-btn
        flat
        dense
        icon="qr_code_scanner"
        color="primary"
        @click="$emit('open-qr-scanner')"
      >
        <q-tooltip>Escanear código QR</q-tooltip>
      </q-btn>
    </div>
  </FiltersPanel>
</template>

<script setup lang="ts">
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';
import type { CertificateStatus } from '../../../domain/certificate/models';

defineProps<{
  searchInput: string;
  courseId: string | null | undefined;
  status: CertificateStatus | null | undefined;
  courseOptions: { label: string; value: string }[];
  statusOptions: { label: string; value: string }[];
  activeFiltersCount: number;
}>();

defineEmits<{
  'update-search': [value: string];
  'update-course': [value: string | null];
  'update-status': [value: CertificateStatus | null];
  'clear-filters': [];
  'open-qr-scanner': [];
}>();
</script>
