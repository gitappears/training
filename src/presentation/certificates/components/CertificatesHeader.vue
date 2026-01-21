<template>
  <div class="row items-center justify-between q-mb-xl">
    <div>
      <div class="text-h4 text-weight-bold text-primary q-mb-xs">Mis Certificados</div>
      <div class="text-body1 text-grey-7">
        Visualiza y descarga todos tus certificados de capacitación obtenidos
      </div>
    </div>
    <div class="row items-center q-gutter-sm">
      <q-btn
        flat
        dense
        :icon="viewMode === 'grid' ? 'view_list' : 'grid_view'"
        :label="viewMode === 'grid' ? 'Lista' : 'Grid'"
        color="primary"
        @click="$emit('toggle-view-mode')"
      />
      <q-btn
        v-if="selectedCount > 0"
        flat
        dense
        icon="download"
        color="primary"
        label="Descargar seleccionados"
        @click="$emit('bulk-download')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from '../../../shared/composables/useViewMode';

defineProps<{
  viewMode: ViewMode;
  selectedCount: number;
}>();

defineEmits<{
  'toggle-view-mode': [];
  'bulk-download': [];
}>();
</script>
