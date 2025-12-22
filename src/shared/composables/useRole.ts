import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth.store';

export type UserRole = 'ADMIN' | 'CLIENTE' | 'INSTRUCTOR' | 'ALUMNO' | 'OPERADOR';

/**
 * Composable para verificar roles y permisos del usuario
 */
export function useRole() {
  const authStore = useAuthStore();

  /**
   * Obtiene el rol del usuario actual
   */
  const userRole = computed<UserRole | null>(() => {
    const rol = authStore.profile?.rol;
    if (!rol) return null;
    
    // Normalizar el rol a mayúsculas para comparación
    const normalizedRol = rol.toUpperCase() as UserRole;
    
    // Validar que sea un rol válido
    const validRoles: UserRole[] = ['ADMIN', 'CLIENTE', 'INSTRUCTOR', 'ALUMNO', 'OPERADOR'];
    if (validRoles.includes(normalizedRol)) {
      return normalizedRol;
    }
    
    return null;
  });

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  function hasRole(...roles: UserRole[]): boolean {
    if (!userRole.value) return false;
    return roles.includes(userRole.value);
  }

  /**
   * Verifica si el usuario es ADMIN
   */
  const isAdmin = computed(() => hasRole('ADMIN'));

  /**
   * Verifica si el usuario es CLIENTE
   */
  const isCliente = computed(() => hasRole('CLIENTE'));

  /**
   * Verifica si el usuario es INSTRUCTOR
   */
  const isInstructor = computed(() => hasRole('INSTRUCTOR'));

  /**
   * Verifica si el usuario es ALUMNO
   */
  const isAlumno = computed(() => hasRole('ALUMNO'));

  /**
   * Verifica si el usuario es OPERADOR
   */
  const isOperador = computed(() => hasRole('OPERADOR'));

  /**
   * Verifica si el usuario puede ver capacitaciones
   * ADMIN, INSTRUCTOR, ALUMNO, CLIENTE, OPERADOR pueden ver
   */
  const canViewTrainings = computed(() => {
    return hasRole('ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR');
  });

  /**
   * Verifica si el usuario puede crear/editar capacitaciones
   * Solo ADMIN e INSTRUCTOR
   */
  const canManageTrainings = computed(() => {
    return hasRole('ADMIN', 'INSTRUCTOR');
  });

  /**
   * Verifica si el usuario puede gestionar usuarios
   * Solo ADMIN
   */
  const canManageUsers = computed(() => {
    return hasRole('ADMIN');
  });

  /**
   * Verifica si el usuario puede ver evaluaciones
   * ADMIN, INSTRUCTOR, ALUMNO, CLIENTE, OPERADOR pueden ver
   */
  const canViewEvaluations = computed(() => {
    return hasRole('ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR');
  });

  /**
   * Verifica si el usuario puede ver certificados
   * Todos los roles autenticados pueden ver sus certificados
   */
  const canViewCertificates = computed(() => {
    return hasRole('ADMIN', 'INSTRUCTOR', 'ALUMNO', 'CLIENTE', 'OPERADOR');
  });

  /**
   * Verifica si el usuario puede ver reportes
   * ADMIN, CLIENTE, OPERADOR pueden ver reportes
   */
  const canViewReports = computed(() => {
    return hasRole('ADMIN', 'CLIENTE', 'OPERADOR');
  });

  /**
   * Verifica si el usuario puede crear inscripciones
   * ADMIN, ALUMNO, CLIENTE pueden crear inscripciones
   */
  const canCreateInscriptions = computed(() => {
    return hasRole('ADMIN', 'ALUMNO', 'CLIENTE');
  });

  /**
   * Verifica si el usuario puede hacer carga masiva de conductores
   * ADMIN y CLIENTE pueden hacer carga masiva
   */
  const canBulkUploadDrivers = computed(() => {
    return hasRole('ADMIN', 'CLIENTE');
  });

  return {
    userRole,
    hasRole,
    isAdmin,
    isCliente,
    isInstructor,
    isAlumno,
    isOperador,
    canViewTrainings,
    canManageTrainings,
    canManageUsers,
    canViewEvaluations,
    canViewCertificates,
    canViewReports,
    canCreateInscriptions,
    canBulkUploadDrivers,
  };
}

