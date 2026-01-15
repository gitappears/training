import { ref, watch, computed } from 'vue';
import { useAuth, useForm, useFileUpload, useNotifications } from '../../../shared/composables';
import type { RegisterDto } from '../../../application/auth/auth.repository.port';
import { authService } from '../../../infrastructure/http/auth/auth.service';

/**
 * Composable para manejar el formulario de registro
 */
export function useRegisterForm() {
  const { register, loading } = useAuth();
  const { success, error: showError } = useNotifications();
  const { file: photoFile, handleFileSelect } = useFileUpload({
    accept: 'image/jpeg,image/png,image/jpg',
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const aceptaPoliticaDatos = ref(false);
  const aceptaTerminos = ref(false);
  const confirmPassword = ref('');
  const showPoliticaModal = ref(false);
  const showTerminosModal = ref(false);
  const fechaNacimiento = ref<string>('');

  const generos = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' },
  ];

  const tiposDocumento = [
    { label: 'Cédula de Ciudadanía', value: 'CC' },
    { label: 'Cédula de Extranjería', value: 'CE' },
    { label: 'Pasaporte', value: 'PA' },
    { label: 'NIT', value: 'NIT' },
  ];

  const initialForm: RegisterDto = {
    numeroDocumento: '',
    tipoDocumento: 'CC',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    fotoUrl: '',
    username: '',
    password: '',
    tipoRegistro: 'ALUMNO',
  };

  const {
    form,
    validateForm,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateRequired,
    validateNumeric,
    validateMinLength,
  } = useForm(initialForm);

  // Computed para verificar si el tipo de documento es NIT
  const isNIT = computed(() => form.value.tipoDocumento === 'NIT');

  // Watcher para asignar automáticamente el tipo de registro según el tipo de documento
  watch(
    () => form.value.tipoDocumento,
    (newValue) => {
      if (newValue === 'NIT') {
        // Si es NIT, asignar como CLIENTE (Cliente Institucional)
        form.value.tipoRegistro = 'CLIENTE';
      } else {
        // Para otros tipos de documento, asignar como ALUMNO
        form.value.tipoRegistro = 'ALUMNO';
      }
    },
    { immediate: true },
  );

  /**
   * Genera un username automático basado en el número de documento
   * Si no hay documento, genera uno aleatorio
   */
  function generateUsername(): string {
    if (form.value.numeroDocumento && form.value.numeroDocumento.trim()) {
      // Usar el número de documento como username
      return form.value.numeroDocumento.trim();
    }
    // Generar username aleatorio si no hay documento
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `user_${randomSuffix}`;
  }

  // Watcher para generar username automáticamente cuando cambia el número de documento
  watch(
    () => form.value.numeroDocumento,
    (newValue) => {
      if (newValue && newValue.trim()) {
        // Autoasignar el número de documento como username
        form.value.username = newValue.trim();
      } else if (!newValue || !newValue.trim()) {
        // Si se borra el documento, generar un username aleatorio
        const randomSuffix = Math.floor(Math.random() * 10000);
        form.value.username = `user_${randomSuffix}`;
      }
    },
  );

  function handleFileUpload(file: File | null) {
    if (file) {
      handleFileSelect(file);
      // La foto se subirá después del registro exitoso
      // Por ahora solo guardamos la referencia del archivo
    } else {
      handleFileSelect(null);
      form.value.fotoUrl = '';
    }
  }

  function verPoliticaDatos() {
    showPoliticaModal.value = true;
  }

  function verTerminos() {
    showTerminosModal.value = true;
  }

  function onPolicyAccepted() {
    success('Política aceptada correctamente');
  }

  async function handleSubmit() {
    // Validaciones de políticas
    if (!aceptaPoliticaDatos.value || !aceptaTerminos.value) {
      showError('Debes aceptar las políticas y términos para continuar');
      return;
    }

    // Validaciones de formulario
    const isValid = validateForm({
      tipoDocumento: (val) => validateRequired(val, 'Tipo de documento'),
      numeroDocumento: (val) => {
        const required = validateRequired(val, 'Número de documento');
        if (required !== true) return required;
        return validateNumeric(val);
      },
      nombres: (val) => {
        // Si es NIT, nombres es opcional
        if (form.value.tipoDocumento === 'NIT') {
          return true;
        }
        return validateRequired(val, 'Nombres');
      },
      razonSocial: (val) => {
        // Si es NIT, razón social es requerida
        if (form.value.tipoDocumento === 'NIT') {
          return validateRequired(val, 'Razón Social');
        }
        return true;
      },
      username: (val) => {
        const required = validateRequired(val, 'Usuario');
        if (required !== true) return required;
        const minLength = validateMinLength(val, 3, 'Usuario');
        if (minLength !== true) return minLength;
        if (/\s/.test(val)) {
          return 'El usuario no puede contener espacios';
        }
        return true;
      },
      password: (val) => validatePassword(val, 6),
    });

    if (!isValid) {
      return;
    }

    // Validar confirmación de contraseña
    const passwordMatch = validatePasswordMatch(form.value.password, confirmPassword.value);
    if (passwordMatch !== true) {
      showError(passwordMatch);
      return;
    }

    // Validar email si está presente
    if (form.value.email) {
      const emailValid = validateEmail(form.value.email);
      if (emailValid !== true) {
        showError(emailValid);
        return;
      }
    }

    // Función para convertir fecha al formato ISO 8601
    function formatDateToISO(dateString: string | undefined): string | undefined {
      if (!dateString) return undefined;
      // Convertir formato YYYY/MM/DD o YYYY-MM-DD a ISO 8601 (YYYY-MM-DD)
      return dateString.replace(/\//g, '-');
    }

    // Preparar payload
    const payload: RegisterDto = {
      ...form.value,
      // Asegurar que tipoRegistro esté correctamente asignado
      tipoRegistro: form.value.tipoRegistro || (isNIT.value ? 'CLIENTE' : 'ALUMNO'),
      razonSocial: form.value.razonSocial || undefined,
      telefono: form.value.telefono || undefined,
      fechaNacimiento: formatDateToISO(fechaNacimiento.value || undefined),
      genero: form.value.genero || undefined,
      direccion: form.value.direccion || undefined,
      fotoUrl: form.value.fotoUrl || undefined,
      // Incluir aceptación de términos y políticas para que el backend los procese automáticamente
      aceptaTerminos: aceptaTerminos.value,
      aceptaPoliticaDatos: aceptaPoliticaDatos.value,
    };

    try {
      // Si hay una foto seleccionada, subirla primero (usando endpoint público)
      if (photoFile.value && photoFile.value instanceof File) {
        try {
          const { fotoUrl } = await authService.uploadProfilePhoto(photoFile.value, true);
          payload.fotoUrl = fotoUrl;
        } catch (error) {
          showError(error instanceof Error ? error.message : 'Error al subir la foto de perfil');
          return;
        }
      }

      await register(payload);
    } catch (error) {
      console.error('Error al registrar el usuario');
      console.error(error);
      // El error ya se maneja en el composable useAuth
    }
  }

  return {
    // Estado
    form,
    loading,
    aceptaPoliticaDatos,
    aceptaTerminos,
    confirmPassword,
    showPoliticaModal,
    showTerminosModal,
    photoFile,
    isNIT,
    fechaNacimiento,
    // Opciones
    generos,
    tiposDocumento,

    // Funciones
    handleSubmit,
    handleFileUpload,
    verPoliticaDatos,
    verTerminos,
    onPolicyAccepted,
  };
}
