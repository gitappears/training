<template>
  <q-form class="column q-gutter-lg" @submit="onSubmit">
    <!-- Sección 1: Información Básica -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Información Básica</div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-input
            v-model="form.title"
            filled
            label="Título de la capacitación"
            placeholder="Ej: Introducción a React y TypeScript"
            :rules="[
              (val) => !!val || 'El título es obligatorio',
              (val) => (val && val.length >= 5) || 'El título debe tener al menos 5 caracteres',
              (val) => (val && val.length <= 200) || 'El título no puede exceder 200 caracteres',
            ]"
            @blur="validateTitle"
            hint="Nombre descriptivo y atractivo para la capacitación (5-200 caracteres)"
            :error-message="titleError"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="title" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="form.type"
            filled
            :options="trainingTypes"
            label="Tipo de capacitación"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione un tipo']"
            hint="Tipo de certificación que otorgará"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="category" />
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12">
          <q-input
            v-model="form.description"
            type="textarea"
            filled
            autogrow
            label="Descripción"
            placeholder="Describe los objetivos, contenidos y beneficios de esta capacitación..."
            hint="Proporciona información detallada que motive a los participantes (mínimo 20 caracteres)"
            rows="4"
            :dense="false"
            :error-message="descriptionError"
            @blur="validateDescription"
          >
            <template #prepend>
              <q-icon name="description" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card>

    <!-- Sección 2: Configuración y Logística -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="settings" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Configuración y Logística</div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="form.modality"
            filled
            :options="modalities"
            label="Modalidad"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione una modalidad']"
            hint="Forma en que se impartirá la capacitación"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="computer" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="form.location"
            filled
            label="Lugar / Enlace"
            placeholder="URL de la plataforma o dirección física"
            hint="Para modalidad online, ingresa el enlace de acceso"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="place" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-input
            v-model.number="form.durationHours"
            type="number"
            min="0"
            filled
            label="Duración (horas)"
            placeholder="0"
            hint="Horas totales del curso"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="schedule" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-input
            v-model.number="form.capacity"
            type="number"
            min="1"
            filled
            label="Cupos"
            placeholder="0"
            hint="Número máximo de participantes"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="people" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-4">
          <q-input
            v-model="form.instructor"
            filled
            label="Relator / Instructor"
            placeholder="Nombre del instructor principal"
            hint="Persona responsable de impartir la capacitación"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="form.area"
            filled
            label="Área Responsable"
            placeholder="Ej: Desarrollo, Recursos Humanos"
            hint="Departamento o área que gestiona esta capacitación"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="business" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="form.targetAudience"
            filled
            :options="targetAudiences"
            label="Público Objetivo"
            hint="Grupo de personas a quienes está dirigida"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="groups" />
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-input
            v-model="form.startDate"
            filled
            label="Fecha de Inicio"
            mask="####-##-##"
            hint="Cuándo comenzará la capacitación"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.startDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="form.endDate"
            filled
            label="Fecha de Término"
            mask="####-##-##"
            hint="Cuándo finalizará la capacitación"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.endDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </q-card>

    <!-- Sección 3: Recursos Multimedia -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="image" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Recursos Multimedia</div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="form.coverImageUrl"
            filled
            label="URL de Imagen de Portada"
            placeholder="https://ejemplo.com/imagen.jpg"
            hint="Imagen que se mostrará como portada del curso (recomendado: 1200x675px)"
            :dense="false"
            @blur="validateImageUrl"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
            <template #append>
              <q-btn
                v-if="form.coverImageUrl"
                flat
                dense
                round
                icon="visibility"
                @click="showImagePreview = !showImagePreview"
              >
                <q-tooltip>Ver preview</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <div v-if="showImagePreview && form.coverImageUrl" class="q-mt-sm">
            <q-img
              :src="form.coverImageUrl"
              style="max-height: 200px; border-radius: 8px"
              placeholder-src="https://via.placeholder.com/400x225?text=Imagen+no+disponible"
            >
              <template #error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Error al cargar imagen
                </div>
              </template>
            </q-img>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="form.promoVideoUrl"
            filled
            label="URL de Video Promocional"
            placeholder="https://youtube.com/watch?v=..."
            hint="Video de presentación del curso (opcional)"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="videocam" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card>

    <!-- Sección 4: Materiales y Enlaces -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="attach_file" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Materiales y Enlaces</div>
        <q-space />
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Agregar Material"
          size="sm"
          @click="showAddMaterialDialog = true"
        />
      </div>

      <!-- Lista de materiales con preview -->
      <div v-if="materials.length === 0" class="empty-materials q-pa-xl text-center">
        <q-icon name="attach_file" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-body1 text-grey-7 q-mb-sm">No hay materiales agregados</div>
        <div class="text-caption text-grey-6">Agrega PDFs, imágenes, videos o enlaces para enriquecer el curso</div>
      </div>

      <div v-else class="materials-list q-gutter-md">
        <q-card
          v-for="(material, index) in materials"
          :key="material.id || `material-${index}`"
          flat
          bordered
          class="material-card"
        >
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <!-- Drag handle -->
              <div class="drag-handle cursor-move">
                <q-icon name="drag_indicator" size="24px" color="grey-6" />
              </div>

              <!-- Preview del material -->
              <div class="material-preview-container">
                <MaterialViewer
                  :material="material"
                  :show-preview="true"
                  :allow-download="false"
                  class="material-preview"
                />
              </div>

              <!-- Información del material -->
              <div class="col material-info">
                <div class="text-body1 text-weight-medium q-mb-xs">
                  {{ material.name }}
                </div>
                <div class="text-caption text-grey-7 q-mb-xs">
                  <q-chip
                    :color="getMaterialTypeColor(material.type)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ getMaterialTypeLabel(material.type) }}
                  </q-chip>
                </div>
                <div
                  v-if="material.description"
                  class="text-caption text-grey-6"
                >
                  {{ material.description }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Orden: {{ index + 1 }}
                </div>
              </div>

              <!-- Acciones -->
              <div class="material-actions">
                <q-btn-group flat>
                  <q-btn
                    icon="edit"
                    flat
                    round
                    dense
                    @click="editMaterial(index)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="delete"
                    flat
                    round
                    dense
                    color="negative"
                    @click="removeMaterial(index)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sección: Evaluación (RF-09) -->
      <q-separator class="q-my-md" />
      <q-card
        flat
        bordered
        class="q-pa-md q-mt-md evaluation-section"
        :class="{
          'evaluation-warning': !hasEvaluation,
          'evaluation-selected': hasEvaluation,
        }"
      >
        <div class="row items-center q-mb-md">
          <q-icon
            name="quiz"
            size="24px"
            :color="hasEvaluation ? 'primary' : 'warning'"
            class="q-mr-sm"
          />
          <div class="text-h6 text-weight-medium">Evaluación</div>
          <q-badge v-if="!hasEvaluation" color="warning" class="q-ml-md">
            Requerida
          </q-badge>
        </div>

        <q-banner
          v-if="!hasEvaluation"
          dense
          class="bg-warning-1 text-warning q-mb-md"
          rounded
        >
          <template #avatar>
            <q-icon name="warning" color="warning" />
          </template>
          <div class="text-body2">
            <strong>Evaluación obligatoria (RF-09):</strong> Cada capacitación debe tener una evaluación vinculada.
            No se puede publicar un curso sin evaluación.
          </div>
        </q-banner>

        <!-- Toggle para elegir modo -->
        <q-btn-toggle
          v-model="evaluationMode"
          toggle-color="primary"
          :options="[
            { label: 'Vincular evaluación existente', value: 'link' },
            { label: 'Crear nueva evaluación', value: 'create' },
          ]"
          class="q-mb-md"
        />

        <!-- Modo: Vincular evaluación existente -->
        <div v-if="evaluationMode === 'link'">
          <q-select
            v-model="form.evaluationId"
            filled
            :options="evaluationOptions"
            label="Evaluación asociada *"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Debe seleccionar una evaluación']"
            hint="Seleccione la evaluación que se aplicará en esta capacitación"
            :dense="false"
            :loading="loadingEvaluations"
            clearable
            @update:model-value="form.evaluationInline = null"
          >
            <template #prepend>
              <q-icon name="assignment" />
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  <q-item-label v-if="loadingEvaluations">
                    Cargando evaluaciones...
                  </q-item-label>
                  <q-item-label v-else>
                    No hay evaluaciones disponibles. Use la opción "Crear nueva evaluación".
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <div v-if="form.evaluationId" class="q-mt-sm">
            <q-btn
              flat
              dense
              color="primary"
              icon="open_in_new"
              label="Ver detalles de la evaluación"
              size="sm"
              @click="handleViewEvaluationDetails"
            />
          </div>
        </div>

        <!-- Modo: Crear nueva evaluación inline -->
        <div v-else class="q-mt-md">
          <q-banner dense class="bg-info-1 text-info q-mb-md" rounded>
            <template #avatar>
              <q-icon name="info" color="info" />
            </template>
            <div class="text-body2">
              Cree una evaluación completa con preguntas y opciones. La evaluación se creará junto con la capacitación.
            </div>
          </q-banner>

          <!-- Formulario de evaluación -->
          <div class="q-gutter-md">
            <q-input
              v-model="form.evaluationInline!.titulo"
              filled
              label="Título de la evaluación *"
              hint="Nombre descriptivo de la evaluación"
              :rules="[(val) => !!val || 'El título es obligatorio']"
              :dense="false"
            >
              <template #prepend>
                <q-icon name="title" />
              </template>
            </q-input>

            <q-input
              v-model="form.evaluationInline!.descripcion"
              filled
              type="textarea"
              label="Descripción"
              hint="Descripción opcional de la evaluación"
              :dense="false"
              rows="2"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline!.tiempoLimiteMinutos"
                  filled
                  type="number"
                  label="Tiempo límite (minutos)"
                  hint="Deje vacío para sin límite"
                  :dense="false"
                  min="1"
                >
                  <template #prepend>
                    <q-icon name="schedule" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline!.intentosPermitidos"
                  filled
                  type="number"
                  label="Intentos permitidos *"
                  hint="Número de veces que se puede intentar"
                  :dense="false"
                  min="1"
                >
                  <template #prepend>
                    <q-icon name="repeat" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline!.puntajeTotal"
                  filled
                  type="number"
                  label="Puntaje total *"
                  hint="Puntaje máximo de la evaluación"
                  :dense="false"
                  min="0"
                  step="0.01"
                >
                  <template #prepend>
                    <q-icon name="star" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline!.minimoAprobacion"
                  filled
                  type="number"
                  label="Mínimo para aprobar (%) *"
                  hint="Porcentaje mínimo para aprobar"
                  :dense="false"
                  min="0"
                  max="100"
                  step="0.01"
                >
                  <template #prepend>
                    <q-icon name="check_circle" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-toggle
              v-model="form.evaluationInline!.mostrarResultados"
              label="Mostrar resultados al finalizar"
            />

            <q-toggle
              v-model="form.evaluationInline!.mostrarRespuestasCorrectas"
              label="Mostrar respuestas correctas"
            />

            <!-- Sección de preguntas -->
            <q-separator class="q-my-md" />
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="help" class="q-mr-xs" />
              Preguntas (mínimo 1 según RF-08)
            </div>

            <div
              v-for="(pregunta, preguntaIndex) in form.evaluationInline!.preguntas"
              :key="preguntaIndex"
              class="q-mb-lg"
            >
              <q-card flat bordered class="q-pa-md">
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle2 text-weight-medium">
                    Pregunta {{ preguntaIndex + 1 }}
                  </div>
                  <q-space />
                  <q-btn
                    v-if="form.evaluationInline!.preguntas.length > 1"
                    flat
                    dense
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeQuestion(preguntaIndex)"
                  />
                </div>

                <div class="q-gutter-md">
                  <q-select
                    v-model.number="pregunta.tipoPreguntaId"
                    filled
                    :options="questionTypes"
                    label="Tipo de pregunta *"
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Seleccione un tipo']"
                    :dense="false"
                  >
                    <template #prepend>
                      <q-icon name="category" />
                    </template>
                  </q-select>

                  <q-input
                    v-model="pregunta.enunciado"
                    filled
                    type="textarea"
                    label="Enunciado *"
                    hint="Texto de la pregunta"
                    :rules="[(val) => !!val || 'El enunciado es obligatorio']"
                    :dense="false"
                    rows="2"
                  />

                  <q-input
                    v-if="pregunta.tipoPreguntaId === 3"
                    v-model="pregunta.imagenUrl"
                    filled
                    label="URL de la imagen"
                    hint="URL de la imagen para preguntas de tipo imagen"
                    :dense="false"
                  >
                    <template #prepend>
                      <q-icon name="image" />
                    </template>
                  </q-input>

                  <q-input
                    v-model.number="pregunta.puntaje"
                    filled
                    type="number"
                    label="Puntaje de la pregunta"
                    hint="Puntaje que vale esta pregunta"
                    :dense="false"
                    min="0"
                    step="0.01"
                  />

                  <!-- Opciones de respuesta -->
                  <q-separator class="q-my-sm" />
                  <div class="text-body2 text-weight-medium q-mb-sm">
                    Opciones de respuesta (mínimo 1, al menos una debe ser correcta)
                  </div>

                  <div
                    v-for="(opcion, opcionIndex) in pregunta.opciones"
                    :key="opcionIndex"
                    class="q-mb-sm"
                  >
                    <q-card flat bordered class="q-pa-sm">
                      <div class="row items-center q-gutter-sm">
                        <div class="col">
                          <q-input
                            v-model="opcion.texto"
                            filled
                            dense
                            label="Texto de la opción *"
                            :rules="[(val) => !!val || 'El texto es obligatorio']"
                          />
                        </div>
                        <div class="col-auto">
                          <q-checkbox
                            v-model="opcion.esCorrecta"
                            label="Correcta"
                            color="positive"
                          />
                        </div>
                        <div class="col-auto">
                          <q-btn
                            v-if="pregunta.opciones.length > 1"
                            flat
                            dense
                            round
                            color="negative"
                            icon="close"
                            size="sm"
                            @click="removeOption(preguntaIndex, opcionIndex)"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>

                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="add"
                    label="Agregar opción"
                    size="sm"
                    @click="addOption(preguntaIndex)"
                  />
                </div>
              </q-card>
            </div>

            <q-btn
              flat
              dense
              color="primary"
              icon="add"
              label="Agregar pregunta"
              @click="addQuestion"
            />
          </div>
        </div>
      </q-card>

      <!-- Enlaces externos (mantener compatibilidad) -->
      <q-separator class="q-my-md" />
      <div class="text-subtitle2 q-mb-sm text-weight-medium">
        <q-icon name="link" size="18px" class="q-mr-xs" />
        Enlaces Externos (Legacy)
      </div>
      <div v-if="form.links.length === 0" class="text-grey-6 q-mb-sm">
        No hay enlaces agregados
      </div>
      <div class="column q-gutter-sm">
        <q-card
          v-for="(link, index) in form.links"
          :key="link.id"
          flat
          bordered
          class="q-pa-sm"
        >
          <div class="row q-col-gutter-sm items-center">
            <div class="col-5">
              <q-input
                v-model="link.label"
                dense
                filled
                label="Texto del enlace"
                placeholder="Ej: Documentación oficial"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="link.url"
                dense
                filled
                label="URL"
                placeholder="https://..."
              />
            </div>
            <div class="col-auto">
              <q-btn
                dense
                flat
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="removeLink(index)"
              >
                <q-tooltip>Eliminar enlace</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Agregar enlace"
          @click="addLink"
          class="q-mt-sm"
        />
      </div>

      <!-- Dialog para agregar/editar material -->
      <q-dialog v-model="showAddMaterialDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">
              {{ editingMaterialIndex !== null ? 'Editar Material' : 'Agregar Material' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="newMaterial.name"
              filled
              label="Nombre del material *"
              placeholder="Ej: Guía de estudio PDF"
              :rules="[(val) => !!val || 'El nombre es requerido']"
              class="q-mb-md"
            />
            <q-select
              v-model="newMaterial.type"
              filled
              :options="materialTypes"
              label="Tipo de material *"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo']"
              class="q-mb-md"
            />
            <q-input
              v-model="newMaterial.url"
              filled
              label="URL *"
              placeholder="https://..."
              :rules="[
                (val) => !!val || 'La URL es requerida',
                (val) => validateMaterialUrl(val, newMaterial.type) || 'URL no válida para el tipo seleccionado',
              ]"
              hint="Ingrese la URL del material (PDF, imagen, video, etc.)"
              class="q-mb-md"
            />
            <q-input
              v-model="newMaterial.description"
              type="textarea"
              filled
              label="Descripción (opcional)"
              placeholder="Descripción breve del material..."
              autogrow
              rows="2"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              @click="cancelAddMaterial"
            />
            <q-btn
              color="primary"
              label="Guardar"
              @click="saveMaterial"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>

    <!-- Botones de Acción -->
    <div class="row justify-between items-center q-mt-lg q-pt-md" style="border-top: 1px solid rgba(0,0,0,0.12)">
      <div class="text-caption text-grey-6">
        <q-icon name="info" size="14px" class="q-mr-xs" />
        Los campos marcados con * son obligatorios
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          label="Limpiar formulario"
          color="grey-7"
          icon="refresh"
          @click="reset"
        />
        <q-btn
          type="submit"
          color="primary"
          unelevated
          label="Crear capacitación"
          icon="check"
          :loading="false"
          class="q-px-xl"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import MaterialViewer from '../../../shared/components/MaterialViewer.vue';
import type { Material } from '../../../shared/components/MaterialViewer.vue';
import { evaluationsService } from '../../../infrastructure/http/evaluations/evaluations.service';

export interface EvaluationOption {
  id?: number; // ID de la opción (para edición)
  texto: string;
  esCorrecta: boolean;
  puntajeParcial?: number;
  orden?: number;
}

export interface QuestionOption {
  id?: number; // ID de la pregunta (para edición)
  tipoPreguntaId: number;
  enunciado: string;
  imagenUrl?: string;
  puntaje?: number;
  orden?: number;
  requerida?: boolean;
  opciones: EvaluationOption[];
}

export interface InlineEvaluation {
  titulo: string;
  descripcion?: string;
  tiempoLimiteMinutos?: number;
  intentosPermitidos?: number;
  mostrarResultados?: boolean;
  mostrarRespuestasCorrectas?: boolean;
  puntajeTotal?: number;
  minimoAprobacion?: number;
  orden?: number;
  preguntas: QuestionOption[];
}

export interface TrainingFormModel {
  title: string;
  description: string;
  type: string | null;
  modality: string | null;
  location: string;
  durationHours: number | null;
  capacity: number | null;
  instructor: string;
  area: string;
  targetAudience: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  promoVideoUrl: string;
  evaluationId: number | null; // RF-09: Evaluación obligatoria (para vincular existente)
  evaluationInline: InlineEvaluation | null; // RF-09: Evaluación a crear inline
  attachments: { id: string; label: string; url: string }[];
  links: { id: string; label: string; url: string }[];
}

const props = withDefaults(
  defineProps<{
    initialData?: {
      id?: string;
      title?: string;
      description?: string;
      type?: 'standard' | 'certified' | 'survey' | null;
      modality?: 'online' | 'onsite' | 'hybrid' | null;
      location?: string;
      durationHours?: number | null;
      capacity?: number | null;
      instructor?: string;
      area?: string;
      targetAudience?: string | null;
      startDate?: string;
      endDate?: string;
      coverImageUrl?: string;
      promoVideoUrl?: string;
      evaluations?: Array<{ id: number }>;
    } | null;
    initialMaterials?: Material[];
    initialEvaluationId?: number | null;
    initialEvaluationInline?: InlineEvaluation | null;
  }>(),
  {
    initialData: null,
    initialMaterials: () => [],
    initialEvaluationId: null,
    initialEvaluationInline: null,
  }
);

const emit = defineEmits<{
  submit: [TrainingFormModel, Material[]];
}>();

// Toggle para elegir entre vincular evaluación existente o crear nueva
const evaluationMode = ref<'link' | 'create'>('link');

const $q = useQuasar();
const router = useRouter();
const showImagePreview = ref(false);
const showAddMaterialDialog = ref(false);
const editingMaterialIndex = ref<number | null>(null);
const materials = ref<Material[]>([]);

// Estados de validación en tiempo real
const titleError = ref('');
const descriptionError = ref('');

const newMaterial = reactive<Material>({
  name: '',
  url: '',
  type: 'PDF',
  description: '',
  order: 0,
});

const materialTypes = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Imagen', value: 'IMAGE' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Documento Word', value: 'DOC' },
  { label: 'Enlace externo', value: 'LINK' },
  { label: 'Presentación', value: 'PRESENTATION' },
  { label: 'Audio', value: 'AUDIO' },
];

const trainingTypes = [
  { label: 'Capacitación estándar', value: 'standard' },
  { label: 'Capacitación certificada', value: 'certified' },
  { label: 'Encuesta', value: 'survey' },
];

const modalities = [
  { label: 'Online', value: 'online' },
  { label: 'Presencial', value: 'onsite' },
  { label: 'Mixta', value: 'hybrid' },
];

const targetAudiences = [
  'Todos los colaboradores',
  'Jefaturas',
  'Operaciones',
  'Backoffice',
  'Desarrolladores',
  'Diseñadores',
];

// Opciones de evaluaciones (cargadas dinámicamente desde backend)
const evaluationOptions = ref<Array<{ label: string; value: number }>>([]);
const loadingEvaluations = ref(false);

// Tipos de pregunta (RF-16)
const questionTypes = [
  { label: 'Única respuesta', value: 1 },
  { label: 'Respuesta múltiple', value: 2 },
  { label: 'Selección de imagen', value: 3 },
  { label: 'Falso o Verdadero', value: 4 },
  { label: 'Sí o No', value: 5 },
];

// Computed para verificar si hay evaluación (link o inline)
const hasEvaluation = computed(() => {
  return (
    (evaluationMode.value === 'link' && !!form.evaluationId) ||
    (evaluationMode.value === 'create' && !!form.evaluationInline && form.evaluationInline.preguntas.length > 0)
  );
});

// Inicializar evaluación inline cuando se cambia a modo 'create'
watch(evaluationMode, (newMode: 'link' | 'create') => {
  if (newMode === 'create' && !form.evaluationInline) {
    form.evaluationInline = {
      titulo: '',
      descripcion: '',
      intentosPermitidos: 1,
      mostrarResultados: true,
      mostrarRespuestasCorrectas: false,
      puntajeTotal: 100,
      minimoAprobacion: 70,
      orden: 0,
      preguntas: [
        {
          tipoPreguntaId: 1,
          enunciado: '',
          puntaje: 1,
          orden: 0,
          requerida: true,
          opciones: [
            { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
            { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
          ],
        },
      ],
    };
    form.evaluationId = null;
  } else if (newMode === 'link') {
    form.evaluationInline = null;
  }
});

// Cargar evaluaciones disponibles desde el backend
async function loadEvaluations(): Promise<void> {
  loadingEvaluations.value = true;
  try {
    const response = await evaluationsService.findAll({
      page: 1,
      limit: 100, // Cargar todas las evaluaciones disponibles
    });

    evaluationOptions.value = response.data.map((evaluation) => ({
      label: evaluation.description
        ? `${evaluation.courseName} - ${evaluation.description}`
        : evaluation.courseName,
      value: parseInt(evaluation.id),
    }));
  } catch (error) {
    console.error('Error al cargar evaluaciones:', error);
    // En caso de error, usar opciones mock como fallback
    evaluationOptions.value = [
      { label: 'Evaluación de Manejo Defensivo', value: 1 },
      { label: 'Evaluación de Primeros Auxilios', value: 2 },
      { label: 'Evaluación de Transporte de Mercancías Peligrosas', value: 3 },
    ];
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar las evaluaciones. Usando opciones predeterminadas.',
      position: 'top',
      timeout: 3000,
    });
  } finally {
    loadingEvaluations.value = false;
  }
}

// Funciones para manejar preguntas y opciones
function addQuestion(): void {
  if (!form.evaluationInline) return;
  const newQuestion: QuestionOption = {
    tipoPreguntaId: 1,
    enunciado: '',
    puntaje: 1,
    orden: form.evaluationInline.preguntas.length,
    requerida: true,
    opciones: [
      { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
      { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
    ],
  };
  form.evaluationInline.preguntas.push(newQuestion);
}

function removeQuestion(index: number): void {
  if (!form.evaluationInline) return;
  if (form.evaluationInline.preguntas.length > 1) {
    form.evaluationInline.preguntas.splice(index, 1);
    // Reordenar
    form.evaluationInline.preguntas.forEach((p, i) => {
      p.orden = i;
    });
  } else {
    $q.notify({
      type: 'warning',
      message: 'Debe tener al menos una pregunta (RF-08)',
      position: 'top',
      timeout: 3000,
    });
  }
}

function addOption(preguntaIndex: number): void {
  if (!form.evaluationInline) return;
  const pregunta = form.evaluationInline.preguntas[preguntaIndex];
  if (!pregunta) return;
  pregunta.opciones.push({
    texto: '',
    esCorrecta: false,
    puntajeParcial: 0,
    orden: pregunta.opciones.length,
  });
}

function removeOption(preguntaIndex: number, opcionIndex: number): void {
  if (!form.evaluationInline) return;
  const pregunta = form.evaluationInline.preguntas[preguntaIndex];
  if (!pregunta) return;
  if (pregunta.opciones.length > 1) {
    pregunta.opciones.splice(opcionIndex, 1);
    // Reordenar
    pregunta.opciones.forEach((o, i) => {
      o.orden = i;
    });
  } else {
    $q.notify({
      type: 'warning',
      message: 'Cada pregunta debe tener al menos una opción',
      position: 'top',
      timeout: 3000,
    });
  }
}

const form = reactive<TrainingFormModel>({
  title: '',
  description: '',
  type: null,
  modality: null,
  location: '',
  durationHours: null,
  capacity: null,
  instructor: '',
  area: '',
  targetAudience: null,
  startDate: '',
  endDate: '',
  coverImageUrl: '',
  promoVideoUrl: '',
  evaluationId: null, // RF-09: Evaluación obligatoria (para vincular existente)
  evaluationInline: null, // RF-09: Evaluación a crear inline
  attachments: [],
  links: [],
});

function reset() {
  form.title = '';
  form.description = '';
  form.type = null;
  form.modality = null;
  form.location = '';
  form.durationHours = null;
  form.capacity = null;
  form.instructor = '';
  form.area = '';
  form.targetAudience = null;
  form.startDate = '';
  form.endDate = '';
  form.coverImageUrl = '';
  form.promoVideoUrl = '';
  form.evaluationId = null;
  form.evaluationInline = null;
  form.attachments = [];
  form.links = [];
  showImagePreview.value = false;
  titleError.value = '';
  descriptionError.value = '';
  evaluationMode.value = 'link';
}

// Inicializar formulario con datos existentes (modo edición)
function initializeFormWithData() {
  if (!props.initialData) return;

  const data = props.initialData;

  form.title = data.title || '';
  form.description = data.description || '';
  form.type = data.type ?? null;
  form.modality = data.modality ?? null;
  form.location = data.location || '';
  form.durationHours = data.durationHours ?? null;
  form.capacity = data.capacity ?? null;
  form.instructor = data.instructor || '';
  form.area = data.area || '';
  form.targetAudience = data.targetAudience ?? null;
  form.startDate = data.startDate || '';
  form.endDate = data.endDate || '';
  form.coverImageUrl = data.coverImageUrl || '';
  form.promoVideoUrl = data.promoVideoUrl || '';

  // Cargar materiales iniciales
  if (props.initialMaterials && props.initialMaterials.length > 0) {
    materials.value = [...props.initialMaterials];
  }

  // Cargar evaluación inline si se proporciona (modo edición)
  if (props.initialEvaluationInline) {
    form.evaluationInline = { ...props.initialEvaluationInline };
    evaluationMode.value = 'create';
  } else if (props.initialEvaluationId) {
    // Cargar evaluación vinculada
    form.evaluationId = props.initialEvaluationId;
    evaluationMode.value = 'link';
  } else if (data.evaluations && data.evaluations.length > 0 && data.evaluations[0]) {
    form.evaluationId = data.evaluations[0].id;
    evaluationMode.value = 'link';
  }
}

// Inicializar cuando se monta el componente o cambian los props
watch(
  () => props.initialData,
  () => {
    initializeFormWithData();
  },
  { immediate: true }
);

// También inicializar materiales cuando cambien
watch(
  () => props.initialMaterials,
  (newMaterials) => {
    if (newMaterials && newMaterials.length > 0) {
      materials.value = [...newMaterials];
    }
  },
  { immediate: true }
);

// Función para ver detalles de evaluación
function handleViewEvaluationDetails(): void {
  if (form.evaluationId) {
    void router.push(`/evaluations/${form.evaluationId}`);
  }
}

// Cargar evaluaciones al montar el componente
onMounted(() => {
  void loadEvaluations();
});


function onSubmit() {
  // Validar evaluación obligatoria (RF-09)
  if (evaluationMode.value === 'link' && !form.evaluationId) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar una evaluación antes de crear la capacitación (RF-09)',
      position: 'top',
      timeout: 5000,
      actions: [
        {
          label: 'Entendido',
          color: 'white',
        },
      ],
    });
    return;
  }

  if (evaluationMode.value === 'create') {
    if (!form.evaluationInline || !form.evaluationInline.titulo) {
      $q.notify({
        type: 'warning',
        message: 'Debe completar el título de la evaluación',
        position: 'top',
        timeout: 3000,
      });
      return;
    }

    if (!form.evaluationInline.preguntas || form.evaluationInline.preguntas.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe agregar al menos una pregunta (RF-08)',
        position: 'top',
        timeout: 3000,
      });
      return;
    }

    // Validar que todas las preguntas tengan enunciado y al menos una opción correcta
    for (let i = 0; i < form.evaluationInline.preguntas.length; i++) {
      const pregunta = form.evaluationInline.preguntas[i];
      if (!pregunta) {
        $q.notify({
          type: 'warning',
          message: `Error en la pregunta ${i + 1}`,
          position: 'top',
          timeout: 3000,
        });
        return;
      }

      if (!pregunta.enunciado) {
        $q.notify({
          type: 'warning',
          message: `La pregunta ${i + 1} debe tener un enunciado`,
          position: 'top',
          timeout: 3000,
        });
        return;
      }

      if (!pregunta.opciones || pregunta.opciones.length === 0) {
        $q.notify({
          type: 'warning',
          message: `La pregunta ${i + 1} debe tener al menos una opción`,
          position: 'top',
          timeout: 3000,
        });
        return;
      }

      const tieneOpcionCorrecta = pregunta.opciones.some((o) => o.esCorrecta && o.texto);
      if (!tieneOpcionCorrecta) {
        $q.notify({
          type: 'warning',
          message: `La pregunta ${i + 1} debe tener al menos una opción correcta`,
          position: 'top',
          timeout: 3000,
        });
        return;
      }

      // Validar que todas las opciones tengan texto
      for (let j = 0; j < pregunta.opciones.length; j++) {
        const opcion = pregunta.opciones[j];
        if (!opcion || !opcion.texto) {
          $q.notify({
            type: 'warning',
            message: `La pregunta ${i + 1}, opción ${j + 1} debe tener texto`,
            position: 'top',
            timeout: 3000,
          });
          return;
        }
      }
    }
  }

  emit('submit', { ...form }, materials.value);
}

// Funciones de attachments removidas - ya no se usan en el formulario actual

function addLink() {
  form.links.push({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    label: '',
    url: '',
  });
}

function removeLink(index: number) {
  form.links.splice(index, 1);
}

function validateTitle() {
  const title = form.title?.trim() ?? '';
  if (!title) {
    titleError.value = 'El título es obligatorio';
    return false;
  }
  if (title.length < 5) {
    titleError.value = 'El título debe tener al menos 5 caracteres';
    return false;
  }
  if (title.length > 200) {
    titleError.value = 'El título no puede exceder 200 caracteres';
    return false;
  }
  titleError.value = '';
  return true;
}

function validateDescription() {
  const desc = form.description?.trim() ?? '';
  if (desc && desc.length < 20) {
    descriptionError.value = 'La descripción debe tener al menos 20 caracteres';
    return false;
  }
  if (desc && desc.length > 2000) {
    descriptionError.value = 'La descripción no puede exceder 2000 caracteres';
    return false;
  }
  descriptionError.value = '';
  return true;
}

function validateImageUrl() {
  if (form.coverImageUrl && !form.coverImageUrl.startsWith('http')) {
    // Podrías agregar validación adicional aquí
  }
}

// Funciones para gestión de materiales
function getMaterialTypeColor(type: string): string {
  switch (type) {
    case 'PDF':
      return 'negative';
    case 'IMAGE':
      return 'primary';
    case 'VIDEO':
      return 'purple';
    case 'DOC':
      return 'blue';
    case 'LINK':
      return 'teal';
    case 'PRESENTATION':
      return 'orange';
    case 'AUDIO':
      return 'pink';
    default:
      return 'grey';
  }
}

function getMaterialTypeLabel(type: string): string {
  const typeOption = materialTypes.find((t) => t.value === type);
  return typeOption?.label || type;
}

function validateMaterialUrl(url: string, type: string): boolean {
  if (!url || !url.startsWith('http')) {
    return false;
  }

  const urlLower = url.toLowerCase();

  switch (type) {
    case 'PDF':
      return urlLower.endsWith('.pdf') || urlLower.includes('pdf');
    case 'IMAGE':
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlLower) || urlLower.includes('image');
    case 'VIDEO':
      return (
        urlLower.includes('youtube.com') ||
        urlLower.includes('youtu.be') ||
        urlLower.includes('drive.google.com') ||
        urlLower.includes('onedrive.live.com') ||
        urlLower.includes('1drv.ms') ||
        /\.(mp4|webm|ogg)$/i.test(urlLower)
      );
    case 'DOC':
      return /\.(doc|docx)$/i.test(urlLower) || urlLower.includes('document');
    case 'LINK':
      return true; // Cualquier URL válida
    case 'PRESENTATION':
      return /\.(ppt|pptx)$/i.test(urlLower) || urlLower.includes('presentation');
    case 'AUDIO':
      return /\.(mp3|wav|ogg)$/i.test(urlLower) || urlLower.includes('audio');
    default:
      return true;
  }
}

function saveMaterial() {
  if (!newMaterial.name || !newMaterial.url || !newMaterial.type) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos requeridos',
      position: 'top',
    });
    return;
  }

  if (!validateMaterialUrl(newMaterial.url, newMaterial.type)) {
    $q.notify({
      type: 'negative',
      message: 'La URL no es válida para el tipo de material seleccionado',
      position: 'top',
    });
    return;
  }

  if (editingMaterialIndex.value !== null) {
    // Editar material existente
    const existingMaterial = materials.value[editingMaterialIndex.value];
    if (existingMaterial) {
      materials.value[editingMaterialIndex.value] = {
        ...newMaterial,
        id: existingMaterial.id || generateId(),
        order: editingMaterialIndex.value,
      };
    }
  } else {
    // Agregar nuevo material
    materials.value.push({
      ...newMaterial,
      id: generateId(),
      order: materials.value.length,
    });
  }

  cancelAddMaterial();
  $q.notify({
    type: 'positive',
    message: editingMaterialIndex.value !== null ? 'Material actualizado' : 'Material agregado',
    position: 'top',
  });
}

function editMaterial(index: number) {
  editingMaterialIndex.value = index;
  const material = materials.value[index];
  if (!material) return;
  newMaterial.name = material.name;
  newMaterial.url = material.url;
  newMaterial.type = material.type;
  newMaterial.description = material.description || '';
  showAddMaterialDialog.value = true;
}

function removeMaterial(index: number) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este material?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    materials.value.splice(index, 1);
    // Reordenar
    materials.value.forEach((mat, idx) => {
      mat.order = idx;
    });
    $q.notify({
      type: 'positive',
      message: 'Material eliminado',
      position: 'top',
    });
  });
}

function cancelAddMaterial() {
  showAddMaterialDialog.value = false;
  editingMaterialIndex.value = null;
  newMaterial.name = '';
  newMaterial.url = '';
  newMaterial.type = 'PDF';
  newMaterial.description = '';
  newMaterial.order = 0;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}
</script>

<style scoped lang="scss">
.q-card {
  transition: box-shadow 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-materials {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.materials-list {
  .material-card {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .drag-handle {
    cursor: move;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  .material-preview-container {
    width: 120px;
    min-width: 120px;
  }

  .material-info {
    min-width: 0; // Permite que el texto se trunque
  }

  .material-actions {
    flex-shrink: 0;
  }
}

body.body--dark {
  .empty-materials {
    border-color: rgba(255, 255, 255, 0.12);
    background-color: rgba(255, 255, 255, 0.05);
  }
}

// Estilos para la sección de evaluación
.evaluation-section {
  transition: all 0.3s ease;

  &.evaluation-warning {
    border: 2px solid rgba(var(--q-warning-rgb), 0.3);
    background-color: rgba(var(--q-warning-rgb), 0.05);
  }

  &.evaluation-selected {
    border: 2px solid rgba(var(--q-primary-rgb), 0.3);
    background-color: rgba(var(--q-primary-rgb), 0.02);
  }
}

// Mejoras visuales para el banner de advertencia
.bg-warning-1 {
  background-color: rgba(var(--q-warning-rgb), 0.1) !important;
}

body.body--dark {
  .evaluation-section {
    &.evaluation-warning {
      border-color: rgba(var(--q-warning-rgb), 0.4);
      background-color: rgba(var(--q-warning-rgb), 0.08);
    }

    &.evaluation-selected {
      border-color: rgba(var(--q-primary-rgb), 0.4);
      background-color: rgba(var(--q-primary-rgb), 0.05);
    }
  }
}
</style>
