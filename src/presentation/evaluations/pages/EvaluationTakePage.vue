<template>
  <q-page class="evaluation-take-page q-pa-xl">
    <q-inner-loading :showing="loading" />

    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">
          {{ evaluation.courseName }}
        </div>
        <div class="text-body1 text-grey-7">{{ evaluation.description }}</div>
      </div>
      <div class="row items-center q-gutter-md">
        <div v-if="!evaluationCompleted && !reviewMode" class="row items-center q-gutter-sm">
          <q-icon name="schedule" size="20px" color="primary" />
          <div class="text-body2 text-weight-medium" :class="timeWarningClass">
            {{ formatTime(timeRemaining) }}
          </div>
        </div>
        <q-btn flat label="Cancelar" icon="close" @click="confirmCancel" />
      </div>
    </div>

    <!-- Progress Bar -->
    <q-card v-if="!evaluationCompleted" flat bordered class="q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-medium">
            Pregunta {{ currentQuestionIndex + 1 }} de {{ questions.length }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ Math.round(progress * 100) }}% completado
          </div>
        </div>
        <q-linear-progress
          :value="progress"
          rounded
          size="24px"
          color="primary"
          class="q-mb-xs"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="primary" :label="`${Math.round(progress * 100)}%`" />
          </div>
        </q-linear-progress>
        <div class="row items-center justify-between q-mt-sm">
          <div class="text-caption text-grey-6">
            <q-icon name="check_circle" size="14px" class="q-mr-xs" />
            {{ answeredCount }} de {{ questions.length }} respondidas
          </div>
          <div v-if="evaluation.attemptsRemaining !== undefined" class="text-caption text-grey-6">
            <q-icon name="refresh" size="14px" class="q-mr-xs" />
            Intentos restantes: {{ evaluation.attemptsRemaining }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Review Mode Header -->
    <q-card v-if="reviewMode && !evaluationCompleted" flat bordered class="q-mb-lg bg-info-1">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon name="preview" size="24px" color="info" />
          <div class="col">
            <div class="text-subtitle2 text-weight-medium">Modo de Revisión</div>
            <div class="text-body2 text-grey-7">
              Revisa tus respuestas antes de enviar la evaluación. Puedes modificar cualquier
              respuesta.
            </div>
          </div>
          <q-btn
            flat
            color="primary"
            label="Salir de Revisión"
            @click="reviewMode = false"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Question Card -->
    <q-card v-if="!evaluationCompleted" flat bordered class="question-card">
      <transition name="question-fade" mode="out-in">
        <q-card-section :key="currentQuestionIndex" class="q-pa-xl">
          <div v-if="currentQuestion" class="column q-gutter-lg">
            <!-- Question Header -->
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">{{ currentQuestion.text }}</div>
              <q-badge
                v-if="reviewMode"
                :color="isQuestionAnswered(currentQuestion.id) ? 'positive' : 'warning'"
                outline
              >
                {{ isQuestionAnswered(currentQuestion.id) ? 'Respondida' : 'Sin responder' }}
              </q-badge>
            </div>

            <!-- Question Image (RF-16) -->
            <div v-if="currentQuestion.imageUrl" class="question-image-container">
              <q-img
                :src="currentQuestion.imageUrl"
                :ratio="16 / 9"
                class="rounded-borders"
                fit="contain"
              />
            </div>

            <!-- Type: Única respuesta -->
            <div v-if="currentQuestion.type === 'single'" class="column q-gutter-sm">
              <q-radio
                v-for="option in currentQuestion.options"
                :key="option.id"
                v-model="currentAnswer"
                :val="option.id"
                :label="option.text"
                color="primary"
                class="option-radio"
                :class="{
                  'option-correct': reviewMode && option.isCorrect,
                  'option-incorrect':
                    reviewMode && !option.isCorrect && currentAnswer === option.id,
                }"
              />
            </div>

            <!-- Type: Múltiple respuesta -->
            <div v-if="currentQuestion.type === 'multiple'" class="column q-gutter-sm">
              <q-checkbox
                v-for="option in currentQuestion.options"
                :key="option.id"
                v-model="currentAnswer"
                :val="option.id"
                :label="option.text"
                color="primary"
                class="option-checkbox"
                :class="{
                  'option-correct': reviewMode && option.isCorrect,
                  'option-incorrect':
                    reviewMode && !option.isCorrect && currentAnswer.includes(option.id),
                }"
              />
            </div>

            <!-- Type: Selección de imagen -->
            <div v-if="currentQuestion.type === 'image'" class="row q-col-gutter-md">
              <div
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="col-6 col-md-4"
              >
                <q-card
                  class="image-option-card cursor-pointer"
                  :class="{
                    'option-selected': currentAnswer === option.id,
                    'option-correct': reviewMode && option.isCorrect,
                    'option-incorrect':
                      reviewMode && !option.isCorrect && currentAnswer === option.id,
                  }"
                  @click="currentAnswer = option.id"
                >
                  <q-img
                    v-if="option.imageUrl"
                    :src="option.imageUrl"
                    :ratio="16 / 9"
                    class="rounded-borders-top"
                  />
                  <q-card-section class="text-center">
                    <div class="text-body2">{{ option.text }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Type: Falso/Verdadero -->
            <div v-if="currentQuestion.type === 'true_false'" class="row q-gutter-sm">
              <q-btn
                :color="currentAnswer === 'true' ? 'primary' : 'grey-7'"
                :outline="currentAnswer !== 'true'"
                :unelevated="currentAnswer === 'true'"
                label="Verdadero"
                class="col"
                size="lg"
                :class="{
                  'option-correct': reviewMode && currentQuestion.options[0]?.isCorrect,
                  'option-incorrect':
                    reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'true',
                }"
                @click="currentAnswer = 'true'"
              />
              <q-btn
                :color="currentAnswer === 'false' ? 'primary' : 'grey-7'"
                :outline="currentAnswer !== 'false'"
                :unelevated="currentAnswer === 'false'"
                label="Falso"
                class="col"
                size="lg"
                :class="{
                  'option-correct': reviewMode && currentQuestion.options[1]?.isCorrect,
                  'option-incorrect':
                    reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'false',
                }"
                @click="currentAnswer = 'false'"
              />
            </div>

            <!-- Type: Sí/No -->
            <div v-if="currentQuestion.type === 'yes_no'" class="row q-gutter-sm">
              <q-btn
                :color="currentAnswer === 'yes' ? 'primary' : 'grey-7'"
                :outline="currentAnswer !== 'yes'"
                :unelevated="currentAnswer === 'yes'"
                label="Sí"
                class="col"
                size="lg"
                :class="{
                  'option-correct': reviewMode && currentQuestion.options[0]?.isCorrect,
                  'option-incorrect':
                    reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'yes',
                }"
                @click="currentAnswer = 'yes'"
              />
              <q-btn
                :color="currentAnswer === 'no' ? 'primary' : 'grey-7'"
                :outline="currentAnswer !== 'no'"
                :unelevated="currentAnswer === 'no'"
                label="No"
                class="col"
                size="lg"
                :class="{
                  'option-correct': reviewMode && currentQuestion.options[1]?.isCorrect,
                  'option-incorrect':
                    reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'no',
                }"
                @click="currentAnswer = 'no'"
              />
            </div>

            <!-- Navigation -->
            <div class="row justify-between q-mt-xl">
              <q-btn
                flat
                label="Anterior"
                icon="arrow_back"
                :disable="currentQuestionIndex === 0"
                @click="previousQuestion"
              />
              <div class="row q-gutter-sm">
                <q-btn
                  v-if="currentQuestionIndex < questions.length - 1"
                  color="primary"
                  unelevated
                  label="Siguiente"
                  icon-right="arrow_forward"
                  :disable="!isCurrentQuestionAnswered"
                  @click="nextQuestion"
                />
                <q-btn
                  v-else-if="!reviewMode"
                  color="info"
                  unelevated
                  label="Revisar"
                  icon="preview"
                  @click="enterReviewMode"
                />
                <q-btn
                  v-else
                  color="positive"
                  unelevated
                  label="Enviar Evaluación"
                  icon="check"
                  :disable="!allQuestionsAnswered"
                  @click="submitEvaluation"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </transition>
    </q-card>

    <!-- Result Card -->
    <q-card v-else flat bordered class="result-card">
      <q-card-section class="q-pa-xl text-center">
        <transition name="result-fade">
          <div :key="passed ? 'passed' : 'failed'">
            <q-icon
              :name="passed ? 'check_circle' : 'cancel'"
              :color="passed ? 'positive' : 'negative'"
              size="120px"
              class="q-mb-md"
            />
            <div class="text-h3 text-weight-bold q-mb-sm">
              {{ passed ? '¡Felicidades!' : 'Evaluación no aprobada' }}
            </div>
            <div class="text-h5 text-grey-7 q-mb-lg">
              Tu puntuación: <span class="text-weight-bold">{{ finalScore }}%</span> (Mínimo
              requerido: {{ evaluation.minimumScore }}%)
            </div>

            <!-- Score Breakdown -->
            <q-card flat bordered class="q-mb-lg q-mt-lg">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md text-weight-medium">Desglose de Resultados</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <div class="text-h6 text-weight-bold text-positive">
                      {{ correctAnswers }}
                    </div>
                    <div class="text-caption text-grey-6">Correctas</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-h6 text-weight-bold text-negative">
                      {{ incorrectAnswers }}
                    </div>
                    <div class="text-caption text-grey-6">Incorrectas</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-h6 text-weight-bold text-grey-7">
                      {{ unansweredCount }}
                    </div>
                    <div class="text-caption text-grey-6">Sin responder</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="text-body1 q-mb-xl">
              {{
                passed
                  ? 'Has aprobado la evaluación. Puedes descargar tu certificado.'
                  : evaluation.attemptsRemaining && evaluation.attemptsRemaining > 0
                    ? `Puedes reintentar la evaluación. Te quedan ${evaluation.attemptsRemaining} intento(s).`
                    : 'Has agotado todos los intentos disponibles.'
              }}
            </div>
            <div class="row justify-center q-gutter-sm">
              <q-btn
                v-if="passed"
                color="primary"
                unelevated
                size="lg"
                label="Descargar Certificado"
                icon="download"
                @click="downloadCertificate"
              />
              <q-btn
                v-else-if="evaluation.attemptsRemaining && evaluation.attemptsRemaining > 0"
                color="primary"
                unelevated
                size="lg"
                label="Reintentar"
                icon="refresh"
                @click="retryEvaluation"
              />
              <q-btn
                flat
                size="lg"
                label="Volver a Evaluaciones"
                @click="goBack"
              />
            </div>
          </div>
        </transition>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Evaluation, Question } from '../../../domain/evaluation/models';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Estado
const loading = ref(false);
const evaluationId = route.params.id as string;
const currentQuestionIndex = ref(0);
const answers = ref<Record<string, string | string[]>>({});
const evaluationCompleted = ref(false);
const finalScore = ref(0);
const reviewMode = ref(false);
const timeRemaining = ref(0); // en segundos
const timerInterval = ref<number | null>(null);

const evaluation = ref<Evaluation>({
  id: evaluationId,
  courseId: '1',
  courseName: 'Manejo Defensivo',
  description: 'Evaluación sobre técnicas de manejo defensivo',
  questions: [],
  questionsCount: 0,
  durationMinutes: 30,
  minimumScore: 70,
  status: 'in_progress',
  attemptsAllowed: 2,
  attemptsRemaining: 2,
  createdAt: '2025-01-15',
});

const questions = ref<Question[]>([
  {
    id: 'q1',
    text: '¿Cuál es la distancia mínima recomendada para mantener con el vehículo de adelante?',
    type: 'single',
    options: [
      { id: 'o1', text: '2 segundos', isCorrect: false },
      { id: 'o2', text: '3 segundos', isCorrect: true },
      { id: 'o3', text: '1 segundo', isCorrect: false },
      { id: 'o4', text: '5 segundos', isCorrect: false },
    ],
    order: 1,
  },
  {
    id: 'q2',
    text: 'Selecciona las técnicas de manejo defensivo correctas:',
    type: 'multiple',
    options: [
      { id: 'o5', text: 'Mantener distancia adecuada', isCorrect: true },
      { id: 'o6', text: 'Anticipar situaciones de riesgo', isCorrect: true },
      { id: 'o7', text: 'Acelerar en curvas', isCorrect: false },
      { id: 'o8', text: 'Revisar espejos constantemente', isCorrect: true },
    ],
    order: 2,
  },
  {
    id: 'q3',
    text: '¿Es correcto usar el celular mientras se conduce?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Verdadero', isCorrect: false },
      { id: 'false', text: 'Falso', isCorrect: true },
    ],
    order: 3,
  },
  {
    id: 'q4',
    text: '¿Debes usar el cinturón de seguridad siempre?',
    type: 'yes_no',
    options: [
      { id: 'yes', text: 'Sí', isCorrect: true },
      { id: 'no', text: 'No', isCorrect: false },
    ],
    order: 4,
  },
]);

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

const currentAnswer = computed({
  get: () => {
    const question = currentQuestion.value;
    if (!question) return '';
    const questionId = question.id;
    return answers.value[questionId] ?? (question.type === 'multiple' ? [] : '');
  },
  set: (val) => {
    const question = currentQuestion.value;
    if (question) {
      answers.value[question.id] = val;
    }
  },
});

const progress = computed(() => (currentQuestionIndex.value + 1) / questions.value.length);

const answeredCount = computed(() => {
  return questions.value.filter((q) => isQuestionAnswered(q.id)).length;
});

const allQuestionsAnswered = computed(() => {
  return questions.value.every((q) => isQuestionAnswered(q.id));
});

const isCurrentQuestionAnswered = computed(() => {
  return isQuestionAnswered(currentQuestion.value?.id ?? '');
});

const passed = computed(() => finalScore.value >= evaluation.value.minimumScore);

const correctAnswers = computed(() => {
  let count = 0;
  questions.value.forEach((question) => {
    const answer = answers.value[question.id];
    if (question.type === 'multiple') {
      const selected = answer as string[];
      const correct = question.options.filter((o) => o.isCorrect).map((o) => o.id);
      if (
        selected.length === correct.length &&
        selected.every((id) => correct.includes(id))
      ) {
        count++;
      }
    } else {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (answer === correctOption?.id) {
        count++;
      }
    }
  });
  return count;
});

const incorrectAnswers = computed(() => {
  return answeredCount.value - correctAnswers.value;
});

const unansweredCount = computed(() => {
  return questions.value.length - answeredCount.value;
});

const timeWarningClass = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  if (minutes < 5) return 'text-negative';
  if (minutes < 10) return 'text-warning';
  return 'text-primary';
});

// Funciones
function isQuestionAnswered(questionId: string): boolean {
  const answer = answers.value[questionId];
  if (!answer) return false;
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  return answer !== '';
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}

function enterReviewMode() {
  reviewMode.value = true;
  currentQuestionIndex.value = 0;
}

function submitEvaluation() {
  // Calcular puntuación
  let correctCount = 0;
  questions.value.forEach((question) => {
    const answer = answers.value[question.id];
    if (question.type === 'multiple') {
      const selected = answer as string[];
      const correct = question.options.filter((o) => o.isCorrect).map((o) => o.id);
      if (
        selected.length === correct.length &&
        selected.every((id) => correct.includes(id))
      ) {
        correctCount++;
      }
    } else {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (answer === correctOption?.id) {
        correctCount++;
      }
    }
  });

  finalScore.value = Math.round((correctCount / questions.value.length) * 100);
  evaluationCompleted.value = true;
  stopTimer();

  // Aquí se llamaría al servicio HTTP para guardar el intento
  console.log('Evaluación completada:', {
    evaluationId,
    score: finalScore.value,
    answers: answers.value,
  });
}

function downloadCertificate() {
  // Aquí se llamaría al servicio HTTP para descargar el certificado
  console.log('Descargar certificado para evaluación:', evaluationId);
  $q.notify({
    type: 'positive',
    message: 'Certificado descargado exitosamente',
    position: 'top',
  });
}

function retryEvaluation() {
  currentQuestionIndex.value = 0;
  answers.value = {};
  evaluationCompleted.value = false;
  finalScore.value = 0;
  reviewMode.value = false;
  if (evaluation.value.attemptsRemaining !== undefined) {
    evaluation.value.attemptsRemaining--;
  }
  startTimer();
}

function confirmCancel() {
  $q.dialog({
    title: 'Confirmar cancelación',
    message: '¿Estás seguro de que deseas cancelar la evaluación? Tu progreso se perderá.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    stopTimer();
    void router.push('/evaluations');
  });
}

function goBack() {
  void router.push('/evaluations');
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
  timeRemaining.value = evaluation.value.durationMinutes * 60;
  timerInterval.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      stopTimer();
      $q.dialog({
        title: 'Tiempo agotado',
        message: 'Se ha agotado el tiempo para completar la evaluación.',
        persistent: true,
      }).onOk(() => {
        submitEvaluation();
      });
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

// Watchers
watch(
  () => currentQuestionIndex.value,
  () => {
    // Scroll to top cuando cambia la pregunta
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
);

// Lifecycle
onMounted(() => {
  loading.value = true;
  // Simular carga de datos
  setTimeout(() => {
    evaluation.value.questionsCount = questions.value.length;
    loading.value = false;
    startTimer();
  }, 500);
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped lang="scss">
.evaluation-take-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .evaluation-take-page {
  background: #0f172a;
}

.question-card {
  transition: box-shadow 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.result-card {
  max-width: 800px;
  margin: 0 auto;
}

.question-image-container {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.option-radio,
.option-checkbox {
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.option-radio:hover,
.option-checkbox:hover {
  background: rgba(79, 70, 229, 0.05);
}

body.body--dark .option-radio:hover,
body.body--dark .option-checkbox:hover {
  background: rgba(79, 70, 229, 0.15);
}

.option-correct {
  background: rgba(34, 197, 94, 0.1) !important;
  border-left: 4px solid #22c55e;
}

.option-incorrect {
  background: rgba(239, 68, 68, 0.1) !important;
  border-left: 4px solid #ef4444;
}

.image-option-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.image-option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.option-selected {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

// Animaciones
.question-fade-enter-active,
.question-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.question-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.question-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.result-fade-enter-active,
.result-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.result-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.result-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
