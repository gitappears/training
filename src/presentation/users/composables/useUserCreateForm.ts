import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { PeopleUseCasesFactory } from '../../../application/people/people.use-cases.factory';
import { peopleService } from '../../../infrastructure/http/people/people.service';
import { authService } from '../../../infrastructure/http/auth/auth.service';
import {
  empresasService,
  type Empresa,
} from '../../../infrastructure/http/empresas/empresas.service';
import { useRoles } from './useRoles';
import { useAuthStore } from '../../../stores/auth.store';
import type { PersonType } from '../../../domain/user/models';
import type { RegisterDto } from '../../../application/auth/auth.repository.port';
import {
  TIPO_DOCUMENTO_OPTIONS,
  type TipoDocumento,
  getTipoDocumentoLabel,
} from '../../../shared/constants/tipo-documento';

/**
 * Composable para manejar el formulario de creación de usuarios
 */
export function useUserCreateForm() {
  const router = useRouter();
  const $q = useQuasar();

  // Estado
  const step = ref(1);
  const loading = ref(false);
  const basicFormRef = ref<QForm | null>(null);
  const typeFormRef = ref<QForm | null>(null);
  const configFormRef = ref<QForm | null>(null);

  interface UserForm {
    documentType: TipoDocumento | null;
    document: string;
    nombres: string;
    apellidos: string;
    email: string;
    phone: string;
    personType: PersonType | null;
    role: string | null; // Usar códigos del backend directamente (ADMIN, CLIENTE, ALUMNO, INSTRUCTOR, OPERADOR)
    companyName: string;
    company: string;
    isExternal: boolean;
    enabled: boolean;
    studentCode?: string;
    empresaId: number | null;
  }

  const form = ref<UserForm>({
    documentType: null,
    document: '',
    nombres: '',
    apellidos: '',
    email: '',
    phone: '',
    personType: null,
    role: null,
    companyName: '',
    company: '',
    isExternal: false,
    enabled: true,
    studentCode: '',
    empresaId: null,
  });

  // Estado para empresas
  const empresas = ref<Empresa[]>([]);
  const loadingEmpresas = ref(false);
  const authStore = useAuthStore();

  // Computed para determinar si el usuario actual es ADMIN
  const isAdmin = computed(() => authStore.profile?.rol === 'ADMIN');

  // Computed para determinar si el usuario actual es CLIENTE
  const isCliente = computed(() => authStore.profile?.rol === 'CLIENTE');

  // Computed para obtener la empresa del usuario CLIENTE actual
  const currentUserEmpresaId = computed(() => {
    if (authStore.profile?.persona?.empresaId) {
      return authStore.profile.persona.empresaId;
    }
    return null;
  });

  // Computed para obtener el nombre de la empresa del usuario CLIENTE actual
  const currentUserEmpresaName = computed(() => {
    const profile = authStore.profile;
    const persona = profile?.persona;
    const empresa = persona?.empresa;

    console.log('🔍 currentUserEmpresaName - Profile completo:', JSON.stringify(profile, null, 2));
    console.log('🔍 currentUserEmpresaName - persona:', JSON.stringify(persona, null, 2));
    console.log('🔍 currentUserEmpresaName - empresa:', JSON.stringify(empresa, null, 2));
    console.log('🔍 currentUserEmpresaName - empresaId:', persona?.empresaId);

    if (empresa?.razonSocial) {
      console.log('✅ Nombre de empresa encontrado:', empresa.razonSocial);
      return empresa.razonSocial;
    }

    // Si no hay empresa pero hay empresaId, intentar recargar el perfil
    if (persona?.empresaId && !empresa) {
      console.log('⚠️ Hay empresaId pero no hay datos de empresa, recargando perfil...');
      void authStore.fetchProfile();
    }

    console.log('⚠️ No se encontró nombre de empresa');
    return '';
  });

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

  // Cargar empresas al montar el componente
  onMounted(async () => {
    void loadEmpresas();
    // Si el usuario es CLIENTE, configurar valores automáticos
    if (isCliente.value) {
      console.log('👤 Usuario CLIENTE detectado');

      // Verificar si el perfil tiene empresa
      const tieneEmpresa = !!authStore.profile?.persona?.empresa;
      const tieneEmpresaId =
        authStore.profile?.persona?.empresaId !== undefined &&
        authStore.profile?.persona?.empresaId !== null;

      console.log('🔍 Estado del perfil antes de recargar:');
      console.log('  - tieneEmpresa:', tieneEmpresa);
      console.log('  - tieneEmpresaId:', tieneEmpresaId);
      console.log('  - empresaId valor:', authStore.profile?.persona?.empresaId);

      // Si no tiene empresa (aunque tenga empresaId o no), forzar recarga desde backend
      if (!tieneEmpresa) {
        console.log('🔄 Perfil sin empresa, forzando recarga desde backend...');
        await authStore.fetchProfile();

        // Esperar un momento para que el perfil se actualice reactivamente
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log('🏢 currentUserEmpresaId después de recargar:', currentUserEmpresaId.value);
      console.log('🏢 currentUserEmpresaName después de recargar:', currentUserEmpresaName.value);
      console.log(
        '📋 Profile completo después de recargar:',
        JSON.stringify(authStore.profile, null, 2),
      );

      // Asignar automáticamente su empresa
      if (currentUserEmpresaId.value) {
        form.value.empresaId = currentUserEmpresaId.value;
        console.log('✅ empresaId asignado al formulario:', form.value.empresaId);
      }
      // Establecer el nombre de la empresa en el campo company
      if (currentUserEmpresaName.value) {
        form.value.company = currentUserEmpresaName.value;
        console.log('✅ Nombre de empresa asignado al formulario:', form.value.company);
      } else {
        console.log('⚠️ No se pudo obtener el nombre de la empresa después de recargar');
        console.log('🔍 Profile persona:', JSON.stringify(authStore.profile?.persona, null, 2));
        console.log(
          '🔍 Profile persona.empresa:',
          JSON.stringify(authStore.profile?.persona?.empresa, null, 2),
        );
        console.log('🔍 Profile persona.empresaId:', authStore.profile?.persona?.empresaId);
      }
      // Establecer tipo de persona como natural
      form.value.personType = 'natural';
      // Establecer rol como ALUMNO (código del backend)
      form.value.role = 'ALUMNO';
    }
  });

  // Opciones de tipo de documento (excluir NIT si es CLIENTE)
  const documentTypeOptions = computed(() => {
    if (isCliente.value) {
      return TIPO_DOCUMENTO_OPTIONS.filter((o) => o.value !== 'NIT');
    }
    return TIPO_DOCUMENTO_OPTIONS;
  });

  const personTypeOptions = [
    { label: 'Persona Natural', value: 'natural' },
    { label: 'Persona Jurídica', value: 'juridica' },
  ];

  // Cargar roles desde el backend
  const { roleOptions, roles } = useRoles();

  // Funciones
  function isValidEmail(val: string): boolean | string {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(val) || 'Email inválido';
  }

  // Computed para verificar si el tipo de documento es NIT
  const isNIT = computed(() => form.value.documentType === 'NIT');

  // Watcher para aplicar validación automática cuando el tipo de documento es NIT
  // Solo aplica si el usuario es ADMIN (los CLIENTE no pueden usar NIT)
  watch(
    () => form.value.documentType,
    (newValue) => {
      if (newValue === 'NIT' && isAdmin.value) {
        // Establecer automáticamente tipo de persona como jurídica
        form.value.personType = 'juridica';
        // Establecer automáticamente rol como CLIENTE (código del backend)
        form.value.role = 'CLIENTE';
      }
    },
    { immediate: true },
  );

  // Watcher para limpiar empresaId cuando se marca como conductor externo
  watch(
    () => form.value.isExternal,
    (newValue) => {
      if (newValue === true) {
        // Limpiar el valor seleccionado en el select de empresa
        form.value.empresaId = null;
      }
    },
  );

  function onPersonTypeChange(value: PersonType) {
    if (value === 'natural') {
      form.value.companyName = '';
    }
  }

  async function nextStep() {
    if (step.value === 1) {
      const success = await basicFormRef.value?.validate();
      if (success) {
        step.value++;
      }
    } else if (step.value === 2) {
      const success = await typeFormRef.value?.validate();
      if (success) {
        step.value++;
      }
    } else if (step.value === 3) {
      const success = await configFormRef.value?.validate();
      if (success) {
        step.value++;
      }
    }
  }

  function previousStep() {
    if (step.value > 1) {
      step.value--;
    }
  }

  // Función para generar contraseña temporal
  function generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = 12;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TEMP_${password}`;
  }

  async function handleSubmit() {
    loading.value = true;

    try {
      // Validar formulario completo
      const validations = await Promise.all([
        basicFormRef.value?.validate(),
        typeFormRef.value?.validate(),
        configFormRef.value?.validate(),
      ]);

      if (validations.every((v) => v !== false)) {
        // Para NIT, nombres es opcional (nombre de contacto), apellidos puede estar vacío
        // Para otros tipos, ambos son requeridos
        const nombres = form.value.nombres.trim();
        const apellidos = form.value.apellidos.trim();
        const username = form.value.document;
        const password = generateTemporaryPassword();

        // Si es conductor externo (ALUMNO, OPERADOR o INSTRUCTOR), usar el servicio de personas
        if (
          (form.value.role === 'ALUMNO' ||
            form.value.role === 'OPERADOR' ||
            form.value.role === 'INSTRUCTOR') &&
          form.value.isExternal
        ) {
          const createExternalDriverUseCase =
            PeopleUseCasesFactory.getCreateExternalDriverUseCase(peopleService);
          const driverData: {
            numeroDocumento: string;
            tipoDocumento: string;
            nombres: string;
            apellidos: string;
            email: string;
            telefono?: string;
          } = {
            numeroDocumento: form.value.document,
            tipoDocumento: form.value.documentType || 'CC',
            nombres,
            apellidos,
            email: form.value.email,
          };
          if (form.value.phone) {
            driverData.telefono = form.value.phone;
          }
          await createExternalDriverUseCase.execute(driverData);

          $q.notify({
            type: 'positive',
            message: 'Conductor externo creado exitosamente. Debe ser habilitado después del pago.',
            position: 'top',
          });
        } else if (form.value.role === 'ADMIN') {
          // Crear administrador usando el endpoint de admin
          const adminData: {
            numeroDocumento: string;
            tipoDocumento: string;
            nombres: string;
            apellidos: string;
            email: string;
            username: string;
            password: string;
            telefono?: string;
            habilitado?: boolean;
            aceptaTerminos?: boolean;
            aceptaPoliticaDatos?: boolean;
          } = {
            numeroDocumento: form.value.document,
            tipoDocumento: form.value.documentType || 'CC',
            nombres,
            apellidos,
            email: form.value.email,
            username,
            password,
            habilitado: form.value.enabled,
            // Aceptar términos automáticamente cuando se crea desde el panel de administración
            aceptaTerminos: true,
            aceptaPoliticaDatos: true,
          };
          if (form.value.phone) {
            adminData.telefono = form.value.phone;
          }
          await authService.createAdmin(adminData);

          $q.notify({
            type: 'positive',
            message: `Administrador creado exitosamente. Username: ${username}, Contraseña temporal: ${password}`,
            position: 'top',
            timeout: 10000,
          });
        } else {
          // Para otros roles, usar el endpoint de registro
          // Usar directamente el código del backend como tipoRegistro
          const tipoRegistro = form.value.role as RegisterDto['tipoRegistro'];

          const registerData: RegisterDto = {
            numeroDocumento: form.value.document,
            tipoDocumento: form.value.documentType || 'CC',
            nombres,
            apellidos,
            email: form.value.email,
            username,
            password,
            tipoRegistro,
            habilitado: form.value.enabled,
            // Aceptar términos automáticamente cuando se crea desde el panel de administración
            aceptaTerminos: true,
            aceptaPoliticaDatos: true,
          };

          // Asignar empresaId: si es ADMIN puede elegir, si es CLIENTE se asigna automáticamente
          if (isAdmin.value && form.value.empresaId) {
            registerData.empresaId = form.value.empresaId;
            console.log('👨‍💼 ADMIN - empresaId asignado:', registerData.empresaId);
          } else if (isCliente.value && currentUserEmpresaId.value) {
            // Para CLIENTE, se asigna automáticamente en el backend, pero lo enviamos por claridad
            registerData.empresaId = currentUserEmpresaId.value;
            console.log('👤 CLIENTE - empresaId asignado:', registerData.empresaId);
            console.log('📦 Datos de registro completos:', JSON.stringify(registerData, null, 2));
          } else {
            console.log(
              '⚠️ No se pudo asignar empresaId - isCliente:',
              isCliente.value,
              'currentUserEmpresaId:',
              currentUserEmpresaId.value,
            );
          }

          if (form.value.phone) {
            registerData.telefono = form.value.phone;
          }
          if (form.value.companyName) {
            registerData.razonSocial = form.value.companyName;
          }
          // Solo enviar código de estudiante si es ADMIN (para CLIENTE se autogenera)
          if (form.value.studentCode && isAdmin.value) {
            registerData.codigoEstudiante = form.value.studentCode;
          }

          await authService.register(registerData);

          // Mensaje de éxito
          const message = form.value.enabled
            ? `Usuario registrado y habilitado exitosamente. Username: ${username}, Contraseña temporal: ${password}`
            : `Usuario registrado exitosamente. Username: ${username}, Contraseña temporal: ${password}. Debe ser habilitado por el administrador.`;

          $q.notify({
            type: 'positive',
            message,
            position: 'top',
            timeout: 10000,
          });
        }

        void router.push('/users');
      } else {
        $q.notify({
          type: 'negative',
          message: 'Por favor, complete todos los campos requeridos',
          position: 'top',
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Error al crear el usuario',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  }

  function getDocumentTypeLabel(type: string | null): string {
    return getTipoDocumentoLabel(type);
  }

  function getRoleLabel(role: string | null): string {
    if (!role) return '';
    // Buscar el rol en la lista de roles cargados del backend
    const roleData = roles.value.find((r) => r.codigo === role);
    return roleData?.nombre ?? role;
  }

  function goBack() {
    void router.push('/users');
  }

  return {
    // Estado
    step,
    loading,
    form,
    basicFormRef,
    typeFormRef,
    configFormRef,
    isNIT,

    // Opciones
    documentTypeOptions,
    personTypeOptions,
    roleOptions,

    // Empresas
    empresas,
    loadingEmpresas,
    isAdmin,
    isCliente,
    currentUserEmpresaId,
    currentUserEmpresaName,

    // Funciones
    isValidEmail,
    onPersonTypeChange,
    nextStep,
    previousStep,
    handleSubmit,
    getDocumentTypeLabel,
    getRoleLabel,
    goBack,
  };
}
