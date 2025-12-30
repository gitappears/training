// Modelos de dominio para evaluaciones
// Capa de Dominio (arquitectura hexagonal)

export type QuestionType = 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no';
export type EvaluationStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'expired';

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  imageUrl?: string; // RF-16: Para preguntas con imagen
  order: number;
  score?: number; // Puntaje que otorga esta pregunta
}

export interface Evaluation {
  id: string;
  courseId: string;
  courseName: string;
  courseType?: 'standard' | 'certified' | 'survey'; // FAL-004: Tipo de capacitación para UI diferenciada
  description: string;
  questions: Question[];
  questionsCount: number;
  durationMinutes: number;
  minimumScore: number; // RF-19: Porcentaje mínimo configurable
  status: EvaluationStatus;
  attemptsAllowed: number; // RF-21: Número de intentos permitidos
  attemptsRemaining?: number;
  lastAttempt?: {
    date: string;
    score: number;
    passed: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface EvaluationAttempt {
  id: string;
  evaluationId: string;
  userId: string;
  answers: Record<string, string | string[]>;
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpentMinutes: number;
}

export interface EvaluationStatistics {
  total: number;
  pending: number;
  inProgress: number;
  passed: number;
  failed: number;
  byCourse: Record<string, number>;
}

export interface EvaluationFilters {
  search?: string;
  courseId?: string | null;
  status?: EvaluationStatus | null;
  questionType?: QuestionType | null;
}

export interface EvaluationListParams {
  page?: number;
  limit?: number;
  filters?: EvaluationFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

