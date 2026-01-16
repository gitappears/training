/**
 * Utilidades para mapear valores booleanos a números (1/0) y viceversa
 * Útil para trabajar con backends que usan números en lugar de booleanos
 */

/**
 * Convierte un valor booleano a número (true -> 1, false -> 0)
 * @param value - Valor booleano a convertir
 * @returns 1 si es true, 0 si es false, undefined si el valor es undefined
 */
export function booleanToNumber(value: boolean | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? 1 : 0;
}

/**
 * Convierte un número a valor booleano (1 -> true, 0 -> false)
 * @param value - Valor numérico a convertir (1 o 0)
 * @returns true si es 1, false si es 0, undefined si el valor es undefined o null
 */
export function numberToBoolean(value: number | boolean | undefined | null): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  // Si ya es boolean, retornarlo directamente
  if (typeof value === 'boolean') {
    return value;
  }
  // Si es número, convertir
  return value === 1;
}

/**
 * Crea un objeto con getter y setter para mapear automáticamente entre boolean y number
 * Útil para usar con v-model en componentes Vue
 * @param refValue - Ref que contiene el valor numérico del backend
 * @returns Objeto con propiedades value (getter/setter) para usar con v-model
 */
export function useBooleanNumberMapper<T extends { value: number | boolean | undefined | null }>(
  refValue: T,
) {
  return {
    get value(): boolean | undefined {
      return numberToBoolean(refValue.value);
    },
    set value(newValue: boolean | undefined) {
      refValue.value = booleanToNumber(newValue) as T['value'];
    },
  };
}
