import { ref, watch, type Ref } from 'vue';
import { debounce } from 'quasar';

/**
 * Composable para crear valores con debounce
 * Útil para búsquedas y filtros que no deben ejecutarse en cada keystroke
 */
export function useDebounce<T>(source: Ref<T>, delay: number = 500) {
  const debouncedValue = ref<T>(source.value) as Ref<T>;

  const debouncedUpdate = debounce((value: T) => {
    debouncedValue.value = value;
  }, delay);

  watch(
    source,
    (newValue) => {
      debouncedUpdate(newValue);
    },
    { immediate: true }
  );

  return debouncedValue;
}

