<template>
  <q-card
    :flat="flat"
    :bordered="bordered"
    class="info-card"
  >
    <q-card-section
      v-if="title || $slots.header"
      class="info-card-header"
    >
      <div
        v-if="title"
        class="row items-center"
      >
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
      <slot name="header" />
    </q-card-section>

    <q-separator v-if="title || $slots.header" />

    <q-card-section class="info-card-content">
      <slot>
        <div
          v-if="content"
          class="text-body2"
        >
          {{ content }}
        </div>
      </slot>
    </q-card-section>

    <q-card-actions
      v-if="$slots.actions"
      class="info-card-actions"
    >
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  content?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  flat?: boolean;
  bordered?: boolean;
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconSize: '24px',
  flat: false,
  bordered: true,
});
</script>

<style scoped lang="scss">
.info-card {
  .info-card-header {
    padding: 16px 20px;
  }

  .info-card-content {
    padding: 20px;
  }

  .info-card-actions {
    padding: 12px 20px;
  }
}
</style>

