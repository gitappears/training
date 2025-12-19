<template>
  <q-input
    :model-value="modelValue"
    :placeholder="placeholder"
    :debounce="debounce"
    :clearable="clearable"
    :dense="dense"
    :outlined="outlined"
    :filled="filled"
    :disable="disable"
    :loading="loading"
    class="search-bar"
    @update:model-value="handleUpdate"
    @keyup.enter="handleSearch"
  >
    <template #prepend>
      <q-icon name="search" />
    </template>
    <template #append>
      <q-icon
        v-if="modelValue && clearable"
        name="close"
        class="cursor-pointer"
        @click="handleClear"
      />
      <q-btn
        v-if="showSearchButton"
        flat
        dense
        icon="search"
        :loading="loading"
        @click="handleSearch"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  debounce?: number;
  clearable?: boolean;
  dense?: boolean;
  outlined?: boolean;
  filled?: boolean;
  disable?: boolean;
  loading?: boolean;
  showSearchButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
  debounce: 300,
  clearable: true,
  dense: false,
  outlined: true,
  filled: false,
  disable: false,
  loading: false,
  showSearchButton: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  search: [value: string];
  clear: [];
}>();

function handleUpdate(value: string | number | null) {
  emit('update:modelValue', value ? String(value) : '');
}

function handleSearch() {
  emit('search', props.modelValue);
}

function handleClear() {
  emit('update:modelValue', '');
  emit('clear');
}
</script>

<style scoped lang="scss">
.search-bar {
  width: 100%;
}
</style>

