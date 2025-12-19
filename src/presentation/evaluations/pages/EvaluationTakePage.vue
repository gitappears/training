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
            <div v-if="currentQuestion.type === 'single'" class="single-choice-options column q-gutter-md">
              <q-card
                v-for="option in currentQuestion.options"
                :key="option.id"
                flat
                bordered
                class="option-card cursor-pointer transition-all"
                :class="{
                  'option-selected': currentAnswer === option.id,
                  'option-correct': reviewMode && option.isCorrect,
                  'option-incorrect': reviewMode && !option.isCorrect && currentAnswer === option.id,
                }"
                @click="currentAnswer = option.id"
              >
                <q-card-section class="row items-center q-pa-md">
                  <q-radio
                    v-model="currentAnswer"
                    :val="option.id"
                    color="primary"
                    class="q-mr-md"
                  />
                  <div class="col text-body1">{{ option.text }}</div>
                  <q-icon
                    v-if="reviewMode && option.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="24px"
                    class="q-ml-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !option.isCorrect && currentAnswer === option.id"
                    name="cancel"
                    color="negative"
                    size="24px"
                    class="q-ml-sm"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Type: Múltiple respuesta -->
            <div v-if="currentQuestion.type === 'multiple'" class="multiple-choice-options column q-gutter-md">
              <q-card
                v-for="option in currentQuestion.options"
                :key="option.id"
                flat
                bordered
                class="option-card cursor-pointer transition-all"
                :class="{
                  'option-selected': Array.isArray(currentAnswer) && currentAnswer.includes(option.id),
                  'option-correct': reviewMode && option.isCorrect,
                  'option-incorrect': reviewMode && !option.isCorrect && Array.isArray(currentAnswer) && currentAnswer.includes(option.id),
                }"
                @click="toggleMultipleAnswer(option.id)"
              >
                <q-card-section class="row items-center q-pa-md">
                  <q-checkbox
                    :model-value="Array.isArray(currentAnswer) && currentAnswer.includes(option.id)"
                    color="primary"
                    class="q-mr-md"
                    @update:model-value="() => toggleMultipleAnswer(option.id)"
                  />
                  <div class="col text-body1">{{ option.text }}</div>
                  <q-icon
                    v-if="reviewMode && option.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="24px"
                    class="q-ml-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !option.isCorrect && Array.isArray(currentAnswer) && currentAnswer.includes(option.id)"
                    name="cancel"
                    color="negative"
                    size="24px"
                    class="q-ml-sm"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Type: Selección de imagen -->
            <div v-if="currentQuestion.type === 'image'" class="image-choice-options row q-col-gutter-md">
              <div
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="col-6 col-md-4"
              >
                <q-card
                  class="image-option-card cursor-pointer transition-all"
                  :class="{
                    'option-selected': currentAnswer === option.id,
                    'option-correct': reviewMode && option.isCorrect,
                    'option-incorrect': reviewMode && !option.isCorrect && currentAnswer === option.id,
                  }"
                  @click="currentAnswer = option.id"
                >
                  <div class="relative-position">
                    <q-img
                      v-if="option.imageUrl"
                      :src="option.imageUrl"
                      :ratio="16 / 9"
                      class="rounded-borders-top"
                    >
                      <div class="absolute-full flex flex-center bg-transparent">
                        <q-icon
                          v-if="currentAnswer === option.id"
                          name="check_circle"
                          color="white"
                          size="48px"
                          class="selection-indicator"
                        />
                        <q-icon
                          v-if="reviewMode && option.isCorrect"
                          name="check_circle"
                          color="positive"
                          size="48px"
                          class="correct-indicator"
                        />
                        <q-icon
                          v-if="reviewMode && !option.isCorrect && currentAnswer === option.id"
                          name="cancel"
                          color="negative"
                          size="48px"
                          class="incorrect-indicator"
                        />
                      </div>
                    </q-img>
                    <div v-else class="image-placeholder flex flex-center" style="height: 200px; background: rgba(0,0,0,0.05);">
                      <q-icon name="image" size="48px" color="grey-5" />
                    </div>
                  </div>
                  <q-card-section class="text-center q-pa-sm">
                    <div class="text-body2 text-weight-medium">{{ option.text }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Type: Falso/Verdadero -->
            <div v-if="currentQuestion.type === 'true_false'" class="true-false-options row q-gutter-md">
              <q-card
                flat
                bordered
                class="col true-false-card cursor-pointer transition-all"
                :class="{
                  'option-selected': currentAnswer === 'true',
                  'option-correct': reviewMode && currentQuestion.options[0]?.isCorrect,
                  'option-incorrect': reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'true',
                }"
                @click="currentAnswer = 'true'"
              >
                <q-card-section class="text-center q-pa-xl">
                  <q-icon
                    name="check"
                    size="64px"
                    :color="currentAnswer === 'true' ? 'primary' : 'grey-6'"
                    class="q-mb-md"
                  />
                  <div class="text-h6 text-weight-bold">Verdadero</div>
                  <q-icon
                    v-if="reviewMode && currentQuestion.options[0]?.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="32px"
                    class="q-mt-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'true'"
                    name="cancel"
                    color="negative"
                    size="32px"
                    class="q-mt-sm"
                  />
                </q-card-section>
              </q-card>
              <q-card
                flat
                bordered
                class="col true-false-card cursor-pointer transition-all"
                :class="{
                  'option-selected': currentAnswer === 'false',
                  'option-correct': reviewMode && currentQuestion.options[1]?.isCorrect,
                  'option-incorrect': reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'false',
                }"
                @click="currentAnswer = 'false'"
              >
                <q-card-section class="text-center q-pa-xl">
                  <q-icon
                    name="close"
                    size="64px"
                    :color="currentAnswer === 'false' ? 'primary' : 'grey-6'"
                    class="q-mb-md"
                  />
                  <div class="text-h6 text-weight-bold">Falso</div>
                  <q-icon
                    v-if="reviewMode && currentQuestion.options[1]?.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="32px"
                    class="q-mt-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'false'"
                    name="cancel"
                    color="negative"
                    size="32px"
                    class="q-mt-sm"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Type: Sí/No -->
            <div v-if="currentQuestion.type === 'yes_no'" class="yes-no-options row q-gutter-md">
              <q-card
                flat
                bordered
                class="col yes-no-card cursor-pointer transition-all"
                :class="{
                  'option-selected': currentAnswer === 'yes',
                  'option-correct': reviewMode && currentQuestion.options[0]?.isCorrect,
                  'option-incorrect': reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'yes',
                }"
                @click="currentAnswer = 'yes'"
              >
                <q-card-section class="text-center q-pa-xl">
                  <q-icon
                    name="thumb_up"
                    size="64px"
                    :color="currentAnswer === 'yes' ? 'primary' : 'grey-6'"
                    class="q-mb-md"
                  />
                  <div class="text-h6 text-weight-bold">Sí</div>
                  <q-icon
                    v-if="reviewMode && currentQuestion.options[0]?.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="32px"
                    class="q-mt-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !currentQuestion.options[0]?.isCorrect && currentAnswer === 'yes'"
                    name="cancel"
                    color="negative"
                    size="32px"
                    class="q-mt-sm"
                  />
                </q-card-section>
              </q-card>
              <q-card
                flat
                bordered
                class="col yes-no-card cursor-pointer transition-all"
                :class="{
                  'option-selected': currentAnswer === 'no',
                  'option-correct': reviewMode && currentQuestion.options[1]?.isCorrect,
                  'option-incorrect': reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'no',
                }"
                @click="currentAnswer = 'no'"
              >
                <q-card-section class="text-center q-pa-xl">
                  <q-icon
                    name="thumb_down"
                    size="64px"
                    :color="currentAnswer === 'no' ? 'primary' : 'grey-6'"
                    class="q-mb-md"
                  />
                  <div class="text-h6 text-weight-bold">No</div>
                  <q-icon
                    v-if="reviewMode && currentQuestion.options[1]?.isCorrect"
                    name="check_circle"
                    color="positive"
                    size="32px"
                    class="q-mt-sm"
                  />
                  <q-icon
                    v-if="reviewMode && !currentQuestion.options[1]?.isCorrect && currentAnswer === 'no'"
                    name="cancel"
                    color="negative"
                    size="32px"
                    class="q-mt-sm"
                  />
                </q-card-section>
              </q-card>
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

            <!-- Score Breakdown Mejorado -->
            <q-card flat bordered class="q-mb-lg q-mt-lg result-breakdown-card">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md text-weight-medium">Desglose Detallado de Resultados</div>

                <!-- Estadísticas principales con animación -->
                <div class="row q-col-gutter-md q-mb-lg">
                  <div class="col-12 col-md-3">
                    <q-card flat class="stat-card stat-correct text-center q-pa-md">
                      <div class="text-h4 text-weight-bold text-positive q-mb-xs">
                        {{ correctAnswers }}
                      </div>
                      <div class="text-body2 text-grey-7">Correctas</div>
                      <q-linear-progress
                        :value="correctAnswers / questions.length"
                        color="positive"
                        size="8px"
                        rounded
                        class="q-mt-sm"
                      />
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat class="stat-card stat-incorrect text-center q-pa-md">
                      <div class="text-h4 text-weight-bold text-negative q-mb-xs">
                        {{ incorrectAnswers }}
                      </div>
                      <div class="text-body2 text-grey-7">Incorrectas</div>
                      <q-linear-progress
                        :value="incorrectAnswers / questions.length"
                        color="negative"
                        size="8px"
                        rounded
                        class="q-mt-sm"
                      />
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat class="stat-card stat-unanswered text-center q-pa-md">
                      <div class="text-h4 text-weight-bold text-grey-7 q-mb-xs">
                        {{ unansweredCount }}
                      </div>
                      <div class="text-body2 text-grey-7">Sin responder</div>
                      <q-linear-progress
                        :value="unansweredCount / questions.length"
                        color="grey-6"
                        size="8px"
                        rounded
                        class="q-mt-sm"
                      />
                    </q-card>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-card flat class="stat-card stat-total text-center q-pa-md">
                      <div class="text-h4 text-weight-bold text-primary q-mb-xs">
                        {{ questions.length }}
                      </div>
                      <div class="text-body2 text-grey-7">Total</div>
                      <q-linear-progress
                        :value="1"
                        color="primary"
                        size="8px"
                        rounded
                        class="q-mt-sm"
                      />
                    </q-card>
                  </div>
                </div>

                <!-- Desglose por pregunta -->
                <q-separator class="q-mb-md" />
                <div class="text-subtitle2 q-mb-md text-weight-medium">Detalle por Pregunta</div>
                <div class="questions-breakdown column q-gutter-sm">
                  <q-card
                    v-for="(question, index) in questions"
                    :key="question.id"
                    flat
                    bordered
                    class="question-result-card"
                    :class="{
                      'question-correct': isQuestionCorrect(question.id),
                      'question-incorrect': isQuestionIncorrect(question.id),
                      'question-unanswered': !isQuestionAnswered(question.id),
                    }"
                  >
                    <q-card-section class="row items-center q-pa-md">
                      <div class="col-auto q-mr-md">
                        <q-avatar
                          :color="getQuestionResultColor(question.id)"
                          text-color="white"
                          size="32px"
                        >
                          {{ index + 1 }}
                        </q-avatar>
                      </div>
                      <div class="col">
                        <div class="text-body1 text-weight-medium q-mb-xs">
                          {{ question.text }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ getQuestionResultText(question.id) }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-icon
                          :name="getQuestionResultIcon(question.id)"
                          :color="getQuestionResultColor(question.id)"
                          size="24px"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
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

function toggleMultipleAnswer(optionId: string) {
  if (!Array.isArray(currentAnswer.value)) {
    currentAnswer.value = [];
  }
  const index = currentAnswer.value.indexOf(optionId);
  if (index > -1) {
    currentAnswer.value.splice(index, 1);
  } else {
    currentAnswer.value.push(optionId);
  }
}

function isQuestionCorrect(questionId: string): boolean {
  const question = questions.value.find((q) => q.id === questionId);
  if (!question) return false;
  const answer = answers.value[questionId];
  if (!answer) return false;

  if (question.type === 'multiple') {
    const selectedIds = Array.isArray(answer) ? answer : [];
    const correctIds = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);
    return (
      selectedIds.length === correctIds.length &&
      selectedIds.every((id) => correctIds.includes(id))
    );
  } else {
    const selectedId = Array.isArray(answer) ? answer[0] : answer;
    const correctOption = question.options.find((opt) => opt.isCorrect);
    return correctOption?.id === selectedId;
  }
}

function isQuestionIncorrect(questionId: string): boolean {
  return isQuestionAnswered(questionId) && !isQuestionCorrect(questionId);
}

function getQuestionResultColor(questionId: string): string {
  if (isQuestionCorrect(questionId)) return 'positive';
  if (isQuestionIncorrect(questionId)) return 'negative';
  return 'grey-6';
}

function getQuestionResultIcon(questionId: string): string {
  if (isQuestionCorrect(questionId)) return 'check_circle';
  if (isQuestionIncorrect(questionId)) return 'cancel';
  return 'help_outline';
}

function getQuestionResultText(questionId: string): string {
  if (isQuestionCorrect(questionId)) return 'Respuesta correcta';
  if (isQuestionIncorrect(questionId)) return 'Respuesta incorrecta';
  return 'Sin responder';
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

// Estilos mejorados para opciones
.single-choice-options,
.multiple-choice-options {
  .option-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: rgba(79, 70, 229, 0.3);
    }

    &.option-selected {
      border-color: #4f46e5;
      background: rgba(79, 70, 229, 0.05);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    &.option-correct {
      background: rgba(34, 197, 94, 0.1) !important;
      border-left: 4px solid #22c55e;
      animation: correctPulse 0.5s ease;
    }

    &.option-incorrect {
      background: rgba(239, 68, 68, 0.1) !important;
      border-left: 4px solid #ef4444;
      animation: incorrectShake 0.5s ease;
    }
  }
}

.option-correct {
  background: rgba(34, 197, 94, 0.1) !important;
  border-left: 4px solid #22c55e;
}

.option-incorrect {
  background: rgba(239, 68, 68, 0.1) !important;
  border-left: 4px solid #ef4444;
}

.image-choice-options {
  .image-option-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    &.option-selected {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    &.option-correct {
      border-color: #22c55e;
      animation: correctPulse 0.5s ease;
    }

    &.option-incorrect {
      border-color: #ef4444;
      animation: incorrectShake 0.5s ease;
    }

    .selection-indicator,
    .correct-indicator,
    .incorrect-indicator {
      animation: iconBounce 0.5s ease;
    }
  }
}

.true-false-options,
.yes-no-options {
  .true-false-card,
  .yes-no-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    &.option-selected {
      border-color: #4f46e5;
      background: rgba(79, 70, 229, 0.05);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    &.option-correct {
      background: rgba(34, 197, 94, 0.1) !important;
      border-color: #22c55e;
      animation: correctPulse 0.5s ease;
    }

    &.option-incorrect {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: #ef4444;
      animation: incorrectShake 0.5s ease;
    }
  }
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

// Estilos para desglose de resultados
.result-breakdown-card {
  .stat-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.stat-correct {
      background: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.2);
    }

    &.stat-incorrect {
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.2);
    }

    &.stat-unanswered {
      background: rgba(107, 114, 128, 0.05);
      border-color: rgba(107, 114, 128, 0.2);
    }

    &.stat-total {
      background: rgba(79, 70, 229, 0.05);
      border-color: rgba(79, 70, 229, 0.2);
    }
  }

  .question-result-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.question-correct {
      background: rgba(34, 197, 94, 0.05);
      border-left: 4px solid #22c55e;
    }

    &.question-incorrect {
      background: rgba(239, 68, 68, 0.05);
      border-left: 4px solid #ef4444;
    }

    &.question-unanswered {
      background: rgba(107, 114, 128, 0.05);
      border-left: 4px solid #6b7280;
    }
  }
}

// Animaciones
@keyframes correctPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes incorrectShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

@keyframes iconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark {
  .result-breakdown-card {
    .stat-card {
      &.stat-correct {
        background: rgba(34, 197, 94, 0.1);
      }

      &.stat-incorrect {
        background: rgba(239, 68, 68, 0.1);
      }

      &.stat-unanswered {
        background: rgba(107, 114, 128, 0.1);
      }

      &.stat-total {
        background: rgba(79, 70, 229, 0.1);
      }
    }

    .question-result-card {
      &.question-correct {
        background: rgba(34, 197, 94, 0.1);
      }

      &.question-incorrect {
        background: rgba(239, 68, 68, 0.1);
      }

      &.question-unanswered {
        background: rgba(107, 114, 128, 0.1);
      }
    }
  }
}
</style>
