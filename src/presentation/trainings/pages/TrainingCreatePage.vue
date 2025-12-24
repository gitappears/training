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
import type { Material } from '../../../shared/components/MaterialViewer.vue';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import { materialsService } from '../../../infrastructure/http/materials/materials.service';
import { trainingsLinkEvaluationService } from '../../../infrastructure/http/trainings/trainings-link-evaluation.service';
import { useAuthStore } from '../../../stores/auth.store';
import type { CreateTrainingDto } from '../../../application/training/training.repository.port';
import type { CreateMaterialDto } from '../../../application/material/material.repository.port';
import { useMaterialTypeMapper } from '../../../shared/composables/useMaterialTypeMapper';
import { useMaterialUrl } from '../../../shared/composables/useMaterialUrl';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Composables
const { mapToBackendId: mapMaterialTypeToId } = useMaterialTypeMapper();
const { extractRelativeUrl, isExternalLink } = useMaterialUrl();

async function handleSubmit(payload: TrainingFormModel, formMaterials: Material[]) {
  try {
    // Obtener el usuario actual para usuario_creacion
    const usuarioCreacion = authStore.profile?.persona?.email || authStore.profile?.username || 'system';

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

    // Si hay evaluación inline, incluirla en el DTO
    if (payload.evaluationInline) {
      const evaluacionDto: {
        titulo: string;
        descripcion?: string;
        tiempoLimiteMinutos?: number;
        intentosPermitidos?: number;
        mostrarResultados?: boolean;
        mostrarRespuestasCorrectas?: boolean;
        puntajeTotal?: number;
        minimoAprobacion?: number;
        orden?: number;
        preguntas: Array<{
          tipoPreguntaId: number;
          enunciado: string;
          imagenUrl?: string;
          puntaje?: number;
          orden?: number;
          requerida?: boolean;
          opciones: Array<{
            texto: string;
            esCorrecta: boolean;
            puntajeParcial?: number;
            orden?: number;
          }>;
        }>;
      } = {
        titulo: payload.evaluationInline.titulo,
        intentosPermitidos: payload.evaluationInline.intentosPermitidos || 1,
        mostrarResultados: payload.evaluationInline.mostrarResultados ?? true,
        mostrarRespuestasCorrectas: payload.evaluationInline.mostrarRespuestasCorrectas ?? false,
        puntajeTotal: payload.evaluationInline.puntajeTotal || 100,
        minimoAprobacion: payload.evaluationInline.minimoAprobacion || 70,
        orden: payload.evaluationInline.orden || 0,
        preguntas: payload.evaluationInline.preguntas.map((p) => {
          const pregunta: {
            tipoPreguntaId: number;
            enunciado: string;
            imagenUrl?: string;
            puntaje?: number;
            orden?: number;
            requerida?: boolean;
            opciones: Array<{
              texto: string;
              esCorrecta: boolean;
              puntajeParcial?: number;
              orden?: number;
            }>;
          } = {
            tipoPreguntaId: p.tipoPreguntaId,
            enunciado: p.enunciado,
            puntaje: p.puntaje || 1,
            orden: p.orden ?? 0,
            requerida: p.requerida ?? true,
            opciones: p.opciones.map((o) => ({
              texto: o.texto,
              esCorrecta: o.esCorrecta,
              puntajeParcial: o.puntajeParcial || 0,
              orden: o.orden ?? 0,
            })),
          };
          if (p.imagenUrl) {
            pregunta.imagenUrl = p.imagenUrl;
          }
          return pregunta;
        }),
      };

      // Agregar propiedades opcionales solo si tienen valor
      if (payload.evaluationInline.descripcion) {
        evaluacionDto.descripcion = payload.evaluationInline.descripcion;
      }
      if (payload.evaluationInline.tiempoLimiteMinutos !== undefined && payload.evaluationInline.tiempoLimiteMinutos !== null) {
        evaluacionDto.tiempoLimiteMinutos = payload.evaluationInline.tiempoLimiteMinutos;
      }

      dto.evaluacion = evaluacionDto;
    }

    const createTrainingUseCase = TrainingUseCasesFactory.getCreateTrainingUseCase(trainingsService);
    const created = await createTrainingUseCase.execute(dto);

    // Vincular evaluación existente si fue seleccionada (RF-09) - solo si no hay evaluación inline
    if (!payload.evaluationInline && payload.evaluationId) {
      try {
        await trainingsLinkEvaluationService.linkEvaluation(
          parseInt(created.id),
          payload.evaluationId,
        );
      } catch (evaluationError) {
        console.error('Error al vincular evaluación:', evaluationError);
        $q.notify({
          type: 'warning',
          message: 'Capacitación creada pero la evaluación no se pudo vincular. Puede vincularla manualmente después.',
        });
      }
    }

    // Guardar materiales si existen
    if (formMaterials && formMaterials.length > 0) {
      try {
        const materialPromises = formMaterials.map((material) => {
          // Extraer URL relativa si es un archivo local, o mantener URL completa si es enlace externo
          let materialUrl = material.url;
          
          // Tipo extendido para incluir URL relativa temporal
          interface MaterialWithRelativeUrl extends Material {
            _relativeUrl?: string;
          }
          const materialWithRelative = material as MaterialWithRelativeUrl;
          
          // Si el material tiene _relativeUrl (archivo subido), usar esa
          // Si no, verificar si es un enlace externo o extraer la URL relativa
          if (materialWithRelative._relativeUrl) {
            materialUrl = materialWithRelative._relativeUrl;
          } else if (isExternalLink(material.url)) {
            // Para enlaces externos (videos, etc.), mantener la URL completa
            materialUrl = material.url;
          } else {
            // Para archivos locales, extraer la URL relativa
            materialUrl = extractRelativeUrl(material.url);
          }
          
          const materialDto: CreateMaterialDto = {
            capacitacionId: parseInt(created.id),
            tipoMaterialId: mapMaterialTypeToId(material.type),
            nombre: material.name,
            url: materialUrl, // URL relativa para archivos locales, completa para enlaces externos
            orden: material.order ?? 0,
          };
          // Agregar descripción solo si existe
          if (material.description) {
            materialDto.descripcion = material.description;
          }
          return materialsService.create(materialDto);
        });

        await Promise.all(materialPromises);
      } catch (materialError) {
        console.error('Error al guardar materiales:', materialError);
        $q.notify({
          type: 'warning',
          message: 'Capacitación creada pero algunos materiales no se pudieron guardar',
        });
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Capacitación creada exitosamente',
    });

    void router.push(`/trainings/${created.id}`);
  } catch (error) {
    // Mejorar mensajes de error con más contexto
    let errorMessage = 'Error al crear la capacitación';

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      // Mensajes específicos según el tipo de error
      if (errorStr.includes('evaluación') || errorStr.includes('evaluation')) {
        errorMessage = 'Error: Debe vincular una evaluación antes de crear la capacitación (RF-09)';
      } else if (errorStr.includes('validación') || errorStr.includes('validation')) {
        errorMessage = 'Error de validación: Verifique que todos los campos requeridos estén completos correctamente';
      } else if (errorStr.includes('network') || errorStr.includes('timeout')) {
        errorMessage = 'Error de conexión: Verifique su conexión a internet e intente nuevamente';
      } else if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
        errorMessage = 'Error de autenticación: Su sesión ha expirado. Por favor, inicie sesión nuevamente';
      } else if (errorStr.includes('403') || errorStr.includes('forbidden')) {
        errorMessage = 'Error de permisos: No tiene permisos para crear capacitaciones';
      } else if (errorStr.includes('500') || errorStr.includes('server')) {
        errorMessage = 'Error del servidor: Por favor, intente más tarde o contacte al administrador';
      } else {
        errorMessage = error.message;
      }
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      position: 'top',
      timeout: 7000,
      actions: [
        {
          label: 'Cerrar',
          color: 'white',
        },
      ],
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

// La función mapMaterialTypeToId ahora se obtiene del composable useMaterialTypeMapper
</script>
