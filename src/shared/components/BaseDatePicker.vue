<template>
  <q-input
    :model-value="displayValue"
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
    :placeholder="placeholder"
    :mask="mask"
    @update:model-value="handleUpdate"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :model-value="modelValue"
            :mask="dateMask"
            :locale="locale"
            :calendar="calendar"
            :years-in-month-view="yearsInMonthView"
            :navigation-min-year-month="navigationMinYearMonth"
            :navigation-max-year-month="navigationMaxYearMonth"
            :min="min"
            :max="max"
            :default-year-month="defaultYearMonth"
            :first-day-of-week="firstDayOfWeek"
            :today-btn="todayBtn"
            :default-view="defaultView"
            :years-in-calendar-view="yearsInCalendarView"
            :events="events"
            :event-color="eventColor"
            @update:model-value="handleDateUpdate"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Cerrar"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disable?: boolean;
  readonly?: boolean;
  rules?: Array<(val: string) => boolean | string>;
  lazyRules?: boolean | 'ondemand';
  outlined?: boolean;
  filled?: boolean;
  dense?: boolean;
  clearable?: boolean;
  placeholder?: string;
  mask?: string;
  dateMask?: string;
  locale?: Record<string, unknown>;
  calendar?: 'gregorian' | 'persian';
  yearsInMonthView?: boolean;
  navigationMinYearMonth?: string;
  navigationMaxYearMonth?: string;
  min?: string;
  max?: string;
  defaultYearMonth?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  todayBtn?: boolean;
  defaultView?: 'Calendar' | 'Months' | 'Years';
  yearsInCalendarView?: boolean | number;
  events?: readonly unknown[] | ((date: string) => boolean);
  eventColor?: string | ((date: string) => string);
}

const props = withDefaults(defineProps<Props>(), {
  outlined: true,
  dense: false,
  lazyRules: 'ondemand',
  clearable: false,
  required: false,
  disable: false,
  readonly: false,
  dateMask: 'YYYY-MM-DD',
  mask: '####-##-##',
  firstDayOfWeek: 1,
  todayBtn: true,
  defaultView: 'Calendar',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  focus: [];
}>();

const hasError = computed(() => {
  return props.error || (props.errorMessage !== undefined && props.errorMessage !== '');
});

const displayValue = computed(() => {
  return props.modelValue || '';
});

function handleUpdate(value: string | number | null) {
  // Si se limpia el campo, emitir string vacío
  if (!value || value === null) {
    emit('update:modelValue', '');
    return;
  }
  emit('update:modelValue', String(value));
}

function handleDateUpdate(value: string) {
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

