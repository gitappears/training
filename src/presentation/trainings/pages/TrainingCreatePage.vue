<template>
  <q-page class="q-pa-lg">
    <!-- Header con breadcrumb y título -->
    <div class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="$router.back()"
          class="q-mr-sm"
        >
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary q-mb-xs">
            Crear Nueva Capacitación
          </div>
          <div class="text-body1 text-grey-7">
            Completa el formulario con la información de la capacitación que estará disponible para tus usuarios.
            Puedes guardar como borrador y completar más tarde.
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="row justify-center">
      <div class="col-12" style="max-width: 1200px">
        <TrainingForm @submit="handleSubmit" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import TrainingForm, { type TrainingFormModel } from '../components/TrainingForm.vue';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import { useAuthStore } from '../../../stores/auth.store';
import type { CreateTrainingDto } from '../../../application/training/training.repository.port';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

async function handleSubmit(payload: TrainingFormModel) {
  try {
    // Obtener el usuario actual para usuario_creacion
    const usuarioCreacion = authStore.profile?.email || authStore.profile?.username || 'system';

    // Mapear el formulario al DTO del backend
    const dto: CreateTrainingDto = {
      titulo: payload.title,
      tipoCapacitacionId: mapTipoToId(payload.type),
      modalidadId: mapModalityToId(payload.modality),
      instructorId: 1, // TODO: Obtener del selector de instructores
      usuarioCreacion,
    };

    // Agregar propiedades opcionales solo si tienen valor
    if (payload.description) {
      dto.descripcion = payload.description;
    }
    if (payload.area) {
      dto.areaId = parseInt(payload.area);
    }
    if (payload.targetAudience) {
      dto.publicoObjetivo = payload.targetAudience;
    }
    if (payload.startDate) {
      dto.fechaInicio = payload.startDate;
    }
    if (payload.endDate) {
      dto.fechaFin = payload.endDate;
    }
    if (payload.durationHours !== null && payload.durationHours !== undefined) {
      dto.duracionHoras = payload.durationHours;
    }
    if (payload.capacity !== null && payload.capacity !== undefined) {
      dto.capacidadMaxima = payload.capacity;
    }
    if (payload.coverImageUrl) {
      dto.imagenPortadaUrl = payload.coverImageUrl;
    }
    if (payload.promoVideoUrl) {
      dto.videoPromocionalUrl = payload.promoVideoUrl;
    }

    const createTrainingUseCase = TrainingUseCasesFactory.getCreateTrainingUseCase(trainingsService);
    const created = await createTrainingUseCase.execute(dto);

    $q.notify({
      type: 'positive',
      message: 'Capacitación creada exitosamente',
    });

    void router.push(`/trainings/${created.id}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error al crear la capacitación';
    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
  }
}

// Mapeos temporales - TODO: Obtener de catálogos del backend
function mapTipoToId(type: string | null): number {
  const map: Record<string, number> = {
    standard: 1,
    certified: 2,
    survey: 3,
  };
  return map[type ?? 'standard'] ?? 1;
}

function mapModalityToId(modality: string | null): number {
  const map: Record<string, number> = {
    online: 1,
    onsite: 2,
    hybrid: 3,
  };
  return map[modality ?? 'online'] ?? 1;
}
</script>
