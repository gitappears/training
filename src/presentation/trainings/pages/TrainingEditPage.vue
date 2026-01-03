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
            Editar Capacitación
          </div>
          <div class="text-body1 text-grey-7">
            Modifica la información de la capacitación. Los cambios se guardarán al enviar el formulario.
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
      <div class="text-body1 q-mt-md">Cargando capacitación...</div>
    </q-inner-loading>

    <!-- Error state -->
    <div v-if="error && !loading" class="row justify-center">
      <div class="col-12" style="max-width: 1200px">
        <q-banner class="bg-negative text-white q-mb-md">
          <template #avatar>
            <q-icon name="error" />
          </template>
          <div class="text-h6 q-mb-sm">Error al cargar la capacitación</div>
          <div>{{ error }}</div>
          <template #action>
            <q-btn flat label="Volver" @click="$router.push('/trainings')" />
            <q-btn flat label="Reintentar" @click="loadTraining" />
          </template>
        </q-banner>
      </div>
    </div>

    <!-- Formulario -->
    <div v-if="!loading && !error && training" class="row justify-center">
      <div class="col-12" style="max-width: 1200px">
        <TrainingForm
          :initial-data="training"
          :initial-materials="trainingMaterials"
          :initial-evaluation-id="trainingEvaluationId"
          :initial-evaluation-inline="trainingEvaluationInline"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import TrainingForm, { type TrainingFormModel, type InlineEvaluation } from '../components/TrainingForm.vue';
import type { Material } from '../../../shared/components/MaterialViewer.vue';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import { materialsService } from '../../../infrastructure/http/materials/materials.service';
import { evaluationsService } from '../../../infrastructure/http/evaluations/evaluations.service';
import type { Training } from '../../../domain/training/models';
import type { UpdateTrainingDto } from '../../../application/training/training.repository.port';
import type { CreateMaterialDto, UpdateMaterialDto } from '../../../application/material/material.repository.port';
import { useMaterialTypeMapper } from '../../../shared/composables/useMaterialTypeMapper';
import { useMaterialUrl } from '../../../shared/composables/useMaterialUrl';
import { mapTrainingTypeToId, isValidTrainingType } from '../../../shared/constants/training-types';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// Composables
const { mapFromBackend: mapMaterialTypeFromBackend, mapToBackendId: mapMaterialTypeToId, mapFromBackendId: mapMaterialTypeFromBackendId } = useMaterialTypeMapper();
const { extractRelativeUrl, isExternalLink } = useMaterialUrl();

const loading = ref(true);
const error = ref<string | null>(null);
const training = ref<Training | null>(null);
const trainingMaterials = ref<Material[]>([]);
const trainingEvaluationId = ref<number | null>(null);
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const trainingEvaluationInline = ref<InlineEvaluation | null>(null);

// Cargar capacitación existente
async function loadTraining() {
  const trainingId = route.params.id as string;
  if (!trainingId) {
    error.value = 'ID de capacitación no válido';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const getTrainingUseCase = TrainingUseCasesFactory.getGetTrainingUseCase(trainingsService);
    training.value = await getTrainingUseCase.execute(parseInt(trainingId));

    // Cargar materiales
    if (training.value.id) {
      try {
        const materials = await materialsService.findByCapacitacion(parseInt(training.value.id));
        trainingMaterials.value = materials.map((m) => {
          // Priorizar tipoMaterialId (más confiable) sobre código/nombre
          // El ID es constante y no depende de strings que pueden variar
          let materialType: Material['type'];
          
          if (m.tipoMaterialId && m.tipoMaterialId > 0) {
            // Usar el ID directamente (método más confiable)
            materialType = mapMaterialTypeFromBackendId(m.tipoMaterialId);
          } else {
            // Fallback: usar código/nombre si el ID no está disponible
            const tipoMaterialCode = m.tipoMaterial?.codigo?.trim();
            const tipoMaterialName = m.tipoMaterial?.nombre?.trim();
            const tipoMaterialInput = (tipoMaterialCode && tipoMaterialCode !== '') 
              ? tipoMaterialCode 
              : (tipoMaterialName || 'PDF');
            materialType = mapMaterialTypeFromBackend(tipoMaterialInput);
          }
          
          const material: Material = {
            id: m.id,
            name: m.nombre,
            url: m.url, // La URL ya viene completa desde el servicio
            type: materialType,
            order: m.orden,
          };
          if (m.descripcion) {
            material.description = m.descripcion;
          }
          return material;
        });
      } catch (materialError) {
        console.warn('Error al cargar materiales:', materialError);
        // No es crítico, continuar sin materiales
        trainingMaterials.value = [];
      }
    }

    // Cargar evaluación completa si hay una vinculada
    // Usar tipo extendido para incluir evaluations que viene del backend
    type TrainingWithEvaluations = Training & { evaluations?: Array<{ id: string | number }> };
    const trainingWithEvals = training.value as TrainingWithEvaluations;
    
    if (trainingWithEvals.evaluations && trainingWithEvals.evaluations.length > 0 && trainingWithEvals.evaluations[0]) {
      const evaluationId = trainingWithEvals.evaluations[0].id;
      const evaluationIdNumber = typeof evaluationId === 'string' ? parseInt(evaluationId) : evaluationId;
      trainingEvaluationId.value = evaluationIdNumber;

      try {
        // Cargar evaluación completa con preguntas y opciones
        const evaluation = await evaluationsService.findOne(String(evaluationIdNumber));

        // Mapear evaluación del dominio a formato inline para el formulario
        const evaluationInline: InlineEvaluation = {
          titulo: evaluation.title || 'Evaluación',
          descripcion: evaluation.description,
          intentosPermitidos: evaluation.attemptsAllowed || 1,
          mostrarResultados: true, // Por defecto
          mostrarRespuestasCorrectas: false, // Por defecto
          puntajeTotal: 100, // Por defecto
          minimoAprobacion: evaluation.minimumScore || 70,
          orden: 0,
          preguntas: evaluation.questions.map((q, qIdx) => {
            const questionId = parseInt(q.id);
            const pregunta: {
              id?: number;
              tipoPreguntaId: number;
              enunciado: string;
              imagenUrl?: string;
              puntaje: number;
              orden: number;
              requerida: boolean;
              opciones: Array<{
                id?: number;
                texto: string;
                esCorrecta: boolean;
                puntajeParcial: number;
                orden: number;
              }>;
            } = {
              tipoPreguntaId: mapQuestionTypeToTipoPreguntaId(q.type),
              enunciado: q.text,
              puntaje: q.score !== undefined && q.score !== null ? q.score : 1, // Usar el puntaje del backend o 1 por defecto
              orden: q.order ?? qIdx,
              requerida: true,
              opciones: q.options.map((opt, optIdx) => {
                const optionId = parseInt(opt.id);
                const opcion: {
                  id?: number;
                  texto: string;
                  esCorrecta: boolean;
                  puntajeParcial: number;
                  orden: number;
                } = {
                  texto: opt.text,
                  esCorrecta: opt.isCorrect,
                  puntajeParcial: 0,
                  orden: optIdx,
                };
                if (!Number.isNaN(optionId)) {
                  opcion.id = optionId;
                }
                return opcion;
              }),
            };
            if (!Number.isNaN(questionId)) {
              pregunta.id = questionId;
            }
            if (q.imageUrl) {
              pregunta.imagenUrl = q.imageUrl;
            }
            return pregunta;
          }),
        };
        
        // Agregar tiempoLimiteMinutos solo si existe
        if (evaluation.durationMinutes !== undefined && evaluation.durationMinutes !== null) {
          evaluationInline.tiempoLimiteMinutos = evaluation.durationMinutes;
        }
        
        trainingEvaluationInline.value = evaluationInline;
      } catch (evaluationError) {
        console.warn('Error al cargar evaluación completa:', evaluationError);
        // No es crítico, continuar sin evaluación inline
        trainingEvaluationInline.value = null;
      }
    }
  } catch (err) {
    console.error('Error al cargar capacitación:', err);
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar la capacitación';
    error.value = errorMessage;

    $q.notify({
      type: 'negative',
      message: 'Error al cargar la capacitación',
      caption: errorMessage,
      position: 'top',
      timeout: 5000,
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadTraining();
});

async function handleSubmit(payload: TrainingFormModel, formMaterials: Material[]) {
  if (!training.value) return;

  try {
    // Mapear el formulario al DTO de actualización
    const dto: UpdateTrainingDto = {
      titulo: payload.title,
    };

    // Agregar propiedades opcionales solo si tienen valor
    if (payload.description) {
      dto.descripcion = payload.description;
    }
    if (payload.type) {
      dto.tipoCapacitacionId = mapTipoToId(payload.type);
    }
    if (payload.modality) {
      dto.modalidadId = mapModalityToId(payload.modality);
    }
    // Área oculta temporalmente - no enviar si está vacía o no es válida
    if (payload.area && payload.area.trim() !== '') {
      const areaId = parseInt(payload.area);
      if (!isNaN(areaId) && areaId > 0) {
        dto.areaId = areaId;
      }
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
      // Asegurar que sea un número entero
      dto.duracionHoras = Math.round(payload.durationHours);
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

    // Actualizar capacitación
    const updateTrainingUseCase = TrainingUseCasesFactory.getUpdateTrainingUseCase(trainingsService);
    const updated = await updateTrainingUseCase.execute(parseInt(training.value.id), dto);

    // Sincronizar materiales
    if (formMaterials && formMaterials.length >= 0) {
      try {
        await syncMaterials(parseInt(training.value.id), formMaterials);
      } catch (materialError) {
        console.error('Error al sincronizar materiales:', materialError);
        $q.notify({
          type: 'warning',
          message: 'Capacitación actualizada pero algunos materiales no se pudieron sincronizar',
          position: 'top',
        });
      }
    }

    // Sincronizar evaluación inline si fue modificada
    if (payload.evaluationInline && trainingEvaluationId.value) {
      try {
        // Mapear preguntas con sus IDs para sincronización
        // Usar los IDs almacenados en el formulario
        // Mapear preguntas con tipos compatibles con UpdateEvaluationDto
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const questionsWithIds = payload.evaluationInline.preguntas.map((p): any => {
          const questionId = p.id ? (typeof p.id === 'string' ? parseInt(p.id) : p.id) : undefined;
          const question: {
            id?: number;
            text: string;
            type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no';
            options: Array<{
              id?: number;
              text: string;
              isCorrect: boolean;
              imageUrl?: string;
            }>;
            imageUrl?: string;
            order: number;
            score?: number;
          } = {
            text: p.enunciado,
            type: mapTipoPreguntaIdToQuestionType(p.tipoPreguntaId),
            options: p.opciones.map((o) => {
              const optionId = o.id ? (typeof o.id === 'string' ? parseInt(o.id) : o.id) : undefined;
              // Asegurar que esCorrecta sea un booleano
              let esCorrectaBool = false;
              if (typeof o.esCorrecta === 'boolean') {
                esCorrectaBool = o.esCorrecta;
              } else if (typeof o.esCorrecta === 'string') {
                esCorrectaBool = o.esCorrecta === 'true' || o.esCorrecta === '1';
              } else if (o.esCorrecta !== undefined && o.esCorrecta !== null) {
                esCorrectaBool = Boolean(o.esCorrecta);
              }

              const option: {
                id?: number;
                text: string;
                isCorrect: boolean;
                imageUrl?: string;
              } = {
                text: o.texto || '',
                isCorrect: esCorrectaBool,
              };
              // Solo incluir ID si es válido y es un número
              if (optionId !== undefined && !isNaN(optionId) && optionId > 0) {
                option.id = optionId;
              }
              return option;
            }),
            order: p.orden ?? 0,
          };
          // Incluir el puntaje de la pregunta si está definido y es válido
          if (p.puntaje !== undefined && p.puntaje !== null) {
            const puntajeNum = typeof p.puntaje === 'string' ? parseFloat(p.puntaje) : p.puntaje;
            if (!isNaN(puntajeNum) && puntajeNum >= 0) {
              question.score = puntajeNum;
            } else {
              question.score = 1; // Valor por defecto si es inválido
            }
          } else {
            question.score = 1; // Valor por defecto
          }
          // Solo incluir ID si es válido y es un número
          if (questionId !== undefined && !isNaN(questionId) && questionId > 0) {
            question.id = questionId;
          }
          if (p.imagenUrl) {
            question.imageUrl = p.imagenUrl;
          }
          return question;
        });

        // Actualizar evaluación existente
        // Validar y convertir minimoAprobacion a número válido (0-100)
        const minimoAprobacion = payload.evaluationInline.minimoAprobacion;
        let minimoAprobacionNumero = 70; // Valor por defecto
        if (minimoAprobacion !== undefined && minimoAprobacion !== null) {
          const parsed = typeof minimoAprobacion === 'string' ? parseFloat(minimoAprobacion) : minimoAprobacion;
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            minimoAprobacionNumero = parsed;
          }
        }

        // Usar Partial para permitir propiedades opcionales con exactOptionalPropertyTypes
        const updateDto: Partial<{
          description: string;
          durationMinutes: number;
          attemptsAllowed: number;
          minimumScore: number;
          questions: Array<{
            id?: number;
            text: string;
            type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no';
            options: Array<{
              id?: number;
              text: string;
              isCorrect: boolean;
              imageUrl?: string;
            }>;
            imageUrl?: string;
            order: number;
            score?: number;
          }>;
        }> = {
          description: payload.evaluationInline.descripcion || payload.evaluationInline.titulo,
          attemptsAllowed: payload.evaluationInline.intentosPermitidos || 1,
          minimumScore: minimoAprobacionNumero,
          questions: questionsWithIds as Array<{
            id?: number;
            text: string;
            type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no';
            options: Array<{
              id?: number;
              text: string;
              isCorrect: boolean;
              imageUrl?: string;
            }>;
            imageUrl?: string;
            order: number;
          }>,
        };
        
        // Agregar durationMinutes solo si existe
        if (payload.evaluationInline.tiempoLimiteMinutos !== undefined) {
          updateDto.durationMinutes = payload.evaluationInline.tiempoLimiteMinutos;
        }
        
        await evaluationsService.update(trainingEvaluationId.value.toString(), updateDto);
      } catch (evaluationError) {
        console.error('Error al actualizar evaluación:', evaluationError);
        $q.notify({
          type: 'warning',
          message: 'Capacitación actualizada pero la evaluación no se pudo actualizar. Puede editarla manualmente después.',
          position: 'top',
        });
      }
    } else if (!payload.evaluationInline && payload.evaluationId && payload.evaluationId !== trainingEvaluationId.value) {
      // Vincular evaluación diferente si fue seleccionada (RF-09)
      try {
        const { trainingsLinkEvaluationService } = await import(
          '../../../infrastructure/http/trainings/trainings-link-evaluation.service'
        );
        await trainingsLinkEvaluationService.linkEvaluation(
          parseInt(training.value.id),
          payload.evaluationId,
        );
      } catch (evaluationError) {
        console.error('Error al vincular evaluación:', evaluationError);
        $q.notify({
          type: 'warning',
          message: 'Capacitación actualizada pero la evaluación no se pudo vincular. Puede vincularla manualmente después.',
          position: 'top',
        });
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Capacitación actualizada exitosamente',
      position: 'top',
      timeout: 3000,
    });

    void router.push(`/trainings/${updated.id}`);
  } catch (err) {
    console.error('Error al actualizar:', err);

    // Mejorar mensajes de error con más contexto
    let errorMessage = 'Error al actualizar la capacitación';

    if (err instanceof Error) {
      const errorStr = err.message.toLowerCase();

      // Mensajes específicos según el tipo de error
      if (errorStr.includes('evaluación') || errorStr.includes('evaluation')) {
        errorMessage = 'Error: Debe vincular una evaluación antes de actualizar la capacitación (RF-09)';
      } else if (errorStr.includes('validación') || errorStr.includes('validation')) {
        // Intentar extraer detalles del error de validación
        const validationDetails = extractValidationErrors(err);
        errorMessage = validationDetails || 'Error de validación: Verifique que todos los campos requeridos estén completos correctamente';
      } else if (errorStr.includes('network') || errorStr.includes('timeout')) {
        errorMessage = 'Error de conexión: Verifique su conexión a internet e intente nuevamente';
      } else if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
        errorMessage = 'Error de autenticación: Su sesión ha expirado. Por favor, inicie sesión nuevamente';
      } else if (errorStr.includes('403') || errorStr.includes('forbidden')) {
        errorMessage = 'Error de permisos: No tiene permisos para actualizar capacitaciones';
      } else if (errorStr.includes('404') || errorStr.includes('not found') || errorStr.includes('no encontrada')) {
        // Verificar si el problema es al cargar o al actualizar
        if (training.value) {
          errorMessage = 'Error: La capacitación no fue encontrada en el servidor. Puede que haya sido eliminada.';
        } else {
          errorMessage = 'Error: No se pudo cargar la capacitación. Verifique que el ID sea correcto.';
        }
      } else if (errorStr.includes('500') || errorStr.includes('server')) {
        errorMessage = 'Error del servidor: Por favor, intente más tarde o contacte al administrador';
      } else {
        errorMessage = err.message;
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

// Sincronizar materiales: eliminar los que no están, crear/actualizar los que están
async function syncMaterials(capacitacionId: number, newMaterials: Material[]) {
  // Obtener materiales actuales
  const currentMaterials = await materialsService.findByCapacitacion(capacitacionId);

  // Crear un Set con los IDs reales de materiales existentes en el backend
  const currentMaterialIds = new Set(
    currentMaterials.map((m) => parseInt(m.id)),
  );

  // IDs de materiales nuevos que realmente existen en el backend
  type MaterialWithId = Omit<Material, 'id'> & { id: string };
  const newMaterialIds = new Set(
    newMaterials
      .filter((m): m is MaterialWithId => {
        if (!m.id) return false;
        const materialId = parseInt(m.id);
        // Solo incluir IDs que realmente existen en el backend (no IDs temporales)
        return currentMaterialIds.has(materialId);
      })
      .map((m) => parseInt(m.id)),
  );

  // Eliminar materiales que ya no están en la lista
  const materialsToDelete = currentMaterials.filter((m) => !newMaterialIds.has(parseInt(m.id)));
  for (const material of materialsToDelete) {
    try {
      await materialsService.remove(parseInt(material.id));
    } catch (deleteError) {
      console.error(`Error al eliminar material ${material.id}:`, deleteError);
    }
  }

  // Crear o actualizar materiales
  for (const material of newMaterials) {
    try {
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
      
      // Verificar si el ID realmente existe en el backend (no es un ID temporal)
      const materialId = material.id ? parseInt(material.id) : null;
      const existsInBackend = materialId !== null && currentMaterialIds.has(materialId);
      
      if (existsInBackend) {
        // Actualizar material existente (tiene ID real del backend)
        const updateDto: UpdateMaterialDto = {
          nombre: material.name,
          url: materialUrl, // URL relativa para archivos locales, completa para enlaces externos
          tipoMaterialId: mapMaterialTypeToId(material.type),
          orden: material.order ?? 0,
        };
        if (material.description) {
          updateDto.descripcion = material.description;
        }
        await materialsService.update(materialId, updateDto);
      } else {
        // Crear nuevo material (no tiene ID o tiene ID temporal)
        const createDto: CreateMaterialDto = {
          capacitacionId: capacitacionId,
          tipoMaterialId: mapMaterialTypeToId(material.type),
          nombre: material.name,
          url: materialUrl, // URL relativa para archivos locales, completa para enlaces externos
          orden: material.order ?? 0,
        };
        if (material.description) {
          createDto.descripcion = material.description;
        }
        await materialsService.create(createDto);
      }
    } catch (materialError) {
      console.error(`Error al sincronizar material ${material.name}:`, materialError);
      throw materialError;
    }
  }
}

// Usar funciones centralizadas de mapeo de tipos
function mapTipoToId(type: string | null): number {
  if (!type || !isValidTrainingType(type)) {
    throw new Error(`Tipo de capacitación inválido: ${type}`);
  }
  return mapTrainingTypeToId(type);
}

function mapModalityToId(modality: string | null): number {
  const map: Record<string, number> = {
    online: 1,
    onsite: 2,
    hybrid: 3,
  };
  return map[modality ?? 'online'] ?? 1;
}

// La función mapMaterialTypeToId ya está declarada arriba usando el composable useMaterialTypeMapper

/**
 * Mapea el ID del tipo de pregunta del backend al tipo del dominio
 */
function mapTipoPreguntaIdToQuestionType(tipoPreguntaId: number): 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no' {
  const map: Record<number, 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no'> = {
    1: 'single',
    2: 'multiple',
    3: 'image',
    4: 'true_false',
    5: 'yes_no',
  };
  return map[tipoPreguntaId] ?? 'single';
}

/**
 * Mapea el tipo de pregunta del dominio al ID del tipo en el backend
 */
function mapQuestionTypeToTipoPreguntaId(type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no'): number {
  const map: Record<'single' | 'multiple' | 'image' | 'true_false' | 'yes_no', number> = {
    single: 1,
    multiple: 2,
    image: 3,
    true_false: 4,
    yes_no: 5,
  };
  return map[type] ?? 1;
}

/**
 * Extrae detalles de errores de validación del backend
 */
function extractValidationErrors(error: Error): string | null {
  // Intentar extraer detalles del error de validación del backend
  if ('response' in error && error.response && typeof error.response === 'object') {
    const response = error.response as { data?: { message?: string | string[] } };
    if (response.data?.message) {
      if (Array.isArray(response.data.message)) {
        return `Errores de validación: ${response.data.message.join(', ')}`;
      }
      return `Error de validación: ${response.data.message}`;
    }
  }
  return null;
}
</script>

