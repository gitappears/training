// Entidades / modelos de dominio para Todo
// Capa de Dominio (arquitectura hexagonal)

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}
