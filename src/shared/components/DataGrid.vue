<template>
  <div class="data-grid">
    <!-- Header con controles -->
    <div
      v-if="showHeader"
      class="grid-header q-mb-md"
    >
      <div class="row items-center justify-between">
        <div class="col-auto">
          <slot name="header-left" />
        </div>
        <div class="col-auto row items-center q-gutter-sm">
          <slot name="header-right" />
          <q-select
            v-if="showColumnsSelector"
            v-model="localColumns"
            :options="columnsOptions"
            dense
            outlined
            style="min-width: 120px;"
            label="Columnas"
          />
        </div>
      </div>
    </div>

    <!-- Grid de cards -->
    <div
      v-if="loading"
      class="grid-loading"
    >
      <div
        v-for="i in skeletonCount"
        :key="i"
        class="grid-item-skeleton"
      >
        <q-card>
          <q-skeleton
            height="200px"
            square
          />
          <q-card-section>
            <q-skeleton
              type="text"
              class="q-mb-xs"
            />
            <q-skeleton
              type="text"
              width="60%"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div
      v-else-if="items.length === 0"
      class="grid-empty"
    >
      <slot name="empty">
        <EmptyState
          :icon="emptyIcon"
          :title="emptyTitle"
          :message="emptyMessage"
        />
      </slot>
    </div>

    <div
      v-else
      class="grid-container"
      :class="`grid-cols-${localColumns}`"
    >
      <div
        v-for="(item, index) in paginatedItems"
        :key="getItemKey(item, index)"
        class="grid-item"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        >
          <q-card
            class="grid-card"
            @click="handleItemClick(item, index)"
          >
            <q-card-section>
              <div class="text-h6">
                {{ getItemLabel(item) }}
              </div>
            </q-card-section>
          </q-card>
        </slot>
      </div>
    </div>

    <!-- Paginación -->
    <div
      v-if="showPagination && totalPages > 1"
      class="grid-pagination q-mt-md"
    >
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="maxPaginationPages"
        :direction-links="directionLinks"
        :boundary-links="boundaryLinks"
        :ellipses="ellipses"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import EmptyState from './EmptyState.vue';

interface Props {
  items: unknown[];
  columns?: number;
  itemsPerPage?: number;
  loading?: boolean;
  showHeader?: boolean;
  showColumnsSelector?: boolean;
  showPagination?: boolean;
  columnsOptions?: number[];
  maxPaginationPages?: number;
  directionLinks?: boolean;
  boundaryLinks?: boolean;
  ellipses?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  getItemKey?: (item: unknown, index: number) => string | number;
  getItemLabel?: (item: unknown) => string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  itemsPerPage: 12,
  loading: false,
  showHeader: true,
  showColumnsSelector: true,
  showPagination: true,
  columnsOptions: () => [2, 3, 4, 6],
  maxPaginationPages: 7,
  directionLinks: true,
  boundaryLinks: false,
  ellipses: true,
  emptyIcon: 'inbox',
  emptyTitle: 'No hay elementos',
  emptyMessage: 'No se encontraron elementos para mostrar.',
  getItemKey: (item: unknown, index: number) => {
    const obj = item as Record<string, unknown>;
    return (obj.id as string | number) || (obj.key as string | number) || index;
  },
  getItemLabel: (item: unknown) => {
    const obj = item as Record<string, unknown>;
    return (obj.label as string) || (obj.title as string) || (obj.name as string) || String(item);
  },
});

const emit = defineEmits<{
  'item-click': [item: unknown, index: number];
  'page-change': [page: number];
}>();

const localColumns = ref(props.columns);
const currentPage = ref(1);

const skeletonCount = computed(() => {
  return Math.min(props.itemsPerPage, 6);
});

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage);
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.items.slice(start, end);
});

function handleItemClick(item: unknown, index: number) {
  emit('item-click', item, index);
}

function handlePageChange(page: number) {
  currentPage.value = page;
  emit('page-change', page);
}
</script>

<style scoped lang="scss">
.data-grid {
  .grid-header {
    padding: 16px 0;
  }

  .grid-loading,
  .grid-container {
    display: grid;
    gap: 16px;

    &.grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &.grid-cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &.grid-cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }

    &.grid-cols-6 {
      grid-template-columns: repeat(6, 1fr);
    }

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr) !important;
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    @media (max-width: 480px) {
      grid-template-columns: repeat(1, 1fr) !important;
    }
  }

  .grid-item {
    .grid-card {
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .grid-empty {
    padding: 48px 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .grid-pagination {
    display: flex;
    justify-content: center;
  }
}
</style>

