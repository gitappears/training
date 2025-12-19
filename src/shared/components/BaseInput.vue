<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    :hint="hint"
    :error="hasError"
    :error-message="errorMessage"
    :required="required"
    :disable="disable"
    :readonly="readonly"
    :type="type"
    :mask="mask"
    :rules="rules"
    :lazy-rules="lazyRules"
    :outlined="outlined"
    :filled="filled"
    :dense="dense"
    :clearable="clearable"
    :counter="counter"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :prefix="prefix"
    :suffix="suffix"
    :autofocus="autofocus"
    :autocomplete="autocomplete"
    @update:model-value="handleUpdate"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="$slots.before" #before>
      <slot name="before" />
    </template>
    <template v-if="$slots.after" #after>
      <slot name="after" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string | number | null | undefined;
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disable?: boolean;
  readonly?: boolean;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'textarea' | 'time' | 'date' | 'datetime-local' | 'file';
  mask?: string;
  rules?: Array<(val: string | number | null | undefined) => boolean | string>;
  lazyRules?: boolean | 'ondemand';
  outlined?: boolean;
  filled?: boolean;
  dense?: boolean;
  clearable?: boolean;
  counter?: boolean;
  maxlength?: number;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  autofocus?: boolean;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  outlined: true,
  dense: false,
  lazyRules: 'ondemand',
  clearable: false,
  required: false,
  disable: false,
  readonly: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | undefined];
  blur: [];
  focus: [];
}>();

const hasError = computed(() => {
  return props.error || (props.errorMessage !== undefined && props.errorMessage !== '');
});

function handleUpdate(value: string | number | null | undefined) {
  emit('update:modelValue', value);
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

