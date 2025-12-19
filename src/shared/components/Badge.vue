<template>
  <q-badge
    :color="color"
    :text-color="textColor"
    :label="label"
    :outline="outline"
    :rounded="rounded"
    :transparent="transparent"
    :floating="floating"
    :multi-line="multiLine"
    :class="badgeClass"
  >
    <slot>
      {{ label }}
    </slot>
  </q-badge>
</template>

<script lang="ts">
export default {
  name: 'CustomBadge',
};
</script>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  color?: string;
  textColor?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  outline?: boolean;
  rounded?: boolean;
  transparent?: boolean;
  floating?: boolean;
  multiLine?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'default',
  outline: false,
  rounded: false,
  transparent: false,
  floating: false,
  multiLine: false,
  size: 'md',
});

const badgeClass = computed(() => {
  const classes = ['custom-badge'];
  if (props.variant !== 'default') {
    classes.push(`badge-${props.variant}`);
  }
  classes.push(`badge-size-${props.size}`);
  return classes.join(' ');
});

</script>

<style scoped lang="scss">
.custom-badge {
  &.badge-size-sm {
    font-size: 0.7rem;
    padding: 2px 6px;
  }

  &.badge-size-md {
    font-size: 0.75rem;
    padding: 4px 8px;
  }

  &.badge-size-lg {
    font-size: 0.875rem;
    padding: 6px 12px;
  }
}
</style>

