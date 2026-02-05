/**
 * Composable para gestionar intentos de evaluación
 * Sigue principios SOLID y arquitectura hexagonal
 * Implementa auto-guardado y control de tiempo
 */

import { ref, computed, onUnmounted, type Ref } from 'vue';

/** Extrae mensaje de un error unknown (Error o respuesta API) */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data
      ?.message;
    if (data) return Array.isArray(data) ? data.join(', ') : data;
  }
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}
import { useQuasar } from 'quasar';
import { evaluationAttemptsService } from '../../infrastructure/http/evaluation-attempts/evaluation-attempts.service';
import { inscriptionsService } from '../../infrastructure/http/inscriptions/inscriptions.service';
import { useAuthStore } from '../../stores/auth.store';
import type {
  EvaluationAttempt,
  EvaluationAttemptResult,
  SubmitAnswerData,
} from '../../domain/evaluation-attempt/models';

export interface UseEvaluationAttemptOptions {
  evaluacionId: number | Ref<number>;
  capacitacionId: number | Ref<number>;
  tiempoLimiteMinutos?: number | Ref<number>;
  autoSaveInterval?: number; // Intervalo en segundos para auto-guardado
}

export interface UseEvaluationAttemptReturn {
  // Estado
  attempt: Ref<EvaluationAttempt | null>;
  isStarting: Ref<boolean>;
  isSaving: Ref<boolean>;
  isFinishing: Ref<boolean>;
  timeRemaining: Ref<number>; // en segundos
  autoSaveEnabled: Ref<boolean>;
  evaluacionId: Ref<number>;
  capacitacionId: Ref<number>;
  tiempoLimiteMinutos: Ref<number>;
  inscripcionId: Ref<number | null>;

  // Computed
  hasActiveAttempt: Ref<boolean>;
  canStartAttempt: Ref<boolean>;
  isTimeRunning: Ref<boolean>;

  // Métodos
  startAttempt: () => Promise<void>;
  saveAnswer: (answer: SubmitAnswerData) => Promise<void>;
  finishAttempt: () => Promise<EvaluationAttemptResult | null>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  getInscripcionId: () => Promise<number | null>;
}

/**
 * Composable para gestionar intentos de evaluación
 * Proporciona funcionalidad completa para iniciar, guardar respuestas y finalizar intentos
 */
export function useEvaluationAttempt(
  options: UseEvaluationAttemptOptions,
): UseEvaluationAttemptReturn {
  const $q = useQuasar();
  const authStore = useAuthStore();

  // Estado
  const attempt = ref<EvaluationAttempt | null>(null);
  const isStarting = ref(false);
  const isSaving = ref(false);
  const isFinishing = ref(false);
  const timeRemaining = ref(0);
  const autoSaveEnabled = ref(true);
  const inscripcionId = ref<number | null>(null);

  // Opciones reactivas
  const evaluacionId =
    typeof options.evaluacionId === 'number' ? ref(options.evaluacionId) : options.evaluacionId;
  const capacitacionId =
    typeof options.capacitacionId === 'number'
      ? ref(options.capacitacionId)
      : options.capacitacionId;
  const tiempoLimiteMinutos = options.tiempoLimiteMinutos
    ? typeof options.tiempoLimiteMinutos === 'number'
      ? ref(options.tiempoLimiteMinutos)
      : options.tiempoLimiteMinutos
    : ref(0);

  // Timers
  let timerInterval: number | null = null;
  let autoSaveInterval: number | null = null;
  const autoSaveQueue = ref<SubmitAnswerData[]>([]);

  // Computed
  const hasActiveAttempt = computed(() => {
    return attempt.value !== null && attempt.value.estado === 'en_progreso';
  });

  const canStartAttempt = computed(() => {
    return !hasActiveAttempt.value && !isStarting.value;
  });

  const isTimeRunning = computed(() => {
    return timeRemaining.value > 0 && hasActiveAttempt.value;
  });

  /**
   * Obtener la inscripción del usuario para la capacitación
   */
  async function getInscripcionId(): Promise<number | null> {
    if (inscripcionId.value) {
      return inscripcionId.value;
    }

    try {
      // Intentar obtener personaId del perfil, con fallback a persona.id
      const personaId = authStore.profile?.personaId || authStore.profile?.persona?.id;
      if (!personaId) {
        console.error('No se pudo obtener el personaId del perfil:', authStore.profile);
        throw new Error(
          'No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.',
        );
      }

      const inscripciones = await inscriptionsService.findByUser(personaId.toString());

      // Usar capacitacionId.value en lugar de options.capacitacionId
      const capacitacionIdValue =
        typeof capacitacionId.value === 'number'
          ? capacitacionId.value
          : parseInt(String(capacitacionId.value));

      if (isNaN(capacitacionIdValue)) {
        throw new Error('ID de capacitación inválido');
      }

      const inscripcion = inscripciones.find(
        (ins) => parseInt(ins.courseId) === capacitacionIdValue,
      );

      if (!inscripcion) {
        console.error('No se encontró inscripción para capacitación:', capacitacionIdValue);
        console.error(
          'Inscripciones disponibles:',
          inscripciones.map((ins) => ({ id: ins.id, courseId: ins.courseId })),
        );
        throw new Error('No estás inscrito en esta capacitación');
      }

      inscripcionId.value = parseInt(inscripcion.id);
      return inscripcionId.value;
    } catch (err: unknown) {
      console.error('Error al obtener inscripción:', err);
      const errorMessage = getErrorMessage(
        err,
        'Error al obtener tu inscripción. Por favor, intenta nuevamente.',
      );
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      });
      return null;
    }
  }

  /**
   * Iniciar un nuevo intento de evaluación
   */
  async function startAttempt(): Promise<void> {
    if (!canStartAttempt.value) {
      return;
    }

    isStarting.value = true;
    try {
      const inscripcion = await getInscripcionId();
      if (!inscripcion) {
        return;
      }

      const newAttempt = await evaluationAttemptsService.startAttempt(
        evaluacionId.value,
        inscripcion,
      );

      attempt.value = newAttempt;

      // Iniciar timer si hay tiempo límite
      if (tiempoLimiteMinutos.value && tiempoLimiteMinutos.value > 0) {
        timeRemaining.value = tiempoLimiteMinutos.value * 60;
        startTimer();
      }

      // Iniciar auto-guardado
      if (autoSaveEnabled.value) {
        startAutoSave();
      }

      $q.notify({
        type: 'positive',
        message: 'Evaluación iniciada. ¡Buena suerte!',
        icon: 'play_arrow',
        position: 'top',
      });
    } catch (err: unknown) {
      console.error('Error al iniciar intento:', err);
      const message = getErrorMessage(
        err,
        'Error al iniciar la evaluación. Por favor, intenta nuevamente.',
      );
      $q.notify({
        type: 'negative',
        message,
        icon: 'error',
        position: 'top',
      });
    } finally {
      isStarting.value = false;
    }
  }

  /**
   * Guardar una respuesta del estudiante
   */
  async function saveAnswer(answerData: SubmitAnswerData): Promise<void> {
    if (!hasActiveAttempt.value || !attempt.value) {
      return;
    }

    isSaving.value = true;
    try {
      await evaluationAttemptsService.saveAnswer(evaluacionId.value, attempt.value.id, answerData);
    } catch (err: unknown) {
      console.error('Error al guardar respuesta:', err);
      // No mostrar notificación para auto-guardado silencioso
      // Solo loguear el error
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Finalizar un intento de evaluación
   */
  async function finishAttempt(): Promise<EvaluationAttemptResult | null> {
    if (!hasActiveAttempt.value || !attempt.value) {
      return null;
    }

    isFinishing.value = true;
    try {
      stopTimer();
      stopAutoSave();

      const result = await evaluationAttemptsService.finishAttempt(
        evaluacionId.value,
        attempt.value.id,
      );

      // Actualizar el intento con el resultado
      if (attempt.value) {
        attempt.value = {
          ...attempt.value,
          estado: 'completado',
          puntajeObtenido: result.puntajeObtenido,
          porcentaje: result.porcentaje,
          aprobado: result.aprobado,
          fechaFinalizacion: result.fechaFinalizacion,
        };
      }

      $q.notify({
        type: result.aprobado ? 'positive' : 'warning',
        message: result.aprobado
          ? `¡Felicidades! Aprobaste con ${result.porcentaje.toFixed(1)}%`
          : `No aprobaste. Obtuviste ${result.porcentaje.toFixed(1)}%`,
        icon: result.aprobado ? 'check_circle' : 'cancel',
        position: 'top',
        timeout: 5000,
      });

      return result;
    } catch (err: unknown) {
      console.error('Error al finalizar intento:', err);
      const message = getErrorMessage(
        err,
        'Error al finalizar la evaluación. Por favor, intenta nuevamente.',
      );
      $q.notify({
        type: 'negative',
        message,
        icon: 'error',
        position: 'top',
      });
      return null;
    } finally {
      isFinishing.value = false;
    }
  }

  /**
   * Iniciar el timer de tiempo restante
   */
  function startTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerInterval = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        // Tiempo agotado - finalizar automáticamente
        stopTimer();
        void finishAttempt();
        $q.notify({
          type: 'warning',
          message: 'Tiempo agotado. La evaluación se ha finalizado automáticamente.',
          icon: 'schedule',
          position: 'top',
        });
      }
    }, 1000);
  }

  /**
   * Pausar el timer
   */
  function pauseTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Reanudar el timer
   */
  function resumeTimer(): void {
    if (timeRemaining.value > 0 && hasActiveAttempt.value) {
      startTimer();
    }
  }

  /**
   * Detener el timer
   */
  function stopTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Iniciar auto-guardado de respuestas
   */
  function startAutoSave(): void {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }

    const interval = (options.autoSaveInterval ?? 30) * 1000; // Default 30 segundos

    autoSaveInterval = window.setInterval(() => {
      void (async () => {
        if (autoSaveQueue.value.length > 0 && hasActiveAttempt.value) {
          const answersToSave = [...autoSaveQueue.value];
          autoSaveQueue.value = [];

          for (const answer of answersToSave) {
            await saveAnswer(answer);
          }
        }
      })();
    }, interval);
  }

  /**
   * Detener auto-guardado
   */
  function stopAutoSave(): void {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
  }

  /**
   * Habilitar auto-guardado
   */
  function enableAutoSave(): void {
    autoSaveEnabled.value = true;
    if (hasActiveAttempt.value) {
      startAutoSave();
    }
  }

  /**
   * Deshabilitar auto-guardado
   */
  function disableAutoSave(): void {
    autoSaveEnabled.value = false;
    stopAutoSave();
  }

  // Limpiar timers al desmontar
  onUnmounted(() => {
    stopTimer();
    stopAutoSave();
  });

  return {
    // Estado
    attempt,
    isStarting,
    isSaving,
    isFinishing,
    timeRemaining,
    autoSaveEnabled,
    evaluacionId,
    capacitacionId,
    tiempoLimiteMinutos,
    inscripcionId,

    // Computed
    hasActiveAttempt,
    canStartAttempt,
    isTimeRunning,

    // Métodos
    startAttempt,
    saveAnswer,
    finishAttempt,
    pauseTimer,
    resumeTimer,
    stopTimer,
    enableAutoSave,
    disableAutoSave,
    getInscripcionId,
  };
}
