<template>
  <q-breadcrumbs
    :separator="separator"
    :active-color="activeColor"
    class="custom-breadcrumbs"
  >
    <q-breadcrumbs-el
      v-for="(item, index) in items"
      :key="index"
      :label="item.label"
      :icon="item.icon"
      :to="item.to"
      :clickable="item.clickable !== false"
      @click="handleClick(item, index)"
    />
  </q-breadcrumbs>
</template>

<script lang="ts">
export default {
  name: 'CustomBreadcrumbs',
};
</script>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string;
  icon?: string;
  to?: string | { name?: string; path?: string; params?: Record<string, unknown>; query?: Record<string, unknown> };
  clickable?: boolean;
  action?: () => void;
}

interface Props {
  items: BreadcrumbItem[];
  separator?: string;
  activeColor?: string;
}

withDefaults(defineProps<Props>(), {
  separator: '/',
  activeColor: 'primary',
});

const emit = defineEmits<{
  click: [item: BreadcrumbItem, index: number];
}>();

function handleClick(item: BreadcrumbItem, index: number) {
  if (item.action) {
    item.action();
  }
  emit('click', item, index);
}
</script>

<style scoped lang="scss">
.custom-breadcrumbs {
  padding: 8px 0;
}
</style>

