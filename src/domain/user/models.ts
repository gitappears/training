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
  personType: PersonType;
  enabled: boolean;
  isExternal?: boolean; // RF-04, RF-05: Conductor externo
  company?: string;
  companyName?: string; // Para personas jurídicas
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
