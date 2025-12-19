<template>
  <q-card flat bordered class="filters-panel">
    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-icon name="filter_list" size="20px" color="primary" />
          <div class="text-subtitle2 text-weight-medium">Filtros</div>
          <q-badge v-if="activeFiltersCount > 0" color="primary" :label="activeFiltersCount" />
        </div>
        <q-btn
          v-if="activeFiltersCount > 0"
          flat
          dense
          size="sm"
          label="Limpiar"
          color="primary"
          icon="clear_all"
          @click="clearFilters"
        />
      </div>

      <div class="row q-col-gutter-md">
        <slot />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  activeFiltersCount?: number;
}

withDefaults(defineProps<Props>(), {
  activeFiltersCount: 0,
});

const emit = defineEmits<{
  clear: [];
}>();

function clearFilters() {
  emit('clear');
}
</script>

<style scoped lang="scss">
.filters-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease;
}

body.body--dark .filters-panel {
  background: rgba(30, 27, 75, 0.8);
}
</style>

