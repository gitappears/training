// Puertos de aplicación para Trainings (tipo Udemy)
// Implementaciones reales irán en infrastructure/http

import type { Training } from '../../domain/training/models';

export interface TrainingListFilters {
  query?: string;
  modality?: string;
  area?: string;
}

export interface TrainingRepository {
  list(filters?: TrainingListFilters): Promise<Training[]>;
  getById(id: string): Promise<Training | null>;
  create(data: Partial<Training>): Promise<Training>;
}
