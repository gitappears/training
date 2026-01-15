/**
 * Composable para gestionar la lógica de tipos de capacitación
 * Sigue principios SOLID y arquitectura hexagonal
 *
 * Responsabilidad única: Gestionar información y comportamiento según el tipo de capacitación
 */

import { computed, type ComputedRef } from 'vue';

export type TrainingType = 'standard' | 'certified' | 'survey';

export interface TrainingTypeInfo {
  label: string;
  value: TrainingType;
  description: string;
  icon: string;
  color: string;
  generatesCertificate: boolean;
  hasGrading: boolean;
  requiresEvaluation: boolean;
}

/**
 * Información completa de cada tipo de capacitación
 */
const TRAINING_TYPES: Record<TrainingType, TrainingTypeInfo> = {
  standard: {
    label: 'Capacitación Estándar',
    value: 'standard',
    description: 'Capacitación con evaluación y calificación, pero sin certificado',
    icon: 'school',
    color: 'primary',
    generatesCertificate: false,
    hasGrading: true,
    requiresEvaluation: true,
  },
  certified: {
    label: 'Capacitación Certificada',
    value: 'certified',
    description: 'Capacitación con evaluación, calificación y certificado al aprobar',
    icon: 'verified',
    color: 'positive',
    generatesCertificate: true,
    hasGrading: true,
    requiresEvaluation: true,
  },
  survey: {
    label: 'Encuesta',
    value: 'survey',
    description: 'Encuesta sin calificación ni certificado. Solo recopila respuestas',
    icon: 'poll',
    color: 'info',
    generatesCertificate: false,
    hasGrading: false,
    requiresEvaluation: true,
  },
};

/**
 * Opciones para el selector de tipos
 */
export const TRAINING_TYPE_OPTIONS = Object.values(TRAINING_TYPES).map((type) => ({
  label: type.label,
  value: type.value,
}));

/**
 * Resultado del composable
 */
export interface UseTrainingTypeReturn {
  /**
   * Información del tipo de capacitación actual
   */
  typeInfo: ComputedRef<TrainingTypeInfo | null>;

  /**
   * Indica si el tipo genera certificado
   */
  generatesCertificate: ComputedRef<boolean>;

  /**
   * Indica si el tipo tiene calificación
   */
  hasGrading: ComputedRef<boolean>;

  /**
   * Indica si el tipo requiere evaluación
   */
  requiresEvaluation: ComputedRef<boolean>;

  /**
   * Obtiene información de un tipo específico
   */
  getTypeInfo: (type: TrainingType | null) => TrainingTypeInfo | null;

  /**
   * Obtiene el título del paso 3 según el tipo
   */
  getStep3Title: (type: TrainingType | null) => string;

  /**
   * Obtiene el icono del paso 3 según el tipo
   */
  getStep3Icon: (type: TrainingType | null) => string;

  /**
   * Obtiene la clase CSS del banner según el tipo
   */
  getBannerClass: (type: TrainingType | null) => string;
}

/**
 * Composable para gestionar tipos de capacitación
 *
 * @param type - Tipo de capacitación actual (puede ser null)
 * @returns Funciones y computed properties para trabajar con tipos
 */
export function useTrainingType(type: () => TrainingType | null): UseTrainingTypeReturn {
  /**
   * Información del tipo actual
   */
  const typeInfo = computed(() => {
    const currentType = type();
    return currentType ? TRAINING_TYPES[currentType] : null;
  });

  /**
   * Indica si genera certificado
   */
  const generatesCertificate = computed(() => {
    return typeInfo.value?.generatesCertificate ?? false;
  });

  /**
   * Indica si tiene calificación
   */
  const hasGrading = computed(() => {
    return typeInfo.value?.hasGrading ?? false;
  });

  /**
   * Indica si requiere evaluación
   */
  const requiresEvaluation = computed(() => {
    return typeInfo.value?.requiresEvaluation ?? true;
  });

  /**
   * Obtiene información de un tipo específico
   */
  function getTypeInfo(typeValue: TrainingType | null): TrainingTypeInfo | null {
    if (!typeValue) return null;
    return TRAINING_TYPES[typeValue] ?? null;
  }

  /**
   * Obtiene el título del paso 3 según el tipo
   */
  function getStep3Title(typeValue: TrainingType | null): string {
    if (typeValue === 'survey') {
      return 'Configurar Encuesta';
    }
    return 'Configurar Evaluación';
  }

  /**
   * Obtiene el icono del paso 3 según el tipo
   */
  function getStep3Icon(typeValue: TrainingType | null): string {
    if (typeValue === 'survey') {
      return 'poll';
    }
    return 'quiz';
  }

  /**
   * Obtiene la clase CSS del banner según el tipo
   */
  function getBannerClass(typeValue: TrainingType | null): string {
    const info = getTypeInfo(typeValue);
    if (!info) return 'bg-grey-1 text-grey-8';
    return `bg-${info.color}-1 text-${info.color}`;
  }

  return {
    typeInfo,
    generatesCertificate,
    hasGrading,
    requiresEvaluation,
    getTypeInfo,
    getStep3Title,
    getStep3Icon,
    getBannerClass,
  };
}

