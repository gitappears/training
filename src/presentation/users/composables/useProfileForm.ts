import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '../../../stores/auth.store';
import { useQuasar } from 'quasar';
import { authService } from '../../../infrastructure/http/auth/auth.service';
import { api } from '../../../boot/axios';
import type { UserProfile } from '../../../application/auth/auth.repository.port';

export interface ProfileFormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  genero: string;
  biografia: string;
  fotoUrl: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useProfileForm() {
  const authStore = useAuthStore();
  const $q = useQuasar();

  const loading = ref(false);
  const uploadingPhoto = ref(false);
  const photoToUpload = ref<File | null>(null);
  const isValidatingPassword = ref(false);
  const isCurrentPasswordValid = ref(false);

  const isCurrentPasswordVisible = ref(false);
  const isNewPasswordVisible = ref(false);
  const isConfirmPasswordVisible = ref(false);

  const generoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' },
  ];

  const defaultAvatars = [
    { seed: 'Felix', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Felix' },
    { seed: 'Mimi', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi' },
    { seed: 'Sheba', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Sheba' },
    { seed: 'Max', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Max' },
    { seed: 'Abby', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Abby' },
  ];

  const form = reactive<ProfileFormData>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    genero: '',
    biografia: '',
    fotoUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profile = computed(() => authStore.profile);
  const localProfile = computed(() => profile.value);

  const fullImageUrl = computed(() => {
    if (!form.fotoUrl) return '';
    // Si la URL es completa (http/https), la usamos directamente
    if (form.fotoUrl.startsWith('http')) {
      return form.fotoUrl;
    }
    // Si es una URL de S3 (empieza con https://), la usamos directamente
    if (form.fotoUrl.includes('amazonaws.com') || form.fotoUrl.includes('cloudfront.net')) {
      return form.fotoUrl;
    }
    // Si no, la componemos con la base de la API
    return `${api.defaults.baseURL}${form.fotoUrl}`;
  });

  function populateForm() {
    if (profile.value) {
      const p = profile.value as any;
      form.nombres = p.nombres || p.persona?.nombres || '';
      form.apellidos = p.apellidos || p.persona?.apellidos || '';
      form.email = p.email || p.persona?.email || '';
      form.telefono = p.telefono || p.persona?.telefono || '';
      form.direccion = p.direccion || p.persona?.direccion || '';
      form.fechaNacimiento = p.fechaNacimiento || p.persona?.fechaNacimiento || '';
      form.genero = p.genero || p.persona?.genero || '';
      form.biografia = p.biografia || p.persona?.biografia || '';
      form.fotoUrl = p.fotoUrl || p.persona?.fotoUrl || '';
      // Limpiar campos de contraseña
      form.currentPassword = '';
      form.newPassword = '';
      form.confirmPassword = '';
      // Resetear validación de contraseña
      isCurrentPasswordValid.value = false;
    }
  }

  // Computed para determinar si los campos de nueva contraseña deben estar habilitados
  const canChangePassword = computed(() => isCurrentPasswordValid.value);

  // Debounce timer para validación de contraseña
  let passwordValidationTimer: ReturnType<typeof setTimeout> | null = null;

  async function validateCurrentPassword() {
    if (!form.currentPassword || form.currentPassword.length === 0) {
      isCurrentPasswordValid.value = false;
      return;
    }

    // Cancelar validación anterior si existe
    if (passwordValidationTimer) {
      clearTimeout(passwordValidationTimer);
    }

    isValidatingPassword.value = true;

    // Debounce: esperar 3 segundos después de que el usuario deje de escribir
    passwordValidationTimer = setTimeout(async () => {
      try {
        const { valid } = await authService.validatePassword(form.currentPassword);
        isCurrentPasswordValid.value = valid;

        if (!valid) {
          $q.notify({
            type: 'negative',
            message: 'La contraseña actual es incorrecta',
            icon: 'error',
            timeout: 3000,
          });
        } else {
          $q.notify({
            type: 'positive',
            message: 'Contraseña verificada. Puede cambiar su contraseña',
            icon: 'check_circle',
            timeout: 2000,
          });
        }
      } catch (error) {
        isCurrentPasswordValid.value = false;
        const errorMessage = error instanceof Error ? error.message : 'Error al validar la contraseña';
        $q.notify({
          type: 'negative',
          message: errorMessage,
          icon: 'error',
          timeout: 3000,
        });
      } finally {
        isValidatingPassword.value = false;
      }
    }, 3000); // Cambiado de 500ms a 3000ms (3 segundos)
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    uploadingPhoto.value = true;
    $q.loading.show({ message: 'Subiendo foto de perfil...' });

    try {
      // Usar el servicio de autenticación para subir la foto
      const { fotoUrl } = await authService.uploadProfilePhoto(file, false);
      
      // Actualizar el formulario con la nueva URL
      form.fotoUrl = fotoUrl;
      
      // Refrescar el perfil desde el backend para obtener los datos actualizados
      await authStore.fetchProfile();

      $q.notify({
        type: 'positive',
        message: 'Foto de perfil subida exitosamente',
        icon: 'check_circle',
        timeout: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la foto de perfil';
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        timeout: 5000,
      });
    } finally {
      uploadingPhoto.value = false;
      $q.loading.hide();
      photoToUpload.value = null;
    }
  }

  async function handleSubmit() {
    // Validar contraseñas si se está cambiando
    if (form.newPassword) {
      if (!form.currentPassword) {
        $q.notify({
          type: 'negative',
          message: 'Debe ingresar la contraseña actual para cambiar la contraseña',
          icon: 'error',
        });
        return;
      }

      if (form.newPassword.length < 8) {
        $q.notify({
          type: 'negative',
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
          icon: 'error',
        });
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        $q.notify({
          type: 'negative',
          message: 'La nueva contraseña y su confirmación no coinciden',
          icon: 'error',
        });
        return;
      }
    }

    loading.value = true;

    try {
      // Preparar payload
      const payload: Record<string, any> = {
        nombres: form.nombres || undefined,
        apellidos: form.apellidos || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        direccion: form.direccion || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        genero: form.genero || undefined,
        biografia: form.biografia || undefined,
        fotoUrl: form.fotoUrl || undefined,
      };

      // Agregar campos de contraseña solo si se está cambiando
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      // Limpiar campos vacíos
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '' || payload[key] === null) {
          delete payload[key];
        }
      });

      // Actualizar perfil
      await authService.updateProfile(payload);

      // Refrescar el perfil desde el backend
      await authStore.fetchProfile();

      $q.notify({
        type: 'positive',
        message: 'Perfil actualizado exitosamente',
        icon: 'check_circle',
        timeout: 3000,
      });

      // Limpiar campos de contraseña después de guardar
      form.currentPassword = '';
      form.newPassword = '';
      form.confirmPassword = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        timeout: 5000,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function selectAvatar(avatarUrl: string) {
    form.fotoUrl = avatarUrl;
  }

  // Observar cambios en el perfil para actualizar el formulario
  watch(
    () => profile.value,
    () => {
      populateForm();
    },
    { deep: true },
  );

  return {
    // Estado
    form,
    loading,
    uploadingPhoto,
    photoToUpload,
    profile,
    localProfile,
    isValidatingPassword,
    isCurrentPasswordValid,
    isCurrentPasswordVisible,
    isNewPasswordVisible,
    isConfirmPasswordVisible,

    // Opciones
    generoOptions,
    defaultAvatars,

    // Computed
    fullImageUrl,
    canChangePassword,

    // Funciones
    populateForm,
    handleFileUpload,
    handleSubmit,
    selectAvatar,
    validateCurrentPassword,
  };
}

