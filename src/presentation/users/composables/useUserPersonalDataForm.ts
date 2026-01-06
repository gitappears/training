import { ref, watch, computed, onMounted, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUsers } from './useUsers';
import { empresasService, type Empresa } from '../../../infrastructure/http/empresas/empresas.service';
import { useAuthStore } from '../../../stores/auth.store';

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
    empresaId: number | null;
  }>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: null,
    direccion: '',
    empresaId: null,
  });

  // Estado para empresas
  const empresas = ref<Empresa[]>([]);
  const loadingEmpresas = ref(false);
  const authStore = useAuthStore();

  // Computed para determinar si el usuario actual es ADMIN
  const isAdmin = computed(() => authStore.profile?.rol === 'ADMIN');

  // Cargar empresas solo si es ADMIN
  async function loadEmpresas() {
    if (!isAdmin.value) {
      return;
    }
    loadingEmpresas.value = true;
    try {
      empresas.value = await empresasService.findAll();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Error al cargar empresas',
        position: 'top',
      });
    } finally {
      loadingEmpresas.value = false;
    }
  }

  // Cargar empresas al montar
  onMounted(() => {
    void loadEmpresas();
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
        empresaId: currentUser.empresaId || null,
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
      empresaId?: number;
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
    if (personalData.value.empresaId !== currentUser.empresaId) {
      personaData.empresaId = personalData.value.empresaId || undefined;
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
    empresas,
    loadingEmpresas,
    isAdmin,
    loading,
    resetForm,
    submit,
  };
}

