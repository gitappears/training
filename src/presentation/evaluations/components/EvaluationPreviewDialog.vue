<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    @update:model-value="handleUpdate"
  >
    <q-card class="evaluation-preview-dialog">
      <!-- Header con gradiente -->
      <q-card-section class="preview-header q-pa-md">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h5 text-weight-bold text-white q-mb-xs">
              {{ evaluation.courseName }}
            </div>
            <div class="text-body2 text-white-7 line-clamp-1">
              {{ evaluation.description || 'Sin descripción' }}
            </div>
          </div>
          <q-btn
            v-if="showCloseButton"
            icon="close"
            flat
            round
            dense
            class="text-white q-ml-sm"
            @click="handleCancel"
          />
        </div>
      </q-card-section>

      <!-- Contenido principal -->
      <q-card-section class="preview-content q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- Información principal compacta -->
          <div class="col-12">
            <!-- Resumen en grid compacto -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4">
                <q-card flat bordered class="summary-item-compact text-center">
                  <q-card-section class="q-pa-sm">
                    <q-icon name="help_outline" size="28px" color="primary" class="q-mb-xs" />
                    <div class="text-h6 text-weight-bold text-primary">
                      {{ evaluation.questionsCount }}
                    </div>
                    <div class="text-caption text-grey-6">Preguntas</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="summary-item-compact text-center">
                  <q-card-section class="q-pa-sm">
                    <q-icon name="schedule" size="28px" color="info" class="q-mb-xs" />
                    <div class="text-h6 text-weight-bold text-info">
                      {{ evaluation.durationMinutes }}
                    </div>
                    <div class="text-caption text-grey-6">Minutos</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered class="summary-item-compact text-center">
                  <q-card-section class="q-pa-sm">
                    <q-icon name="star" size="28px" color="warning" class="q-mb-xs" />
                    <div class="text-h6 text-weight-bold text-warning">
                      {{ evaluation.minimumScore }}%
                    </div>
                    <div class="text-caption text-grey-6">Mínimo</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Información adicional compacta -->
            <q-card flat bordered class="info-card-compact q-mb-md">
              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="help_outline" size="20px" color="primary" />
                      <div>
                        <div class="text-caption text-grey-6">Total de Preguntas</div>
                        <div class="text-body2 text-weight-medium">
                          {{ evaluation.questionsCount }} pregunta{{ evaluation.questionsCount !== 1 ? 's' : '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="schedule" size="20px" color="primary" />
                      <div>
                        <div class="text-caption text-grey-6">Tiempo Límite</div>
                        <div class="text-body2 text-weight-medium">
                          {{ evaluation.durationMinutes }} minuto{{ evaluation.durationMinutes !== 1 ? 's' : '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="star" size="20px" color="primary" />
                      <div>
                        <div class="text-caption text-grey-6">Puntaje Mínimo</div>
                        <div class="text-body2 text-weight-medium">
                          {{ evaluation.minimumScore }}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="evaluation.attemptsRemaining !== undefined" class="col-12 col-sm-6">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="refresh" size="20px" color="primary" />
                      <div>
                        <div class="text-caption text-grey-6">Intentos Restantes</div>
                        <div class="text-body2 text-weight-medium">
                          {{ evaluation.attemptsRemaining }} intento{{ evaluation.attemptsRemaining !== 1 ? 's' : '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Último intento (si existe) -->
            <q-card
              v-if="evaluation.lastAttempt"
              flat
              bordered
              class="last-attempt-card-compact q-mb-md"
              :class="{
                'bg-positive-1': evaluation.lastAttempt.passed,
                'bg-negative-1': !evaluation.lastAttempt.passed,
              }"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center q-gutter-sm">
                  <q-icon
                    :name="evaluation.lastAttempt.passed ? 'check_circle' : 'cancel'"
                    :color="evaluation.lastAttempt.passed ? 'positive' : 'negative'"
                    size="24px"
                  />
                  <div class="col">
                    <div class="text-body2 text-weight-medium">
                      Último Intento: {{ evaluation.lastAttempt.passed ? 'Aprobado' : 'No Aprobado' }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ formatDate(evaluation.lastAttempt.date) }}
                    </div>
                  </div>
                  <q-badge
                    :color="evaluation.lastAttempt.passed ? 'positive' : 'negative'"
                    :label="`${evaluation.lastAttempt.score}%`"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Instrucciones compactas -->
            <q-card flat bordered class="instructions-card-compact">
              <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 text-weight-medium q-mb-xs">
                  <q-icon name="lightbulb" color="warning" size="18px" class="q-mr-xs" />
                  Instrucciones
                </div>
                <ul class="instructions-list-compact">
                  <li>Lee cada pregunta cuidadosamente antes de responder.</li>
                  <li>El tiempo comenzará a contar una vez que inicies la evaluación.</li>
                  <li>Puedes navegar entre preguntas y revisar antes de enviar.</li>
                  <li v-if="evaluation.attemptsRemaining !== undefined && evaluation.attemptsRemaining > 0">
                    Te quedan {{ evaluation.attemptsRemaining }} intento{{ evaluation.attemptsRemaining !== 1 ? 's' : '' }} disponible{{ evaluation.attemptsRemaining !== 1 ? 's' : '' }}.
                  </li>
                  <li v-else-if="evaluation.attemptsRemaining === 0">
                    Este es tu último intento disponible.
                  </li>
                </ul>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions align="right" class="preview-actions q-pa-md">
        <q-btn
          flat
          :label="cancelLabel"
          :color="cancelColor"
          @click="handleCancel"
        />
        <q-btn
          :label="confirmLabel"
          :color="confirmColor"
          :loading="loading"
          unelevated
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Evaluation } from '../../../domain/evaluation/models';

interface Props {
  modelValue: boolean;
  evaluation: Evaluation;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  cancelColor?: string;
  persistent?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Iniciar Evaluación',
  cancelLabel: 'Cancelar',
  confirmColor: 'primary',
  cancelColor: 'grey',
  persistent: true,
  showCloseButton: true,
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function handleUpdate(value: boolean) {
  emit('update:modelValue', value);
}

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
</script>

<style scoped lang="scss">
.evaluation-preview-dialog {
  background: #f9fafb;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 700px;
}

body.body--dark .evaluation-preview-dialog {
  background: #0f172a;
}

.preview-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
  }
}

.preview-content {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary-item-compact {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.info-card-compact,
.last-attempt-card-compact,
.instructions-card-compact {
  transition: all 0.2s ease;
}

.info-card-compact:hover,
.instructions-card-compact:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

body.body--dark {
  .info-card-compact:hover,
  .instructions-card-compact:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

.instructions-list-compact {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: none;

  li {
    position: relative;
    padding-left: 1rem;
    margin-bottom: 0.5rem;
    line-height: 1.5;
    font-size: 0.875rem;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #4f46e5;
      font-weight: bold;
    }
  }
}

.preview-actions {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

body.body--dark {
  .preview-actions {
    background: #1e293b;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
}

// Responsive
@media (max-width: 768px) {
  .evaluation-preview-dialog {
    max-width: 95vw;
  }

  .preview-header {
    padding: 1rem !important;
  }

  .preview-content {
    padding: 1rem !important;
    max-height: calc(100vh - 200px);
  }

  .preview-actions {
    padding: 0.75rem !important;
    flex-direction: column-reverse;

    .q-btn {
      width: 100%;
      margin: 0.25rem 0;
    }
  }
}
</style>

