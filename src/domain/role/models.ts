// Modelos de dominio para roles
// Capa de Dominio (arquitectura hexagonal)

export interface Role {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

