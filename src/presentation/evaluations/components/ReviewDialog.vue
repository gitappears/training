<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="handleUpdate"
  >
    <q-card
      style="min-width: 500px; max-width: 600px"
      class="review-dialog"
    >
      <q-card-section class="row items-center q-pb-none">
        <q-icon
          name="star"
          color="amber"
          size="32px"
          class="q-mr-sm"
        />
        <div class="text-h6">
          Califica esta Capacitación
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="handleCancel"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-md">
          Tu opinión es muy valiosa para nosotros. Por favor, comparte tu experiencia con esta capacitación.
        </div>

        <!-- Calificación con estrellas -->
        <div class="q-mb-lg">
          <div class="text-subtitle2 q-mb-sm">
            Calificación (requerido)
          </div>
          <div class="row items-center q-gutter-sm">
            <q-rating
              v-model="rating"
              :max="5"
              size="40px"
              color="amber"
              icon="star_border"
              icon-selected="star"
              @update:model-value="rating = $event"
            />
            <div class="text-body2 text-grey-7">
              {{ ratingText }}
            </div>
          </div>
        </div>

        <!-- Comentario -->
        <div>
          <div class="text-subtitle2 q-mb-sm">
            Comentario (opcional)
          </div>
          <q-input
            v-model="comment"
            type="textarea"
            :rows="4"
            placeholder="Comparte tus comentarios sobre la capacitación..."
            :maxlength="1000"
            counter
            outlined
            autogrow
          />
        </div>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
      >
        <q-btn
          flat
          label="Omitir"
          color="grey-7"
          @click="handleSkip"
        />
        <q-btn
          label="Enviar Reseña"
          color="primary"
          :loading="loading"
          :disable="rating === 0"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: { rating: number; comment?: string }): void;
  (e: 'skip'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const rating = ref(0);
const comment = ref('');

const ratingText = computed(() => {
  if (rating.value === 0) return 'Selecciona una calificación';
  if (rating.value === 1) return 'Muy malo';
  if (rating.value === 2) return 'Malo';
  if (rating.value === 3) return 'Regular';
  if (rating.value === 4) return 'Bueno';
  if (rating.value === 5) return 'Excelente';
  return '';
});

function handleUpdate(value: boolean) {
  emit('update:modelValue', value);
}

function handleCancel() {
  rating.value = 0;
  comment.value = '';
  emit('cancel');
  emit('update:modelValue', false);
}

function handleSkip() {
  rating.value = 0;
  comment.value = '';
  emit('skip');
  emit('update:modelValue', false);
}

function handleSubmit() {
  if (rating.value === 0) {
    return;
  }

  emit('submit', {
    rating: rating.value,
    comment: comment.value.trim() || undefined,
  });
}
</script>

<style scoped lang="scss">
.review-dialog {
  .q-rating {
    .q-icon {
      transition: transform 0.2s ease;
    }
    .q-icon:hover {
      transform: scale(1.1);
    }
  }
}
</style>
