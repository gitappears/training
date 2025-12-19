<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    :hint="hint"
    :error="hasError"
    :error-message="errorMessage"
    :required="required"
    :disable="disable"
    :readonly="readonly"
    :rules="rules"
    :lazy-rules="lazyRules"
    :outlined="outlined"
    :filled="filled"
    :dense="dense"
    :clearable="clearable"
    :multiple="multiple"
    :use-input="useInput"
    :use-chips="useChips"
    :input-debounce="inputDebounce"
    :placeholder="placeholder"
    :option-label="optionLabel"
    :option-value="optionValue"
    :option-disable="optionDisable"
    :emit-value="emitValue"
    :map-options="mapOptions"
    :options-dense="optionsDense"
    :menu-anchor="menuAnchor"
    :menu-self="menuSelf"
    :popup-content-class="popupContentClass"
    @update:model-value="handleUpdate"
    @filter="handleFilter"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="$slots.selected" #selected>
      <slot name="selected" />
    </template>
    <template v-if="$slots.option" #option="scope">
      <slot name="option" v-bind="scope" />
    </template>
    <template v-if="'no-option' in $slots" #no-option>
      <slot name="no-option" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: unknown;
  options: readonly unknown[];
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disable?: boolean;
  readonly?: boolean;
  rules?: Array<(val: unknown) => boolean | string>;
  lazyRules?: boolean | 'ondemand';
  outlined?: boolean;
  filled?: boolean;
  dense?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  useInput?: boolean;
  useChips?: boolean;
  inputDebounce?: number;
  placeholder?: string;
  optionLabel?: string | ((option: unknown) => string);
  optionValue?: string | ((option: unknown) => unknown);
  optionDisable?: string | ((option: unknown) => boolean);
  emitValue?: boolean;
  mapOptions?: boolean;
  optionsDense?: boolean;
  menuAnchor?: 'top left' | 'top middle' | 'top right' | 'top start' | 'top end' | 'center left' | 'center middle' | 'center right' | 'center start' | 'center end' | 'bottom left' | 'bottom middle' | 'bottom right' | 'bottom start' | 'bottom end';
  menuSelf?: 'top left' | 'top middle' | 'top right' | 'top start' | 'top end' | 'center left' | 'center middle' | 'center right' | 'center start' | 'center end' | 'bottom left' | 'bottom middle' | 'bottom right' | 'bottom start' | 'bottom end';
  popupContentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  outlined: true,
  dense: false,
  lazyRules: 'ondemand',
  clearable: false,
  required: false,
  disable: false,
  readonly: false,
  multiple: false,
  useInput: false,
  useChips: false,
  inputDebounce: 300,
  emitValue: false,
  mapOptions: false,
  optionsDense: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
  filter: [value: string, update: (fn: () => void) => void];
  blur: [];
  focus: [];
}>();

const hasError = computed(() => {
  return props.error || (props.errorMessage !== undefined && props.errorMessage !== '');
});

function handleUpdate(value: unknown) {
  emit('update:modelValue', value);
}

function handleFilter(value: string, update: (fn: () => void) => void) {
  emit('filter', value, update);
}

function handleBlur() {
  emit('blur');
}

function handleFocus() {
  emit('focus');
}
</script>

<style scoped lang="scss">
// Estilos adicionales si son necesarios
</style>

