import { ref, watch, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUsers } from './useUsers';

/**
 * Composable para manejar el formulario de datos personales
 */
export function useUserPersonalDataForm(user: Ref<User | null> | User | null) {
  const $q = useQuasar();
  const { updateUserPersonData, loading } = useUsers();

  // Convertir a ref si es necesario
  const userRef = typeof user === 'object' && 'value' in user ? user : ref(user);

  const personalData = ref<{
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    fechaNacimiento: string;
    genero: 'M' | 'F' | 'O' | null;
    direccion: string;
  }>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: null,
    direccion: '',
  });

  const genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' },
  ];

  // Inicializar datos cuando cambia el usuario
  watch(
    userRef,
    (currentUser) => {
      if (currentUser) {
        // Separar nombre completo en nombres y apellidos
        const nameParts = currentUser.name ? currentUser.name.trim().split(' ') : [];
        personalData.value = {
          nombres: nameParts[0] || '',
          apellidos: nameParts.slice(1).join(' ') || '',
          email: currentUser.email || '',
          telefono: currentUser.phone || '',
          fechaNacimiento: currentUser.birthDate || '',
          genero: (currentUser.gender as 'M' | 'F' | 'O') || null,
          direccion: currentUser.address || '',
        };
      }
    },
    { immediate: true },
  );

  function resetForm() {
    const currentUser = userRef.value;
    if (currentUser) {
      const nameParts = currentUser.name ? currentUser.name.trim().split(' ') : [];
      personalData.value = {
        nombres: nameParts[0] || '',
        apellidos: nameParts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        telefono: currentUser.phone || '',
        fechaNacimiento: currentUser.birthDate || '',
        genero: (currentUser.gender as 'M' | 'F' | 'O') || null,
        direccion: currentUser.address || '',
      };
    }
  }

  async function submit(): Promise<void> {
    const currentUser = userRef.value;
    if (!currentUser) return;

    const personaData: {
      nombres?: string;
      apellidos?: string;
      email?: string;
      telefono?: string;
      fechaNacimiento?: string;
      genero?: 'M' | 'F' | 'O';
      direccion?: string;
    } = {};

    // Verificar cambios
    const nameParts = currentUser.name ? currentUser.name.trim().split(' ') : [];
    const currentNombres = nameParts[0] || '';
    const currentApellidos = nameParts.slice(1).join(' ') || '';

    if (personalData.value.nombres !== currentNombres) {
      personaData.nombres = personalData.value.nombres;
    }
    if (personalData.value.apellidos !== currentApellidos) {
      personaData.apellidos = personalData.value.apellidos;
    }
    if (personalData.value.email !== currentUser.email) {
      personaData.email = personalData.value.email;
    }
    if (personalData.value.telefono !== currentUser.phone) {
      personaData.telefono = personalData.value.telefono;
    }
    if (personalData.value.fechaNacimiento !== currentUser.birthDate) {
      personaData.fechaNacimiento = personalData.value.fechaNacimiento;
    }
    if (personalData.value.genero !== currentUser.gender) {
      personaData.genero = personalData.value.genero || undefined;
    }
    if (personalData.value.direccion !== currentUser.address) {
      personaData.direccion = personalData.value.direccion;
    }

    // Solo actualizar si hay cambios
    if (Object.keys(personaData).length > 0) {
      await updateUserPersonData(currentUser.id, personaData);
      $q.notify({
        type: 'positive',
        message: 'Datos personales actualizados exitosamente',
        position: 'top',
      });
    } else {
      $q.notify({
        type: 'info',
        message: 'No hay cambios para guardar',
        position: 'top',
      });
      throw new Error('No hay cambios para guardar');
    }
  }

  return {
    personalData,
    genderOptions,
    loading,
    resetForm,
    submit,
  };
}

