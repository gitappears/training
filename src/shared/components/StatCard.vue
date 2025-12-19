<template>
  <q-card
    :flat="flat"
    :bordered="bordered"
    :class="cardClass"
    class="stat-card"
  >
    <q-card-section class="stat-card-content">
      <div class="row items-center no-wrap">
        <!-- Icono -->
        <div
          v-if="icon"
          class="stat-icon-container"
          :style="{ backgroundColor: iconBgColor }"
        >
          <q-icon
            :name="icon"
            :color="iconColor"
            :size="iconSize"
          />
        </div>

        <!-- Contenido -->
        <div class="col stat-info">
          <div
            v-if="label"
            class="stat-label text-caption text-grey-7"
          >
            {{ label }}
          </div>
          <div
            class="stat-value"
            :class="valueClass"
          >
            {{ formattedValue }}
          </div>
          <div
            v-if="subtitle"
            class="stat-subtitle text-caption text-grey-6 q-mt-xs"
          >
            {{ subtitle }}
          </div>
        </div>

        <!-- Acción opcional -->
        <div
          v-if="$slots.action"
          class="stat-action"
        >
          <slot name="action" />
        </div>
      </div>

      <!-- Trend indicator -->
      <div
        v-if="showTrend && trend !== undefined"
        class="stat-trend q-mt-sm"
      >
        <q-icon
          :name="trendIcon"
          :color="trendColor"
          size="16px"
        />
        <span
          class="text-caption q-ml-xs"
          :class="`text-${trendColor}`"
        >
          {{ trendText }}
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: string | number;
  label?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  iconBgColor?: string;
  valueSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  flat?: boolean;
  bordered?: boolean;
  showTrend?: boolean;
  trend?: number; // Porcentaje de cambio (positivo o negativo)
  formatValue?: ((val: string | number) => string) | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconSize: '32px',
  iconBgColor: 'rgba(25, 118, 210, 0.1)',
  valueSize: 'lg',
  flat: false,
  bordered: true,
  showTrend: false,
});

const cardClass = computed(() => {
  return {
    'stat-card-hover': true,
  };
});

const valueClass = computed(() => {
  const sizeMap = {
    xs: 'text-h6',
    sm: 'text-h5',
    md: 'text-h4',
    lg: 'text-h3',
    xl: 'text-h2',
  };
  return sizeMap[props.valueSize];
});

const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.value);
  }
  return props.value;
});

const trendIcon = computed(() => {
  if (props.trend === undefined) return '';
  return props.trend >= 0 ? 'trending_up' : 'trending_down';
});

const trendColor = computed(() => {
  if (props.trend === undefined) return 'grey';
  return props.trend >= 0 ? 'positive' : 'negative';
});

const trendText = computed(() => {
  if (props.trend === undefined) return '';
  const sign = props.trend >= 0 ? '+' : '';
  return `${sign}${props.trend.toFixed(1)}%`;
});
</script>

<style scoped lang="scss">
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &.stat-card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-card-content {
    padding: 20px;
  }

  .stat-icon-container {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .stat-info {
    min-width: 0; // Permite que el texto se trunque
  }

  .stat-label {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .stat-value {
    font-weight: 700;
    line-height: 1.2;
    color: var(--q-primary);
  }

  .stat-subtitle {
    line-height: 1.4;
  }

  .stat-trend {
    display: flex;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .stat-action {
    margin-left: auto;
    flex-shrink: 0;
  }
}

.body--dark {
  .stat-card {
    .stat-trend {
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}
</style>

