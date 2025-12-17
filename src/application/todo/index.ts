// Casos de uso / lógica de aplicación para Todo
// Capa de Aplicación (arquitectura hexagonal)

import type { Todo, Meta } from '../../domain/todo/models';

export interface TodoListResponse {
  todos: Todo[];
  meta: Meta;
}

// Ejemplo de puerto de aplicación (firma) que luego
// implementará la infraestructura (HTTP, etc.)
export interface TodoRepository {
  list(): Promise<TodoListResponse>;
}
