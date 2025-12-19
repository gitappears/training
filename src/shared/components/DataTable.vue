<template>
  <q-table
    :rows="rows"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    :rows-per-page-options="rowsPerPageOptions"
    row-key="id"
    flat
    :separator="separator"
    :dense="dense"
    :grid="grid"
    :filter="filter"
    @request="onRequest"
  >
    <template #top>
      <div class="row items-center justify-between full-width q-mb-md">
        <div class="col-auto">
          <slot name="top-left" />
        </div>
        <div class="col-auto row items-center q-gutter-sm">
          <slot name="top-right" />
          <q-input
            v-if="searchable"
            v-model="searchQuery"
            outlined
            dense
            :placeholder="searchPlaceholder"
            clearable
            class="search-input"
            @update:model-value="onSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            v-if="exportable"
            flat
            dense
            icon="download"
            color="primary"
            @click="handleExport"
          >
            <q-tooltip>Exportar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>

    <template #body="props">
      <slot name="body" :props="props" />
    </template>

    <template #no-data>
      <slot name="no-data">
        <div class="full-width row justify-center items-center q-pa-xl">
          <q-icon name="inbox" size="64px" color="grey-4" />
          <div class="text-body1 text-grey-6 q-ml-md">No hay datos disponibles</div>
        </div>
      </slot>
    </template>

    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { QTableColumn, QTableProps } from 'quasar';

interface Props {
  rows: unknown[];
  columns: QTableColumn[];
  loading?: boolean;
  pagination?: QTableProps['pagination'];
  rowsPerPageOptions?: number[];
  separator?: 'horizontal' | 'vertical' | 'cell' | 'none';
  dense?: boolean;
  grid?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  filter?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowsPerPageOptions: () => [10, 25, 50, 100],
  separator: 'horizontal',
  dense: false,
  grid: false,
  searchable: true,
  searchPlaceholder: 'Buscar...',
  exportable: false,
  filter: '',
});

const emit = defineEmits<{
  request: [props: { pagination: QTableProps['pagination']; filter?: string }];
  export: [];
}>();

const searchQuery = ref('');

function onRequest(requestProps: { pagination: QTableProps['pagination']; filter?: string }) {
  emit('request', requestProps);
}

function onSearch(value: string | number | null) {
  emit('request', {
    pagination: props.pagination,
    filter: value ? String(value) : '',
  });
}

function handleExport() {
  emit('export');
}
</script>

<style scoped lang="scss">
.search-input {
  min-width: 250px;
}

@media (max-width: 600px) {
  .search-input {
    min-width: 100%;
  }
}
</style>

