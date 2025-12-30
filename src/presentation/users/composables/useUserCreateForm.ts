import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { PeopleUseCasesFactory } from '../../../application/people/people.use-cases.factory';
import { peopleService } from '../../../infrastructure/http/people/people.service';
import { authService } from '../../../infrastructure/http/auth/auth.service';
import { useRoles } from './useRoles';
import type { UserRole, PersonType } from '../../../domain/user/models';

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
    documentType: 'CC' | 'CE' | 'PA' | 'TI' | 'NIT' | null;
    document: string;
    name: string;
    email: string;
    phone: string;
    personType: PersonType | null;
    role: UserRole | null;
    companyName: string;
    company: string;
    isExternal: boolean;
    enabled: boolean;
    studentCode?: string;
  }

  const form = ref<UserForm>({
    documentType: null,
    document: '',
    name: '',
    email: '',
    phone: '',
    personType: null,
    role: null,
    companyName: '',
    company: '',
    isExternal: false,
    enabled: true,
    studentCode: '',
  });

  // Opciones
  const documentTypeOptions = ['CC', 'CE', 'PA', 'TI', 'NIT'];

  const personTypeOptions = [
    { label: 'Persona Natural', value: 'natural' },
    { label: 'Persona Jurídica', value: 'juridica' },
  ];

  // Cargar roles desde el backend
  const { roleOptions } = useRoles();

  // Funciones
  function isValidEmail(val: string): boolean | string {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(val) || 'Email inválido';
  }

  // Computed para verificar si el tipo de documento es NIT
  const isNIT = computed(() => form.value.documentType === 'NIT');

  // Watcher para aplicar validación automática cuando el tipo de documento es NIT
  watch(
    () => form.value.documentType,
    (newValue) => {
      if (newValue === 'NIT') {
        // Establecer automáticamente tipo de persona como jurídica
        form.value.personType = 'juridica';
        // Establecer automáticamente rol como cliente institucional
        form.value.role = 'institutional';
      }
    },
    { immediate: true },
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

  // Función para generar username automáticamente
  function generateUsername(name: string, document: string): string {
    // Tomar el primer nombre y primer apellido, convertir a minúsculas y quitar acentos
    const nameParts = name.trim().split(' ');
    const firstName =
      nameParts[0]
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') || '';
    const lastName =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1]
            ?.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') || ''
        : '';

    // Combinar nombre.apellido y agregar últimos 4 dígitos del documento
    const baseUsername = lastName ? `${firstName}.${lastName}` : firstName;
    const docSuffix = document.slice(-4);

    return `${baseUsername}.${docSuffix}`;
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

  // Función para separar nombres y apellidos
  function splitName(fullName: string): { nombres: string; apellidos: string } {
    const parts = fullName
      .trim()
      .split(' ')
      .filter((p) => p.length > 0);
    if (parts.length === 0) {
      return { nombres: '', apellidos: '' };
    }
    if (parts.length === 1) {
      return { nombres: parts[0] || '', apellidos: '' };
    }
    const nombres = parts[0] || '';
    const apellidos = parts.slice(1).join(' ');
    return { nombres, apellidos };
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
        const { nombres, apellidos } = splitName(form.value.name);
        const username = generateUsername(form.value.name, form.value.document);
        const password = generateTemporaryPassword();

        // Si es conductor externo, usar el servicio de personas
        if (form.value.role === 'driver' && form.value.isExternal) {
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
        } else if (form.value.role === 'admin') {
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
          } = {
            numeroDocumento: form.value.document,
            tipoDocumento: form.value.documentType || 'CC',
            nombres,
            apellidos,
            email: form.value.email,
            username,
            password,
            habilitado: form.value.enabled,
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
          // Para otros roles (driver, institutional), usar el endpoint de registro
          // Mapear roles del frontend al backend
          let tipoRegistro: 'ALUMNO' | 'INSTRUCTOR' | 'CLIENTE' = 'ALUMNO';

          if (form.value.role === 'driver') {
            tipoRegistro = 'ALUMNO';
          } else if (form.value.role === 'institutional') {
            // Asignar como CLIENTE para clientes institucionales
            tipoRegistro = 'CLIENTE';
          }

          const registerData: {
            numeroDocumento: string;
            tipoDocumento: string;
            nombres: string;
            apellidos: string;
            email: string;
            username: string;
            password: string;
            tipoRegistro: 'ALUMNO' | 'INSTRUCTOR' | 'CLIENTE';
            telefono?: string;
            razonSocial?: string;
            codigoEstudiante?: string;
            habilitado?: boolean;
          } = {
            numeroDocumento: form.value.document,
            tipoDocumento: form.value.documentType || 'CC',
            nombres,
            apellidos,
            email: form.value.email,
            username,
            password,
            tipoRegistro,
            habilitado: form.value.enabled,
          };

          if (form.value.phone) {
            registerData.telefono = form.value.phone;
          }
          if (form.value.companyName) {
            registerData.razonSocial = form.value.companyName;
          }
          if (form.value.studentCode) {
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
    const labels: Record<string, string> = {
      CC: 'Cédula de Ciudadanía',
      CE: 'Cédula de Extranjería',
      PA: 'Pasaporte',
      TI: 'Tarjeta de Identidad',
      NIT: 'NIT',
    };
    return labels[type ?? ''] ?? type ?? '';
  }

  function getRoleLabel(role: UserRole | null): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      institutional: 'Cliente Institucional',
      driver: 'Conductor',
    };
    return labels[role ?? ''] ?? role ?? '';
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

