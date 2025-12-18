<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="heading-main q-mb-xs">{{ evaluation.courseName }}</div>
        <div class="heading-sub">Evaluación: {{ evaluation.description }}</div>
      </div>
      <div class="row items-center q-gutter-md">
        <div class="text-body2 text-grey-7">
          Pregunta {{ currentQuestionIndex + 1 }} de {{ questions.length }}
        </div>
        <q-btn flat label="Cancelar" @click="confirmCancel" />
      </div>
    </div>

    <q-card v-if="!evaluationCompleted" class="q-pa-lg">
      <!-- Progreso -->
      <div class="q-mb-md">
        <q-linear-progress
          :value="progress"
          rounded
          size="20px"
          color="primary"
          class="q-mb-sm"
        />
        <div class="text-caption text-grey-7 text-right">
          {{ Math.round(progress * 100) }}% completado
        </div>
      </div>

      <!-- Pregunta actual -->
      <div v-if="currentQuestion" class="column q-gutter-md">
        <div class="text-h6">{{ currentQuestion.text }}</div>

        <!-- Tipo: Única respuesta -->
        <div v-if="currentQuestion.type === 'single'" class="column q-gutter-sm">
          <q-radio
            v-for="option in currentQuestion.options"
            :key="option.id"
            v-model="currentAnswer"
            :val="option.id"
            :label="option.text"
            color="primary"
          />
        </div>

        <!-- Tipo: Múltiple respuesta -->
        <div v-if="currentQuestion.type === 'multiple'" class="column q-gutter-sm">
          <q-checkbox
            v-for="option in currentQuestion.options"
            :key="option.id"
            v-model="currentAnswer"
            :val="option.id"
            :label="option.text"
            color="primary"
          />
        </div>

        <!-- Tipo: Selección de imagen -->
        <div v-if="currentQuestion.type === 'image'" class="row q-col-gutter-md">
          <div
            v-for="option in currentQuestion.options"
            :key="option.id"
            class="col-6 col-md-4"
          >
            <q-card
              class="cursor-pointer"
              :class="{ 'border-primary': currentAnswer === option.id }"
              @click="currentAnswer = option.id"
            >
              <q-img v-if="option.imageUrl" :src="option.imageUrl" :ratio="16 / 9" />
              <q-card-section>
                <div class="text-center">{{ option.text }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Tipo: Falso/Verdadero -->
        <div v-if="currentQuestion.type === 'true_false'" class="row q-gutter-sm">
          <q-btn
            :color="currentAnswer === 'true' ? 'primary' : 'grey'"
            :outline="currentAnswer !== 'true'"
            label="Verdadero"
            class="col"
            @click="currentAnswer = 'true'"
          />
          <q-btn
            :color="currentAnswer === 'false' ? 'primary' : 'grey'"
            :outline="currentAnswer !== 'false'"
            label="Falso"
            class="col"
            @click="currentAnswer = 'false'"
          />
        </div>

        <!-- Tipo: Sí/No -->
        <div v-if="currentQuestion.type === 'yes_no'" class="row q-gutter-sm">
          <q-btn
            :color="currentAnswer === 'yes' ? 'primary' : 'grey'"
            :outline="currentAnswer !== 'yes'"
            label="Sí"
            class="col"
            @click="currentAnswer = 'yes'"
          />
          <q-btn
            :color="currentAnswer === 'no' ? 'primary' : 'grey'"
            :outline="currentAnswer !== 'no'"
            label="No"
            class="col"
            @click="currentAnswer = 'no'"
          />
        </div>

        <!-- Navegación -->
        <div class="row justify-between q-mt-lg">
          <q-btn
            flat
            label="Anterior"
            icon="arrow_back"
            :disable="currentQuestionIndex === 0"
            @click="previousQuestion"
          />
          <q-btn
            v-if="currentQuestionIndex < questions.length - 1"
            color="primary"
            unelevated
            label="Siguiente"
            icon-right="arrow_forward"
            :disable="!currentAnswer"
            @click="nextQuestion"
          />
          <q-btn
            v-else
            color="primary"
            unelevated
            label="Finalizar evaluación"
            icon="check"
            :disable="!currentAnswer"
            @click="submitEvaluation"
          />
        </div>
      </div>
    </q-card>

    <!-- Resultado -->
    <q-card v-else class="q-pa-lg text-center">
      <q-icon
        :name="passed ? 'check_circle' : 'cancel'"
        :color="passed ? 'positive' : 'negative'"
        size="80px"
        class="q-mb-md"
      />
      <div class="text-h4 q-mb-sm">{{ passed ? '¡Felicidades!' : 'Evaluación no aprobada' }}</div>
      <div class="text-h6 text-grey-7 q-mb-md">
        Tu puntuación: {{ finalScore }}% (Mínimo requerido: {{ evaluation.minimumScore }}%)
      </div>
      <div class="text-body1 q-mb-lg">
        {{ passed ? 'Has aprobado la evaluación. Puedes descargar tu certificado.' : 'Puedes reintentar la evaluación.' }}
      </div>
      <div class="row justify-center q-gutter-sm">
        <q-btn
          v-if="passed"
          color="primary"
          unelevated
          label="Descargar certificado"
          icon="download"
          @click="downloadCertificate"
        />
        <q-btn
          v-else
          color="primary"
          unelevated
          label="Reintentar"
          icon="refresh"
          @click="retryEvaluation"
        />
        <q-btn flat label="Volver a evaluaciones" @click="goBack" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const evaluationId = route.params.id as string;
const currentQuestionIndex = ref(0);
const answers = ref<Record<string, string | string[]>>({});
const evaluationCompleted = ref(false);
const finalScore = ref(0);

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no';
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
  }>;
}

const evaluation = ref({
  id: evaluationId,
  courseName: 'Manejo Defensivo',
  description: 'Evaluación sobre técnicas de manejo defensivo',
  minimumScore: 70,
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
  },
  {
    id: 'q3',
    text: '¿Es correcto usar el celular mientras se conduce?',
    type: 'true_false',
    options: [
      { id: 'true', text: 'Verdadero', isCorrect: false },
      { id: 'false', text: 'Falso', isCorrect: true },
    ],
  },
]);

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

const passed = computed(() => finalScore.value >= evaluation.value.minimumScore);

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

function submitEvaluation() {
  // Calcular puntuación
  let correctAnswers = 0;
  questions.value.forEach((question) => {
    const answer = answers.value[question.id];
    if (question.type === 'multiple') {
      const selected = answer as string[];
      const correct = question.options.filter((o) => o.isCorrect).map((o) => o.id);
      if (
        selected.length === correct.length &&
        selected.every((id) => correct.includes(id))
      ) {
        correctAnswers++;
      }
    } else {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (answer === correctOption?.id) {
        correctAnswers++;
      }
    }
  });

  finalScore.value = Math.round((correctAnswers / questions.value.length) * 100);
  evaluationCompleted.value = true;

  // Aquí se llamaría al servicio HTTP para guardar el intento
  console.log('Evaluación completada:', { evaluationId, score: finalScore.value, answers: answers.value });
}

function downloadCertificate() {
  // Aquí se llamaría al servicio HTTP para descargar el certificado
  console.log('Descargar certificado para evaluación:', evaluationId);
  $q.notify({
    type: 'positive',
    message: 'Certificado descargado exitosamente',
  });
}

function retryEvaluation() {
  currentQuestionIndex.value = 0;
  answers.value = {};
  evaluationCompleted.value = false;
  finalScore.value = 0;
}

function confirmCancel() {
  $q.dialog({
    title: 'Confirmar cancelación',
    message: '¿Estás seguro de que deseas cancelar la evaluación? Tu progreso se perderá.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void router.push('/evaluations');
  });
}

function goBack() {
  void router.push('/evaluations');
}
</script>

<style scoped>
.border-primary {
  border: 2px solid #4f46e5;
}
</style>

