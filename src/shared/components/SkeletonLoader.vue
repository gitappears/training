<template>
  <div class="skeleton-loader">
    <q-skeleton
      v-if="type === 'table'"
      type="rect"
      :width="width"
      :height="height"
      class="q-mb-sm"
      :animation="animation"
    />
    <q-skeleton
      v-else-if="type === 'card'"
      type="rect"
      :width="width"
      :height="height"
      class="rounded-borders"
      :animation="animation"
    />
    <q-skeleton
      v-else-if="type === 'text'"
      type="text"
      :width="width"
      :animation="animation"
    />
    <q-skeleton
      v-else-if="type === 'circle'"
      type="circle"
      :size="width"
      :animation="animation"
    />
    <div v-else class="skeleton-custom">
      <q-skeleton
        v-for="i in lines"
        :key="i"
        type="text"
        :width="i === lines ? '60%' : '100%'"
        class="q-mb-xs"
        :animation="animation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'table' | 'card' | 'text' | 'circle' | 'custom';
  width?: string;
  height?: string;
  lines?: number;
  animation?: 'wave' | 'pulse' | 'pulse-x' | 'pulse-y' | 'fade' | 'none';
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  width: '100%',
  height: '100px',
  lines: 3,
  animation: 'wave',
});
</script>

<style scoped lang="scss">
.skeleton-loader {
  width: 100%;
}

.skeleton-custom {
  width: 100%;
}
</style>

