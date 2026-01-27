<template>
  <div
    v-if="totalPages > 1"
    class="row justify-center q-mt-lg"
  >
    <div class="column items-center q-gutter-sm">
      <q-pagination
        :model-value="currentPage"
        :max="totalPages"
        :max-pages="7"
        direction-links
        boundary-links
        color="primary"
        @update:model-value="$emit('change-page', $event)"
      />
      <div class="text-caption text-grey-7">
        {{ paginationText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}>();

defineEmits<{
  'change-page': [page: number];
}>();

const paginationText = computed(() => {
  if (!props.total || props.total === 0) return '';
  const from = (props.currentPage - 1) * props.limit + 1;
  const to = Math.min(props.currentPage * props.limit, props.total);
  return `${from}-${to} de ${props.total}`;
});
</script>
