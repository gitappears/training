<template>
  <q-card
    :flat="flat"
    :bordered="bordered"
    class="chart-card"
  >
    <q-card-section
      v-if="title || $slots.header"
      class="chart-header"
    >
      <div
        v-if="title"
        class="row items-center justify-between"
      >
        <div class="row items-center">
          <q-icon
            v-if="icon"
            :name="icon"
            :color="iconColor"
            :size="iconSize"
            class="q-mr-sm"
          />
          <div class="text-h6">
            {{ title }}
          </div>
        </div>
        <slot name="header-actions" />
      </div>
      <slot name="header" />
    </q-card-section>

    <q-separator v-if="title || $slots.header" />

    <q-card-section class="chart-content">
      <div
        ref="chartContainer"
        class="chart-container"
        :style="{ height: `${height}px`, minHeight: `${minHeight}px` }"
      >
        <slot>
          <div
            v-if="loading"
            class="chart-loading"
          >
            <q-spinner
              color="primary"
              size="3em"
            />
          </div>
          <div
            v-else-if="error"
            class="chart-error"
          >
            <q-icon
              name="error_outline"
              size="48px"
              color="negative"
            />
            <div class="text-body2 text-negative q-mt-sm">
              {{ errorMessage }}
            </div>
          </div>
          <div
            v-else-if="!hasChartData"
            class="chart-empty"
          >
            <q-icon
              name="bar_chart"
              size="48px"
              color="grey-5"
            />
            <div class="text-body2 text-grey-7 q-mt-sm">
              No hay datos para mostrar
            </div>
          </div>
        </slot>
      </div>
    </q-card-section>

    <q-card-section
      v-if="$slots.footer"
      class="chart-footer"
    >
      <slot name="footer" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  height?: number;
  minHeight?: number;
  flat?: boolean;
  bordered?: boolean;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  hasChartData?: boolean;
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconSize: '24px',
  height: 300,
  minHeight: 200,
  flat: false,
  bordered: true,
  loading: false,
  error: false,
  errorMessage: 'Error al cargar el gráfico',
  hasChartData: true,
});

const chartContainer = ref<HTMLElement | null>(null);
</script>

<style scoped lang="scss">
.chart-card {
  .chart-header {
    padding: 16px 20px;
  }

  .chart-content {
    padding: 20px;
  }

  .chart-container {
    position: relative;
    width: 100%;

    .chart-loading,
    .chart-error,
    .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
    }
  }

  .chart-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
}

.body--dark {
  .chart-card {
    .chart-footer {
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}
</style>

