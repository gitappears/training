<template>
  <div class="error-display">
    <q-banner
      :class="bannerClass"
      :dense="dense"
      :rounded="rounded"
    >
      <template #avatar>
        <q-icon
          :name="icon"
          :color="iconColor"
          :size="iconSize"
        />
      </template>

      <div class="error-content">
        <div
          v-if="title"
          class="error-title text-subtitle1 q-mb-xs"
        >
          {{ title }}
        </div>
        <div class="error-message text-body2">
          {{ message }}
        </div>
        <div
          v-if="details"
          class="error-details text-caption q-mt-sm text-grey-7"
        >
          {{ details }}
        </div>
      </div>

      <template
        v-if="showActions"
        #action
      >
        <q-btn
          v-if="allowRetry"
          flat
          dense
          :label="retryLabel"
          :color="retryColor"
          @click="handleRetry"
        />
        <q-btn
          v-if="allowDismiss"
          flat
          dense
          :label="dismissLabel"
          :color="dismissColor"
          @click="handleDismiss"
        />
      </template>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  message: string;
  title?: string;
  details?: string;
  type?: 'error' | 'warning' | 'info';
  dense?: boolean;
  rounded?: boolean;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  showActions?: boolean;
  allowRetry?: boolean;
  allowDismiss?: boolean;
  retryLabel?: string;
  dismissLabel?: string;
  retryColor?: string;
  dismissColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  dense: false,
  rounded: true,
  icon: 'error_outline',
  iconColor: 'negative',
  iconSize: '32px',
  showActions: true,
  allowRetry: false,
  allowDismiss: true,
  retryLabel: 'Reintentar',
  dismissLabel: 'Cerrar',
  retryColor: 'primary',
  dismissColor: 'grey-7',
});

const emit = defineEmits<{
  retry: [];
  dismiss: [];
}>();

const bannerClass = computed(() => {
  const classes = ['error-banner'];
  if (props.type === 'error') classes.push('bg-negative');
  else if (props.type === 'warning') classes.push('bg-warning');
  else if (props.type === 'info') classes.push('bg-info');
  return classes.join(' ');
});

function handleRetry() {
  emit('retry');
}

function handleDismiss() {
  emit('dismiss');
}
</script>

<style scoped lang="scss">
.error-display {
  .error-banner {
    &.bg-negative {
      background-color: rgba(244, 67, 54, 0.1);
      color: #c62828;
    }

    &.bg-warning {
      background-color: rgba(255, 152, 0, 0.1);
      color: #e65100;
    }

    &.bg-info {
      background-color: rgba(33, 150, 243, 0.1);
      color: #0277bd;
    }
  }

  .error-content {
    .error-title {
      font-weight: 600;
    }

    .error-message {
      line-height: 1.5;
    }

    .error-details {
      line-height: 1.4;
    }
  }
}

.body--dark {
  .error-display {
    .error-banner {
      &.bg-negative {
        background-color: rgba(244, 67, 54, 0.2);
        color: #ef5350;
      }

      &.bg-warning {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ffb74d;
      }

      &.bg-info {
        background-color: rgba(33, 150, 243, 0.2);
        color: #64b5f6;
      }
    }
  }
}
</style>

