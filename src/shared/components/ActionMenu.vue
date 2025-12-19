<template>
  <q-btn
    :icon="triggerIcon"
    :label="triggerLabel"
    :flat="flat"
    :round="round"
    :unelevated="unelevated"
    :outline="outline"
    :color="color"
    :size="size"
    :dense="dense"
    :disable="disable"
  >
    <q-menu
      :anchor="anchor"
      :self="self"
      :offset="computedOffset"
      :fit="fit"
      :cover="cover"
      :max-height="maxHeight"
      :max-width="maxWidth"
    >
      <q-list
        :dense="menuDense"
        class="action-menu-list"
      >
        <q-item
          v-for="(action, index) in actions"
          :key="index"
          v-close-popup="action.closeOnClick !== false"
          :clickable="!action.disable"
          :disable="action.disable"
          class="action-menu-item"
          @click="handleAction(action, index)"
        >
          <q-item-section
            v-if="action.icon"
            avatar
          >
            <q-icon
              :name="action.icon"
              :color="action.iconColor || action.color"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ action.label }}</q-item-label>
            <q-item-label
              v-if="action.caption"
              caption
            >
              {{ action.caption }}
            </q-item-label>
          </q-item-section>
          <q-item-section
            v-if="action.sublabel"
            side
          >
            <q-item-label
              side
              class="text-grey-7"
            >
              {{ action.sublabel }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <template
          v-for="(action, index) in actions.filter((a) => a.separator)"
          :key="`sep-${index}`"
        >
          <q-separator />
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ActionMenuItem {
  label: string;
  icon?: string;
  iconColor?: string;
  color?: string;
  caption?: string;
  sublabel?: string;
  disable?: boolean;
  separator?: boolean;
  closeOnClick?: boolean;
  action?: () => void;
}

interface Props {
  actions: ActionMenuItem[];
  triggerIcon?: string;
  triggerLabel?: string;
  flat?: boolean;
  round?: boolean;
  unelevated?: boolean;
  outline?: boolean;
  color?: string;
  size?: string;
  dense?: boolean;
  disable?: boolean;
  anchor?: 'top left' | 'top middle' | 'top right' | 'center left' | 'center middle' | 'center right' | 'bottom left' | 'bottom middle' | 'bottom right';
  self?: 'top left' | 'top middle' | 'top right' | 'center left' | 'center middle' | 'center right' | 'bottom left' | 'bottom middle' | 'bottom right';
  offset?: [number, number] | ((props: Record<string, unknown>) => [number, number]);
  fit?: boolean;
  cover?: boolean;
  maxHeight?: string;
  maxWidth?: string;
  menuDense?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  triggerIcon: 'more_vert',
  flat: true,
  round: false,
  unelevated: false,
  outline: false,
  color: 'primary',
  size: 'md',
  dense: false,
  disable: false,
  anchor: 'bottom right',
  self: 'top right',
  offset: () => [0, 8] as [number, number],
  fit: true,
  cover: false,
  menuDense: false,
});

const emit = defineEmits<{
  action: [action: ActionMenuItem, index: number];
}>();

const computedOffset = computed(() => {
  const offsetValue = props.offset;
  if (offsetValue && typeof offsetValue === 'function') {
    return offsetValue({});
  }
  return offsetValue || [0, 8];
});

function handleAction(action: ActionMenuItem, index: number) {
  if (action.disable) return;
  if (action.action) {
    action.action();
  }
  emit('action', action, index);
}
</script>

<style scoped lang="scss">
.action-menu-list {
  min-width: 200px;

  .action-menu-item {
    transition: background-color 0.2s;

    &:hover:not(.q-item--disabled) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.body--dark {
  .action-menu-list {
    .action-menu-item {
      &:hover:not(.q-item--disabled) {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>

