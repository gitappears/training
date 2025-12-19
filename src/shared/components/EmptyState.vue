<template>
  <div class="empty-state">
    <q-icon :name="icon" :size="iconSize" :color="iconColor" class="q-mb-md" />
    <div class="text-h6 text-weight-medium q-mb-sm" :class="titleClass">
      {{ title }}
    </div>
    <div v-if="description" class="text-body2 q-mb-lg" :class="descriptionClass">
      {{ description }}
    </div>
    <div v-if="$slots.actions" class="row justify-center q-gutter-sm">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
  iconSize?: string;
  iconColor?: string;
  title: string;
  description?: string;
  titleClass?: string;
  descriptionClass?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconSize: '80px',
  iconColor: 'grey-4',
  titleClass: 'text-grey-7',
  descriptionClass: 'text-grey-6',
});
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  min-height: 300px;
}
</style>

