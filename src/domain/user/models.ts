// Modelos de dominio para usuarios
// Capa de Dominio (arquitectura hexagonal)

export type UserRole = 'admin' | 'institutional' | 'driver';
export type PersonType = 'natural' | 'juridica';
export type UserStatus = 'enabled' | 'disabled';

export interface User {
  id: string;
  personaId?: string; // ID de la persona en el backend (usado para inscripciones y certificados)
  name: string;
  email: string;
  document: string;
  documentType: 'CC' | 'CE' | 'PA' | 'TI' | 'NIT';
  phone: string;
  role: UserRole;
  roleId?: number; // ID del rol en el backend
  username?: string; // Nombre de usuario del backend
  personType: PersonType;
  enabled: boolean;
  active?: boolean; // Estado activo del backend
  mustChangePassword?: boolean; // Debe cambiar contraseña
  isExternal?: boolean; // RF-04, RF-05: Conductor externo
  company?: string;
  companyName?: string; // Para personas jurídicas
  birthDate?: string; // Fecha de nacimiento
  gender?: 'M' | 'F' | 'O'; // Género
  address?: string; // Dirección
  empresaId?: number; // ID de la empresa a la que pertenece
  empresa?: {
    id: number;
    razonSocial: string;
    numeroDocumento: string;
  };
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserStatistics {
  total: number;
  enabled: number;
  disabled: number;
  external: number;
  byRole: Record<UserRole, number>;
  byType: Record<PersonType, number>;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | null;
  status?: UserStatus | null;
  personType?: PersonType | null;
  isExternal?: boolean | null;
  company?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  filters?: UserFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
