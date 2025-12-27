import { ref, watch, computed, type Ref } from 'vue';
import { debounce } from 'quasar';

/**
 * Composable para crear valores con debounce
 * Útil para búsquedas y filtros que no deben ejecutarse en cada keystroke
 */
export function useDebounce<T>(source: Ref<T> | (() => T), delay: number = 500) {
  // Convertir función getter a ref si es necesario
  const sourceRef = typeof source === 'function' ? computed(source) : source;
  
  const debouncedValue = ref<T>(sourceRef.value) as Ref<T>;

  const debouncedUpdate = debounce((value: T) => {
    debouncedValue.value = value;
  }, delay);

  watch(
    sourceRef,
    (newValue) => {
      if (newValue !== undefined) {
        debouncedUpdate(newValue);
      }
    },
    { immediate: true }
  );

  return { debouncedValue };
}

