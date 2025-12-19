<template>
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

    <div class="success-content">
      <div
        v-if="title"
        class="success-title text-subtitle1 q-mb-xs"
      >
        {{ title }}
      </div>
      <div class="success-message text-body2">
        {{ message }}
      </div>
    </div>

    <template
      v-if="showActions"
      #action
    >
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
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  message: string;
  title?: string;
  dense?: boolean;
  rounded?: boolean;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  showActions?: boolean;
  allowDismiss?: boolean;
  dismissLabel?: string;
  dismissColor?: string;
}

withDefaults(defineProps<Props>(), {
  dense: false,
  rounded: true,
  icon: 'check_circle',
  iconColor: 'positive',
  iconSize: '32px',
  showActions: true,
  allowDismiss: true,
  dismissLabel: 'Cerrar',
  dismissColor: 'grey-7',
});

const emit = defineEmits<{
  dismiss: [];
}>();

const bannerClass = computed(() => {
  return 'success-banner bg-positive';
});

function handleDismiss() {
  emit('dismiss');
}
</script>

<style scoped lang="scss">
.success-banner {
  background-color: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.success-content {
  .success-title {
    font-weight: 600;
  }

  .success-message {
    line-height: 1.5;
  }
}

.body--dark {
  .success-banner {
    background-color: rgba(76, 175, 80, 0.2);
    color: #66bb6a;
  }
}
</style>

