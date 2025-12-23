import { ref, computed } from 'vue';

/**
 * Composable para manejar la visibilidad de contraseñas
 * Útil para campos de contraseña en formularios
 */
export function usePasswordVisibility() {
  const isVisible = ref(false);

  /**
   * Alterna la visibilidad de la contraseña
   */
  function toggle() {
    isVisible.value = !isVisible.value;
  }

  /**
   * Muestra la contraseña
   */
  function show() {
    isVisible.value = true;
  }

  /**
   * Oculta la contraseña
   */
  function hide() {
    isVisible.value = false;
  }

  /**
   * Obtiene el tipo de input apropiado
   */
  const inputType = computed(() => {
    return isVisible.value ? 'text' : 'password';
  });

  /**
   * Obtiene el icono apropiado
   */
  const icon = computed(() => {
    return isVisible.value ? 'visibility_off' : 'visibility';
  });

  return {
    isVisible,
    inputType,
    icon,
    toggle,
    show,
    hide,
  };
}

