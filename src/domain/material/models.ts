// Modelos de dominio para materiales
// Capa de Dominio (arquitectura hexagonal)

export type MaterialType = 'PDF' | 'IMAGE' | 'VIDEO' | 'DOC' | 'LINK' | 'PRESENTATION' | 'AUDIO';

export interface Material {
  id: string;
  capacitacionId: number;
  tipoMaterialId: number;
  tipoMaterial: {
    id: number;
    nombre: string;
    codigo: string;
  };
  nombre: string;
  url: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
}

