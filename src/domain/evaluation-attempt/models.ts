/**
 * Modelos de dominio para intentos de evaluación
 * Sigue el principio de Responsabilidad Única (SOLID)
 */

export interface EvaluationAttempt {
  id: number;
  evaluacionId: number;
  inscripcionId: number;
  numeroIntento: number;
  fechaInicio: string;
  fechaFinalizacion?: string;
  puntajeObtenido: number;
  puntajeTotal: number;
  porcentaje?: number;
  aprobado?: boolean;
  tiempoUtilizadoMinutos?: number;
  estado: 'en_progreso' | 'completado' | 'abandonado';
}

export interface EvaluationAttemptResult {
  id: number;
  evaluacionId: number;
  numeroIntento: number;
  puntajeObtenido: number;
  puntajeTotal: number;
  porcentaje: number;
  aprobado: boolean;
  tiempoUtilizadoMinutos: number;
  fechaFinalizacion: string;
}

export interface SubmitAnswerData {
  preguntaId: number;
  opcionRespuestaId?: number;
  opcionRespuestaIds?: number[];
  textoRespuesta?: string;
}

