/**
 * Constantes y utilidades para tipos de capacitación
 * FASE 2: FAL-002 y FAL-006 - Mapeo consistente de tipos
 */

/**
 * Tipos de capacitación en el frontend (dominio)
 */
export type TrainingType = 'standard' | 'certified' | 'survey';

/**
 * Códigos de tipos de capacitación en el backend
 */
export const TRAINING_TYPE_CODES = {
  STANDARD: 'STANDARD',
  CERTIFIED: 'CERTIFIED',
  SURVEY: 'SURVEY',
} as const;

/**
 * Mapeo de IDs de tipos de capacitación (según seeder)
 * STANDARD = 1, CERTIFIED = 2, SURVEY = 3
 */
export const TRAINING_TYPE_IDS = {
  STANDARD: 1,
  CERTIFIED: 2,
  SURVEY: 3,
} as const;

/**
 * Mapeo de tipos del frontend a IDs del backend
 */
export const FRONTEND_TO_BACKEND_TYPE_ID: Record<TrainingType, number> = {
  standard: TRAINING_TYPE_IDS.STANDARD,
  certified: TRAINING_TYPE_IDS.CERTIFIED,
  survey: TRAINING_TYPE_IDS.SURVEY,
};

/**
 * Mapeo de IDs del backend a tipos del frontend
 */
export const BACKEND_TYPE_ID_TO_FRONTEND: Record<number, TrainingType> = {
  [TRAINING_TYPE_IDS.STANDARD]: 'standard',
  [TRAINING_TYPE_IDS.CERTIFIED]: 'certified',
  [TRAINING_TYPE_IDS.SURVEY]: 'survey',
};

/**
 * Mapeo de códigos del backend a tipos del frontend
 */
export const BACKEND_CODE_TO_FRONTEND: Record<string, TrainingType> = {
  [TRAINING_TYPE_CODES.STANDARD]: 'standard',
  [TRAINING_TYPE_CODES.CERTIFIED]: 'certified',
  [TRAINING_TYPE_CODES.SURVEY]: 'survey',
  // Variantes en español
  ESTANDAR: 'standard',
  CERTIFICADA: 'certified',
  ENCUESTA: 'survey',
};

/**
 * Mapeo de tipos del frontend a códigos del backend
 */
export const FRONTEND_TO_BACKEND_CODE: Record<TrainingType, string> = {
  standard: TRAINING_TYPE_CODES.STANDARD,
  certified: TRAINING_TYPE_CODES.CERTIFIED,
  survey: TRAINING_TYPE_CODES.SURVEY,
};

/**
 * Convierte un tipo del frontend a ID del backend
 * @param type Tipo de capacitación del frontend
 * @returns ID del tipo en el backend
 * @throws Error si el tipo no es válido
 */
export function mapTrainingTypeToId(type: TrainingType | null | undefined): number {
  if (!type) {
    throw new Error('Tipo de capacitación no especificado');
  }

  const id = FRONTEND_TO_BACKEND_TYPE_ID[type];
  if (!id) {
    throw new Error(`Tipo de capacitación inválido: ${type}`);
  }

  return id;
}

/**
 * Convierte un ID del backend a tipo del frontend
 * @param id ID del tipo en el backend
 * @returns Tipo de capacitación del frontend
 * @throws Error si el ID no es válido
 */
export function mapBackendTypeIdToFrontend(id: number | null | undefined): TrainingType {
  if (!id) {
    throw new Error('ID de tipo de capacitación no especificado');
  }

  const type = BACKEND_TYPE_ID_TO_FRONTEND[id];
  if (!type) {
    throw new Error(`ID de tipo de capacitación inválido: ${id}`);
  }

  return type;
}

/**
 * Convierte un código del backend a tipo del frontend
 * @param code Código del tipo en el backend (ej: 'STANDARD', 'CERTIFIED', 'SURVEY')
 * @returns Tipo de capacitación del frontend
 */
export function mapBackendCodeToFrontend(code: string | null | undefined): TrainingType {
  if (!code) {
    return 'standard'; // Default
  }

  const upperCode = code.toUpperCase();
  const type = BACKEND_CODE_TO_FRONTEND[upperCode];
  
  if (!type) {
    console.warn(`Código de tipo de capacitación no reconocido: ${code}, usando 'standard' por defecto`);
    return 'standard';
  }

  return type;
}

/**
 * Convierte un tipo del frontend a código del backend
 * @param type Tipo de capacitación del frontend
 * @returns Código del tipo en el backend
 */
export function mapFrontendToBackendCode(type: TrainingType | null | undefined): string {
  if (!type) {
    return TRAINING_TYPE_CODES.STANDARD; // Default
  }

  return FRONTEND_TO_BACKEND_CODE[type] || TRAINING_TYPE_CODES.STANDARD;
}

/**
 * Valida que un tipo de capacitación sea válido
 * @param type Tipo a validar
 * @returns true si el tipo es válido
 */
export function isValidTrainingType(type: string | null | undefined): type is TrainingType {
  if (!type) {
    return false;
  }
  return type === 'standard' || type === 'certified' || type === 'survey';
}

/**
 * Obtiene la etiqueta legible para un tipo de capacitación
 * @param type Tipo de capacitación
 * @returns Etiqueta legible
 */
export function getTrainingTypeLabel(type: TrainingType): string {
  const labels: Record<TrainingType, string> = {
    standard: 'Capacitación estándar',
    certified: 'Capacitación certificada',
    survey: 'Encuesta',
  };
  return labels[type] || type;
}

/**
 * Lista de opciones de tipos para selectores
 */
export const TRAINING_TYPE_OPTIONS: Array<{ label: string; value: TrainingType }> = [
  { label: getTrainingTypeLabel('standard'), value: 'standard' },
  { label: getTrainingTypeLabel('certified'), value: 'certified' },
  { label: getTrainingTypeLabel('survey'), value: 'survey' },
];

