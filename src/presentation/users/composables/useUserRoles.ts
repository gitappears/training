import type { UserRole } from '../../../domain/user/models';

/**
 * Opciones de roles para filtros y selects
 */
export const roleOptions = [
  { label: 'Administrador', value: 'admin' as UserRole },
  { label: 'Cliente Institucional', value: 'institutional' as UserRole },
  { label: 'Conductor', value: 'driver' as UserRole },
];

/**
 * Opciones de estado para filtros
 */
export const statusOptions = [
  { label: 'Habilitado', value: 'enabled' },
  { label: 'Deshabilitado', value: 'disabled' },
];

/**
 * Opciones de tipo de persona para filtros
 */
export const personTypeOptions = [
  { label: 'Persona Natural', value: 'natural' },
  { label: 'Persona Jurídica', value: 'juridica' },
];

/**
 * Composable para utilidades de roles de usuario
 */
export function useUserRoles() {
  function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      institutional: 'Cliente Institucional',
      driver: 'Conductor',
    };
    return labels[role] ?? role;
  }

  function getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: 'purple',
      institutional: 'blue',
      driver: 'green',
    };
    return colors[role] ?? 'grey';
  }

  return {
    roleOptions,
    statusOptions,
    personTypeOptions,
    getRoleLabel,
    getRoleColor,
  };
}

