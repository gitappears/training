import { ref, Ref } from 'vue';
import { useQuasar } from 'quasar';

/**
 * Composable para manejar lógica común de formularios
 * Proporciona validaciones, manejo de errores y estados de carga
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const $q = useQuasar();
  const form = ref<T>({ ...initialValues } as T);
  const loading = ref(false);
  const errors = ref<Partial<Record<keyof T, string>>>({});

  /**
   * Resetea el formulario a sus valores iniciales
   */
  function resetForm() {
    form.value = { ...initialValues } as T;
    errors.value = {};
  }

  /**
   * Valida un campo específico
   */
  function validateField(field: keyof T, validator: (value: any) => string | true): boolean {
    const value = form.value[field];
    const result = validator(value);
    
    if (result === true) {
      delete errors.value[field];
      return true;
    }
    
    errors.value[field] = result;
    return false;
  }

  /**
   * Valida todos los campos del formulario
   */
  function validateForm(validators: Partial<Record<keyof T, (value: any) => string | true>>): boolean {
    let isValid = true;
    errors.value = {};

    for (const [field, validator] of Object.entries(validators)) {
      const fieldKey = field as keyof T;
      const result = validateField(fieldKey, validator);
      if (!result) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Valida que un email tenga formato válido
   */
  function validateEmail(email: string): string | true {
    if (!email) return 'El email es requerido';
    const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
    return emailPattern.test(email) || 'Por favor ingrese un correo válido';
  }

  /**
   * Valida que una contraseña cumpla con los requisitos mínimos
   */
  function validatePassword(password: string, minLength: number = 6): string | true {
    if (!password) return 'La contraseña es requerida';
    if (password.length < minLength) {
      return `La contraseña debe tener al menos ${minLength} caracteres`;
    }
    return true;
  }

  /**
   * Valida que dos contraseñas coincidan
   */
  function validatePasswordMatch(password: string, confirmPassword: string): string | true {
    if (!confirmPassword) return 'Debe confirmar la contraseña';
    return password === confirmPassword || 'Las contraseñas no coinciden';
  }

  /**
   * Valida que un campo sea requerido
   */
  function validateRequired(value: any, fieldName?: string): string | true {
    if (value === null || value === undefined || value === '') {
      return fieldName ? `${fieldName} es requerido` : 'Este campo es requerido';
    }
    return true;
  }

  /**
   * Valida que un campo numérico esté en un rango
   */
  function validateNumberRange(value: number, min?: number, max?: number): string | true {
    if (typeof value !== 'number') return 'Debe ser un número';
    if (min !== undefined && value < min) return `El valor debe ser mayor o igual a ${min}`;
    if (max !== undefined && value > max) return `El valor debe ser menor o igual a ${max}`;
    return true;
  }

  /**
   * Valida que un campo tenga una longitud mínima
   */
  function validateMinLength(value: string, minLength: number, fieldName?: string): string | true {
    if (!value) return fieldName ? `${fieldName} es requerido` : 'Este campo es requerido';
    if (value.length < minLength) {
      return fieldName 
        ? `${fieldName} debe tener al menos ${minLength} caracteres`
        : `Debe tener al menos ${minLength} caracteres`;
    }
    return true;
  }

  /**
   * Valida que un campo tenga una longitud máxima
   */
  function validateMaxLength(value: string, maxLength: number, fieldName?: string): string | true {
    if (value && value.length > maxLength) {
      return fieldName
        ? `${fieldName} no puede exceder ${maxLength} caracteres`
        : `No puede exceder ${maxLength} caracteres`;
    }
    return true;
  }

  /**
   * Valida que un campo sea un número
   */
  function validateNumeric(value: string): string | true {
    if (!value) return true; // Opcional
    return /^[0-9]+$/.test(value) || 'Solo se permiten números';
  }

  /**
   * Ejecuta una función async con manejo de loading y errores
   */
  async function submitForm<TResult = void>(
    submitFn: () => Promise<TResult>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: TResult) => void;
      onError?: (error: any) => void;
    }
  ): Promise<TResult | null> {
    loading.value = true;
    errors.value = {};
    
    try {
      const result = await submitFn();
      
      if (options?.successMessage) {
        $q.notify({
          type: 'positive',
          message: options.successMessage,
        });
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = options?.errorMessage || 
        (error instanceof Error ? error.message : 'Error al procesar la solicitud');
      
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    form,
    loading,
    errors,
    resetForm,
    validateField,
    validateForm,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateRequired,
    validateNumberRange,
    validateMinLength,
    validateMaxLength,
    validateNumeric,
    submitForm,
  };
}

