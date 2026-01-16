/**
 * Composable para manejar toggles que trabajan con valores numéricos (1/0) del backend
 * Convierte automáticamente entre boolean (frontend) y number (backend)
 * 
 * NOTA: El servicio HTTP ya maneja la conversión al recibir/enviar datos del backend.
 * Este composable es útil cuando necesitas trabajar directamente con valores numéricos
 * o cuando el servicio HTTP no maneja la conversión automáticamente.
 */

import { computed, type WritableComputedRef } from 'vue';
import { numberToBoolean } from '../utils/boolean-number-mapper';

/**
 * Crea un computed ref que mapea automáticamente entre boolean y number
 * Útil para toggles que trabajan con valores numéricos del backend
 * 
 * @param getter - Función getter que obtiene el valor (puede ser number, boolean, undefined o null)
 * @param setter - Función setter que actualiza el valor (acepta boolean)
 * @returns Computed ref con getter/setter que convierte automáticamente
 * 
 * @example
 * ```ts
 * const activoToggle = useBooleanNumberToggle(
 *   () => form.value.activo, // Puede ser 1, 0, true, false, undefined
 *   (value: boolean) => { form.value.activo = value; } // Siempre recibe boolean
 * );
 * ```
 */
export function useBooleanNumberToggle(
  getter: () => number | boolean | undefined | null,
  setter: (value: boolean) => void,
): WritableComputedRef<boolean> {
  return computed({
    get(): boolean {
      const value = getter();
      // Convertir número a boolean, o retornar el boolean directamente
      const booleanValue = numberToBoolean(value);
      // Si es undefined, retornar false por defecto para los toggles
      return booleanValue ?? false;
    },
    set(newValue: boolean): void {
      // El setter siempre recibe un boolean del toggle
      // El servicio HTTP se encargará de convertir a número al enviar
      setter(newValue);
    },
  });
}
