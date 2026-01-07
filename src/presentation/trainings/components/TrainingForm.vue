<template>
  <q-form class="column q-gutter-lg" @submit="onSubmit">
    <!-- Sección 1: Información Básica -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Información Básica</div>
      </div>

      <div class="row q-col-gutter-md">
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
        <div v-if="false" class="col-12 col-md-4">
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
        <div class="col-12 col-md-3">
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
        <div class="col-12 col-md-4">
          <q-select
            v-model="form.instructor"
            filled
            use-input
            input-debounce="300"
            :options="instructorOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            @filter="filterInstructors"
            label="Relator / Instructor"
            placeholder="Buscar instructor..."
            hint="Persona responsable de impartir la capacitación"
            :rules="[(val) => !!val || 'Seleccione un instructor']"
            :loading="loadingInstructors"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ loadingInstructors ? 'Cargando instructores...' : 'No se encontraron instructores' }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div v-if="false" class="col-12 col-md-4">
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
     
        <div class="col-12 col-md-4">
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
        <div class="col-12 col-md-4">
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
          <div class="q-mb-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-xs">
              Imagen de Portada *
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Imagen que se mostrará como portada del curso (recomendado: 1200x675px, máximo 2MB)
            </div>
          </div>

          <!-- Vista previa de la imagen -->
          <div v-if="coverImagePreview || form.coverImageUrl" class="cover-image-preview-container q-mb-md">
            <div class="cover-image-preview">
              <q-img
                :src="getCoverImageUrl"
                :alt="'Imagen de portada'"
                fit="contain"
                class="cover-image-thumbnail"
                :ratio="16/9"
              >
                <template #loading>
                  <div class="absolute-full flex flex-center">
                    <q-spinner color="primary" size="2em" />
                  </div>
                </template>
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-3">
                    <q-icon name="broken_image" size="48px" color="grey-6" />
                  </div>
                </template>
                <div class="absolute-top-right q-pa-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="white"
                    size="sm"
                    class="bg-negative"
                    @click="removeCoverImage"
                  >
                    <q-tooltip>Eliminar imagen</q-tooltip>
                  </q-btn>
                </div>
              </q-img>
            </div>
          </div>

          <!-- Input de archivo -->
          <q-file
            v-model="coverImageFile"
            filled
            label="Seleccionar imagen"
            accept="image/*"
            :max-file-size="2 * 1024 * 1024"
            :loading="uploadingCoverImage"
            @update:model-value="handleCoverImageSelected"
            hint="Formatos: JPG, PNG, GIF, WEBP (máximo 2MB)"
            :dense="false"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
            <template #append>
              <q-icon name="attach_file" v-if="!coverImageFile" />
              <q-spinner v-if="uploadingCoverImage" color="primary" size="1.5em" />
            </template>
          </q-file>

          <!-- Barra de progreso -->
          <q-linear-progress
            v-if="uploadingCoverImage"
            :value="coverImageUploadProgress"
            color="primary"
            class="q-mt-sm"
          />

          <!-- Mensaje de error si existe -->
          <div v-if="coverImageError" class="text-negative text-caption q-mt-xs">
            {{ coverImageError }}
          </div>
        </div>
      </div>
    </q-card>

    <!-- Sección 4: Contenido del Curso -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="menu_book" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-medium">Contenido del Curso</div>
      </div>

      <!-- Subsección 4A: Videos del Curso (Solo URLs) -->
      <div class="videos-section q-mb-lg">
        <div class="row items-center q-mb-md">
          <q-icon name="videocam" size="20px" color="purple" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-medium">Videos del Curso</div>
          <q-space />
          <q-btn
            outline
            color="purple"
            icon="add"
            label="Agregar Video"
            size="sm"
            @click="showAddVideoDialog = true"
          />
        </div>

        <q-banner dense class="bg-purple-1 text-purple q-mb-md" rounded>
          <template #avatar>
            <q-icon name="info" color="purple" />
          </template>
          <div class="text-body2">
            Los videos se reproducen directamente en la plataforma. Ingresa URLs de YouTube, Vimeo u
            otros servicios compatibles.
          </div>
        </q-banner>

        <!-- Lista de videos -->
        <div v-if="videos.length === 0" class="empty-materials q-pa-lg text-center">
          <q-icon name="videocam" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-body2 text-grey-7 q-mb-sm">No hay videos agregados</div>
          <div class="text-caption text-grey-6">
            Agrega videos que se reproducirán en la plataforma
          </div>
        </div>

        <div v-else class="materials-list q-gutter-md">
          <q-card
            v-for="(video, index) in videos"
            :key="video.id || `video-${index}`"
            flat
            bordered
            class="material-card"
          >
            <q-card-section>
              <div class="row items-start q-gutter-md">
                <div class="material-preview-container">
                  <!-- Mostrar iframe si es posible, sino mostrar ícono -->
                  <div v-if="getVideoEmbedUrl(video.url)" class="video-preview">
                    <iframe
                      :src="getVideoEmbedUrl(video.url)"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      class="video-iframe"
                    />
                  </div>
                  <q-icon v-else name="videocam" size="48px" color="purple" />
                </div>
                <div class="col material-info">
                  <div class="text-body1 text-weight-medium q-mb-xs">
                    {{ video.name }}
                  </div>
                  <q-chip color="purple" text-color="white" size="sm" dense> Video </q-chip>
                  <div v-if="video.description" class="text-caption text-grey-6 q-mt-xs">
                    {{ video.description }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    <a :href="video.url" target="_blank" class="text-primary">
                      {{ video.url }}
                    </a>
                  </div>
                </div>
                <div class="material-actions">
                  <q-btn-group flat>
                    <q-btn icon="edit" flat round dense @click="editVideo(index)">
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      flat
                      round
                      dense
                      color="negative"
                      @click="removeVideo(index)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <!-- Subsección 4B: Archivos e Imágenes (Upload) -->
      <div class="files-section">
        <div class="row items-center q-mb-md">
          <q-icon name="attach_file" size="20px" color="primary" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-medium">Archivos e Imágenes</div>
          <q-space />
          <q-btn
            outline
            color="primary"
            icon="upload_file"
            label="Subir Archivo"
            size="sm"
            @click="showUploadFileDialog = true"
          />
        </div>

        <q-banner dense class="bg-info-1 text-info q-mb-md" rounded>
          <template #avatar>
            <q-icon name="info" color="info" />
          </template>
          <div class="text-body2">
            Sube PDFs e imágenes que se almacenarán en el servidor. Los archivos estarán disponibles
            en:
            <code>localhost:3000/storage/materials</code>
          </div>
        </q-banner>

        <!-- Lista de archivos subidos -->
        <div v-if="files.length === 0" class="empty-materials q-pa-lg text-center">
          <q-icon name="attach_file" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-body2 text-grey-7 q-mb-sm">No hay archivos subidos</div>
          <div class="text-caption text-grey-6">Sube PDFs e imágenes para enriquecer el curso</div>
        </div>

        <div v-else class="materials-list q-gutter-md">
          <q-card
            v-for="(file, index) in files"
            :key="file.id || `file-${index}`"
            flat
            bordered
            class="material-card"
          >
            <q-card-section>
              <div class="row items-start q-gutter-md">
                <div class="material-preview-container">
                  <!-- Mostrar miniatura de imagen si es una imagen -->
                  <div v-if="file.type === 'IMAGE'" class="image-preview">
                    <q-img
                      :src="file.url"
                      :alt="file.name"
                      fit="cover"
                      loading="lazy"
                      class="image-thumbnail"
                      :ratio="16/9"
                      @click="viewImage(file.url)"
                    >
                      <template #loading>
                        <div class="absolute-full flex flex-center">
                          <q-spinner color="primary" size="2em" />
                        </div>
                      </template>
                      <template #error>
                        <div class="absolute-full flex flex-center bg-grey-3">
                          <q-icon name="broken_image" size="32px" color="grey-6" />
                        </div>
                      </template>
                    </q-img>
                  </div>
                  <!-- Para PDFs, mostrar preview con overlay -->
                  <div v-else-if="file.type === 'PDF'" class="pdf-preview" @click="openPdfModal(file)">
                    <div class="pdf-preview-content">
                      <q-icon name="picture_as_pdf" size="64px" color="negative" />
                      <div class="text-caption text-grey-7 q-mt-sm">PDF</div>
                    </div>
                    <div class="pdf-overlay">
                      <div class="pdf-overlay-content">
                        <q-icon name="visibility" size="32px" color="white" />
                        <div class="text-body2 text-white q-mt-sm text-weight-medium">Ver PDF</div>
                        <div class="text-caption text-white q-mt-xs opacity-60">Click para abrir</div>
                      </div>
                    </div>
                  </div>
                  <!-- Para otros tipos, mostrar ícono -->
                  <div v-else class="file-icon-container">
                    <q-icon
                      name="insert_drive_file"
                      size="48px"
                      color="grey-6"
                    />
                  </div>
                </div>
                <div class="col material-info">
                  <div class="text-body1 text-weight-medium q-mb-xs">
                    {{ file.name }}
                  </div>
                  <q-chip
                    :color="getMaterialTypeColor(file.type)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ getMaterialTypeLabel(file.type) }}
                  </q-chip>
                  <div v-if="file.description" class="text-caption text-grey-6 q-mt-xs">
                    {{ file.description }}
                  </div>
                </div>
                <div class="material-actions">
                  <q-btn-group flat>
                    <q-btn icon="edit" flat round dense @click="editFile(index)">
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      flat
                      round
                      dense
                      color="negative"
                      @click="removeFile(index)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Sección 5: Evaluación (RF-09) - Siempre inline -->
    <q-card flat bordered class="q-pa-md q-mt-md evaluation-section">
      <div class="row items-center q-mb-md">
        <q-icon
          name="quiz"
          size="24px"
          :color="hasEvaluation ? 'primary' : 'warning'"
          class="q-mr-sm"
        />
        <div class="text-h6 text-weight-medium">Evaluación</div>
        <q-badge v-if="!hasEvaluation" color="warning" class="q-ml-md"> Requerida </q-badge>
      </div>

      <q-banner dense class="bg-primary-1 text-primary q-mb-md" rounded>
        <template #avatar>
          <q-icon name="info" color="primary" />
        </template>
        <div class="text-body2">
          <strong>Evaluación obligatoria:</strong> Cada capacitación requiere una evaluación. Créela
          aquí con preguntas y opciones de respuesta.
        </div>
      </q-banner>

      <!-- Formulario de evaluación inline -->
      <div class="q-mt-md">
          <q-banner dense class="bg-info-1 text-info q-mb-md" rounded>
            <template #avatar>
              <q-icon name="info" color="info" />
            </template>
            <div class="text-body2">
            Cree una evaluación completa con preguntas y opciones. La evaluación se creará junto con
            la capacitación.
            </div>
          </q-banner>

          <!-- Formulario de evaluación -->
          <div class="q-gutter-md" v-if="form.evaluationInline">
            <q-input
              v-model="form.evaluationInline.titulo"
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
              v-model="form.evaluationInline.descripcion"
              filled
              type="textarea"
              label="Descripción"
              hint="Descripción opcional de la evaluación"
              :dense="false"
              rows="3"
            />

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline.tiempoLimiteMinutos"
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
                  v-model.number="form.evaluationInline.intentosPermitidos"
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
                  :model-value="calculatedPuntajeTotal"
                  filled
                  type="number"
                  label="Puntaje total *"
                hint="Siempre será 100 (calculado automáticamente según porcentajes de preguntas)"
                  :dense="false"
                  readonly
                  class="readonly-field"
                >
                  <template #prepend>
                    <q-icon name="calculate" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.evaluationInline.minimoAprobacion"
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

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="form.evaluationInline.mostrarResultados"
                  label="Mostrar resultados al finalizar"
                  color="primary"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="form.evaluationInline.mostrarRespuestasCorrectas"
                  label="Mostrar respuestas correctas"
                  color="primary"
                />
              </div>
            </div>

            <!-- Sección de preguntas -->
            <q-separator class="q-my-md" />
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="help" class="q-mr-xs" />
            Preguntas (mínimo 1)
            </div>

            <div
              v-for="(pregunta, preguntaIndex) in form.evaluationInline.preguntas"
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
                    v-if="form.evaluationInline.preguntas.length > 1"
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
                    @update:model-value="(val) => {
                      pregunta.tipoPreguntaId = typeof val === 'number' ? val : parseInt(val);
                    }"
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

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                  <q-input
                      v-model.number="pregunta.porcentaje"
                    filled
                    type="number"
                      label="Porcentaje de la pregunta (%)"
                      hint="Porcentaje que vale esta pregunta (opcional, se distribuye automáticamente si no se especifica)"
                    :dense="false"
                    min="0"
                      max="100"
                    step="0.01"
                      @update:model-value="calculateQuestionScores"
                    >
                      <template #prepend>
                        <q-icon name="percent" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="pregunta.puntaje?.toFixed(2) || '0.00'"
                      filled
                      type="text"
                      label="Puntaje calculado"
                      hint="Puntaje calculado automáticamente (siempre suma 100)"
                      readonly
                      :dense="false"
                      class="readonly-field"
                    >
                      <template #prepend>
                        <q-icon name="calculate" />
                      </template>
                    </q-input>
                  </div>
                </div>

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
                      <div class="column q-gutter-sm">
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
                            <q-checkbox v-model="opcion.esCorrecta" label="Correcta" color="positive" />
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
                        <!-- Campo de carga de imagen para opciones cuando el tipo es imagen -->
                        <div v-if="pregunta.tipoPreguntaId === 3" class="column q-gutter-sm">
                          <!-- Debug: mostrar información de la opción -->
                          <!-- <div class="text-caption text-grey-6 q-mb-xs">
                            Debug: imagenUrl = {{ opcion.imagenUrl }}, 
                            hasOptionImage = {{ hasOptionImage(preguntaIndex, opcionIndex) }},
                            url = {{ getOptionImageUrl(preguntaIndex, opcionIndex) }}
                          </div> -->
                          
                          <!-- Input de archivo oculto para poder activarlo programáticamente -->
                          <q-file
                            :ref="(el) => setImageFileInputRef(preguntaIndex, opcionIndex, el)"
                            :model-value="getOptionImageFile(preguntaIndex, opcionIndex)"
                            accept="image/*"
                            @update:model-value="(file) => handleOptionImageSelected(preguntaIndex, opcionIndex, file)"
                            style="display: none;"
                            class="hidden-file-input"
                          />
                          
                          <!-- Si ya hay imagen subida, mostrar miniatura -->
                          <div
                            v-if="opcion.imagenUrl && String(opcion.imagenUrl).trim() !== ''"
                            class="option-image-wrapper q-mt-sm"
                          >
                            <div class="row items-center q-gutter-sm">
                              <div class="option-image-thumbnail-container" style="width: 200px; height: 110px; min-width: 200px; min-height: 110px; max-width: 200px; max-height: 110px;">
                                <img
                                  :src="buildFullUrl(opcion.imagenUrl)"
                                  :alt="opcion.texto || 'Imagen de opción'"
                                  class="option-image-thumbnail"
                                  loading="lazy"
                                  style="width: 100%; height: 100%; max-width: 200px; max-height: 110px; object-fit: cover; border-radius:5px;"
                                />
                              </div>
                              <div class="col">
                                <div class="text-caption text-grey-7 q-mb-xs">Imagen de la opción</div>
                                <div class="row q-gutter-xs">
                                  <q-btn
                                    flat
                                    dense
                                    size="sm"
                                    color="primary"
                                    icon="image"
                                    label="Cambiar"
                                    @click="triggerImageFileInput(preguntaIndex, opcionIndex)"
                                  />
                                  <q-btn
                                    flat
                                    dense
                                    size="sm"
                                    color="negative"
                                    icon="delete"
                                    label="Eliminar"
                                    @click="clearOptionImage(preguntaIndex, opcionIndex)"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Si no hay imagen pero hay archivo seleccionado, mostrar preview -->
                          <div
                            v-else-if="getOptionImageFile(preguntaIndex, opcionIndex) && isImageFile(getOptionImageFile(preguntaIndex, opcionIndex)!)"
                            class="option-image-wrapper q-mt-sm"
                          >
                            <div class="row items-center q-gutter-sm">
                              <div class="option-image-thumbnail-container" style="width: 80px; height: 60px; min-width: 80px; min-height: 60px; max-width: 80px; max-height: 60px;">
                                <img
                                  :src="getFilePreviewUrl(getOptionImageFile(preguntaIndex, opcionIndex)!)"
                                  alt="Vista previa de imagen"
                                  class="option-image-thumbnail"
                                  style="width: 100%; height: 100%; max-width: 80px; max-height: 60px; object-fit: cover;"
                                />
                              </div>
                              <div class="col">
                                <div class="text-caption text-grey-7 q-mb-xs">Imagen seleccionada</div>
                                <div class="row q-gutter-xs items-center">
                                  <q-btn
                                    v-if="!isUploadingOptionImage(preguntaIndex, opcionIndex)"
                                    flat
                                    dense
                                    size="sm"
                                    color="primary"
                                    icon="cloud_upload"
                                    label="Subir"
                                    @click="uploadOptionImage(preguntaIndex, opcionIndex)"
                                  />
                                  <q-btn
                                    flat
                                    dense
                                    size="sm"
                                    color="negative"
                                    icon="close"
                                    label="Cancelar"
                                    @click="clearOptionImage(preguntaIndex, opcionIndex)"
                                  />
                                  <q-linear-progress
                                    v-if="isUploadingOptionImage(preguntaIndex, opcionIndex)"
                                    :value="getOptionUploadProgress(preguntaIndex, opcionIndex)"
                                    color="primary"
                                    class="q-mt-xs"
                                    style="width: 200px;"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Si no hay imagen ni archivo seleccionado, mostrar botón para seleccionar -->
                          <div v-else>
                            <q-btn
                              flat
                              dense
                              color="primary"
                              icon="image"
                              label="Seleccionar imagen (opcional)"
                              size="sm"
                              @click="triggerImageFileInput(preguntaIndex, opcionIndex)"
                            />
                          </div>
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

    <!-- Dialog para agregar/editar video -->
    <q-dialog v-model="showAddVideoDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editingVideoIndex !== null ? 'Editar Video' : 'Agregar Video' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newVideo.name"
            filled
            label="Nombre del video *"
            placeholder="Ej: Introducción al curso"
            :rules="[(val) => !!val || 'El nombre es requerido']"
            class="q-mb-md"
          />
          <q-input
            v-model="newVideo.url"
            filled
            label="URL del Video *"
            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            :rules="[
              (val) => !!val || 'La URL es requerida',
              (val) => isValidVideoUrl(val) || 'URL de video no válida (YouTube, Vimeo, etc.)',
            ]"
            hint="Soporta YouTube, Vimeo y otros servicios de video"
            class="q-mb-md"
          >
            <template #append>
              <q-btn
                v-if="newVideo.url"
                flat
                dense
                round
                icon="play_circle"
                @click="previewVideo(newVideo.url)"
              >
                <q-tooltip>Previsualizar video</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-input
            v-model="newVideo.description"
            type="textarea"
            filled
            label="Descripción (opcional)"
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" @click="cancelAddVideo" />
          <q-btn color="primary" label="Agregar" @click="saveVideo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para subir archivo -->
    <q-dialog v-model="showUploadFileDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editingFileIndex !== null ? 'Editar Archivo' : 'Subir Archivo o Imagen' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newFile.name"
            filled
            label="Nombre del archivo *"
            placeholder="Ej: Guía de estudio"
            :rules="[(val) => !!val || 'El nombre es requerido']"
            class="q-mb-md"
          />

          <q-select
            v-model="newFile.type"
            filled
            :options="fileTypes"
            label="Tipo de archivo *"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione un tipo']"
            class="q-mb-md"
          />

          <q-file
            v-model="newFile.file"
            filled
            :label="getFileUploadLabel()"
            :accept="getFileAcceptTypes()"
            :max-file-size="10 * 1024 * 1024"
            @update:model-value="handleFileSelected"
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="upload_file" />
            </template>
            <template #append>
              <q-btn
                v-if="newFile.file && isImageFile(newFile.file)"
                flat
                dense
                round
                icon="visibility"
                @click="previewFile(newFile.file)"
              />
            </template>
          </q-file>

          <!-- Preview del archivo seleccionado -->
          <div v-if="newFile.file && isImageFile(newFile.file)" class="q-mb-md">
            <q-img
              :src="getFilePreviewUrl(newFile.file)"
              style="max-height: 200px; border-radius: 8px"
            />
          </div>

          <!-- Barra de progreso de upload -->
          <q-linear-progress
            v-if="uploading"
            :value="uploadProgress"
            color="primary"
            class="q-mb-md"
          />

          <q-input
            v-model="newFile.description"
            type="textarea"
            filled
            label="Descripción (opcional)"
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" @click="cancelUploadFile" />
          <q-btn
            color="primary"
            label="Subir y Agregar"
            :loading="uploading"
            @click="uploadAndSaveFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para visualizar PDF -->
    <q-dialog v-model="showPdfModal" :maximized="false">
      <q-card class="pdf-modal-card">
        <q-card-section class="row items-center q-pb-sm pdf-modal-header">
          <div class="row items-center q-gutter-sm">
            <q-icon name="picture_as_pdf" size="28px" color="negative" />
            <div class="text-h6 text-weight-medium">{{ selectedPdf?.name }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedPdf" class="pdf-modal-content q-pa-none">
          <iframe
            :src="buildFullUrl(selectedPdf.url)"
            class="pdf-iframe"
            frameborder="0"
            :title="selectedPdf.name || 'Visualizador de PDF'"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Botones de Acción -->
    <div
      class="row justify-between items-center q-mt-lg q-pt-md"
      style="border-top: 1px solid rgba(0, 0, 0, 0.12)"
    >
      <div class="text-caption text-grey-6">
        <q-icon name="info" size="14px" class="q-mr-xs" />
        Los campos marcados con * son obligatorios
      </div>
      <div class="row q-gutter-sm">
        <q-btn flat label="Limpiar formulario" color="grey-7" icon="refresh" @click="reset" />
        <q-btn
          type="submit"
          color="primary"
          unelevated
          :label="isEditMode ? 'Actualizar capacitación' : 'Crear capacitación'"
          icon="check"
          :loading="isSubmitting"
          :disable="isSubmitting"
          class="q-px-xl"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Material } from '../../../shared/components/MaterialViewer.vue';
import { materialsService } from '../../../infrastructure/http/materials/materials.service';
import { useMaterialUrl } from '../../../shared/composables/useMaterialUrl';
import { TRAINING_TYPE_OPTIONS } from '../../../shared/constants/training-types';
import { usersService } from '../../../infrastructure/http/users/users.service';
import { useAuthStore } from '../../../stores/auth.store';

export interface EvaluationOption {
  id?: number; // ID de la opción (para edición)
  texto: string;
  imagenUrl?: string; // URL de la imagen para opciones de preguntas tipo imagen
  esCorrecta: boolean;
  puntajeParcial?: number;
  orden?: number;
}

export interface QuestionOption {
  id?: number; // ID de la pregunta (para edición)
  tipoPreguntaId: number;
  enunciado: string;
  imagenUrl?: string;
  puntaje?: number; // Se calculará automáticamente desde porcentaje
  porcentaje?: number; // Porcentaje específico (0-100), opcional. Si no se especifica, se distribuye automáticamente
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
  capacity: number | null;
  instructor: string | null;
  area: string;
  targetAudience: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
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
      capacity?: number | null;
      instructor?: string | null;
      area?: string;
      targetAudience?: string | null;
      startDate?: string;
      endDate?: string;
      coverImageUrl?: string;
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
  },
);

const emit = defineEmits<{
  submit: [TrainingFormModel, Material[]];
}>();

const $q = useQuasar();
const showImagePreview = ref(false);

// Estados para imagen de portada
const coverImageFile = ref<File | null>(null);
const coverImagePreview = ref<string | undefined>(undefined);
const uploadingCoverImage = ref(false);
const coverImageUploadProgress = ref(0);
const coverImageError = ref('');

// Composables
const { buildFullUrl } = useMaterialUrl();

// Detectar modo edición
const isEditMode = computed(() => {
  return !!props.initialData?.id;
});

// Estados para videos
const showAddVideoDialog = ref(false);
const editingVideoIndex = ref<number | null>(null);
const videos = ref<Material[]>([]);

// Estados para archivos
const showUploadFileDialog = ref(false);
const editingFileIndex = ref<number | null>(null);
const files = ref<Material[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);

// Estados para modal de PDF
const showPdfModal = ref(false);
const selectedPdf = ref<Material | null>(null);

// Estados para manejar imágenes de opciones de respuesta
const optionImageFiles = ref<Map<string, File | null>>(new Map());
const optionUploading = ref<Map<string, boolean>>(new Map());
const optionUploadProgress = ref<Map<string, number>>(new Map());

// Materiales combinados (para compatibilidad con el emit)
const materials = computed(() => [...videos.value, ...files.value]);

// Estados de validación en tiempo real
const titleError = ref('');
const descriptionError = ref('');

// Estados para instructores
const loadingInstructors = ref(false);
const allInstructors = ref<Array<{ label: string; value: string }>>([]);
const instructorOptions = ref<Array<{ label: string; value: string }>>([]);

// Estado para prevenir doble submit
const isSubmitting = ref(false);
const newVideo = reactive<Material>({
  name: '',
  url: '',
  type: 'VIDEO',
  description: '',
  order: 0,
});

const newFile = reactive<{
  name: string;
  type: string;
  file: File | null;
  description: string;
}>({
  name: '',
  type: 'PDF',
  file: null,
  description: '',
});

const fileTypes = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Imagen', value: 'IMAGE' },
];

// Usar constantes centralizadas de tipos
const trainingTypes = TRAINING_TYPE_OPTIONS;

const modalities = [
  { label: 'Online', value: 'online' },
  { label: 'Presencial', value: 'onsite' },
  { label: 'Mixta', value: 'hybrid' },
];

const targetAudiences = ['Administrativos', 'Clientes Corporativos', 'Operadores'];

// Tipos de pregunta (RF-16)
const questionTypes = [
  { label: 'Única respuesta', value: 1 },
  { label: 'Respuesta múltiple', value: 2 },
  { label: 'Selección de imagen', value: 3 },
  { label: 'Falso o Verdadero', value: 4 },
  { label: 'Sí o No', value: 5 },
];

// Computed para verificar si hay evaluación (siempre inline ahora)
const hasEvaluation = computed(() => {
  return !!form.evaluationInline && form.evaluationInline.preguntas.length > 0;
});

/**
 * Calcula automáticamente el puntaje total de la evaluación
 * Siempre será 100 según el requerimiento
 */
const calculatedPuntajeTotal = computed(() => {
  return 100;
});

/**
 * Obtiene la URL completa de la imagen de portada para visualización
 */
const getCoverImageUrl = computed(() => {
  // Si hay preview (blob o URL completa), usarlo
  if (coverImagePreview.value) {
    return coverImagePreview.value;
  }
  
  // Si hay URL en el formulario, construir URL completa usando buildFullUrl
  if (form.coverImageUrl) {
    return buildFullUrl(form.coverImageUrl);
  }
  
  return '';
});

/**
 * Calcula y actualiza los puntajes de las preguntas basándose en porcentajes
 * - Si una pregunta tiene porcentaje específico, se usa ese valor
 * - El resto se distribuye equitativamente entre las preguntas sin porcentaje
 * - El puntaje total siempre suma 100
 */
function calculateQuestionScores() {
  if (!form.evaluationInline?.preguntas || form.evaluationInline.preguntas.length === 0) {
    return;
  }

  const preguntas = form.evaluationInline.preguntas;
  
  // Separar preguntas con porcentaje específico y sin porcentaje
  const preguntasConPorcentaje = preguntas.filter(
    (p) => p.porcentaje !== undefined && p.porcentaje !== null && p.porcentaje > 0
  );
  const preguntasSinPorcentaje = preguntas.filter(
    (p) => !p.porcentaje || p.porcentaje === null || p.porcentaje === 0
  );
  
  // Calcular suma de porcentajes especificados
  const sumaPorcentajesEspecificados = preguntasConPorcentaje.reduce(
    (sum, p) => sum + (p.porcentaje || 0),
    0
  );
  
  // Validar que no se exceda el 100%
  if (sumaPorcentajesEspecificados > 100) {
    $q.notify({
      type: 'warning',
      message: `La suma de porcentajes especificados (${sumaPorcentajesEspecificados.toFixed(2)}%) no puede exceder 100%`,
      position: 'top',
      timeout: 4000,
    });
    // Ajustar el último porcentaje para que no exceda 100%
    if (preguntasConPorcentaje.length > 0) {
      const ultimaPregunta = preguntasConPorcentaje[preguntasConPorcentaje.length - 1];
      if (ultimaPregunta) {
        const porcentajeAjustado = 100 - (sumaPorcentajesEspecificados - (ultimaPregunta.porcentaje || 0));
        ultimaPregunta.porcentaje = Math.max(0, porcentajeAjustado);
      }
    }
    // Recalcular después del ajuste
    calculateQuestionScores();
    return;
  }
  
  // Calcular porcentaje restante a distribuir
  const porcentajeRestante = 100 - sumaPorcentajesEspecificados;
  
  // Distribuir porcentaje restante entre preguntas sin porcentaje específico
  const porcentajePorPregunta = preguntasSinPorcentaje.length > 0
    ? porcentajeRestante / preguntasSinPorcentaje.length
    : 0;
  
  // Actualizar puntajes de todas las preguntas
  preguntas.forEach((pregunta) => {
    if (pregunta.porcentaje !== undefined && pregunta.porcentaje !== null && pregunta.porcentaje > 0) {
      // Usar porcentaje especificado
      pregunta.puntaje = pregunta.porcentaje;
    } else {
      // Usar porcentaje calculado automáticamente
      pregunta.puntaje = porcentajePorPregunta;
      // Limpiar el campo porcentaje si es 0 para que se muestre como no especificado
      if (pregunta.porcentaje === 0) {
        delete pregunta.porcentaje;
      }
    }
  });
  
  // Actualizar puntajeTotal en el formulario
  if (form.evaluationInline) {
    form.evaluationInline.puntajeTotal = 100;
  }
}

// Inicializar evaluación inline si no existe (para modo edición)
onMounted(() => {
  if (!form.evaluationInline) {
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
          // Sin porcentaje específico, se distribuirá automáticamente
          puntaje: 100, // Se calculará automáticamente (100% / 1 pregunta = 100)
          orden: 0,
          requerida: true,
          opciones: [
            { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
            { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
          ],
        },
      ],
    };
    // Calcular puntajes iniciales
    calculateQuestionScores();
  }

  // Sincronizar título inicial si ya existe un título de capacitación
  if (form.title && form.title.trim() && form.evaluationInline) {
    const currentEvalTitle = form.evaluationInline.titulo?.trim() || '';
    if (!currentEvalTitle && !evaluationTitleManuallyModified.value) {
      form.evaluationInline.titulo = form.title.trim();
    }
  }

  // Sincronizar descripción inicial si ya existe una descripción de capacitación
  if (form.description && form.description.trim() && form.evaluationInline) {
    const currentEvalDescription = form.evaluationInline.descripcion?.trim() || '';
    if (!currentEvalDescription && !evaluationDescriptionManuallyModified.value) {
      form.evaluationInline.descripcion = form.description.trim();
    }
  }

  // Cargar instructores al montar el componente
  void loadInstructors();
});

// Funciones para manejar videos
function isValidVideoUrl(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  const urlLower = url.toLowerCase();
  return (
    urlLower.includes('youtube.com') ||
    urlLower.includes('youtu.be') ||
    urlLower.includes('vimeo.com') ||
    urlLower.includes('drive.google.com') ||
    /\.(mp4|webm|ogg)$/i.test(urlLower)
  );
}

/**
 * Convierte una URL de video a una URL de embed para iframe
 * Soporta YouTube, Vimeo y otros servicios
 */
function getVideoEmbedUrl(url: string): string | null {
  if (!url || !isValidVideoUrl(url)) {
    return null;
  }

  const urlLower = url.toLowerCase();

  // YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    let videoId = '';
    
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }
    
    // Formato: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
    if (embedMatch && embedMatch[1]) {
      videoId = embedMatch[1];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Vimeo
  if (urlLower.includes('vimeo.com')) {
    // Formato: https://vimeo.com/VIDEO_ID
    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }

  // Google Drive (videos)
  if (urlLower.includes('drive.google.com')) {
    // Formato: https://drive.google.com/file/d/FILE_ID/view
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
  }

  // Si es una URL directa de video (mp4, webm, etc.), devolverla directamente
  if (/\.(mp4|webm|ogg)$/i.test(url)) {
    return url;
  }

  return null;
}

function previewVideo(url: string): void {
  // Abrir preview en nueva ventana o mostrar en modal
  window.open(url, '_blank');
}

function saveVideo(): void {
  if (!newVideo.name || !newVideo.url) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos requeridos',
      position: 'top',
    });
    return;
  }

  if (!isValidVideoUrl(newVideo.url)) {
    $q.notify({
      type: 'negative',
      message: 'La URL de video no es válida',
      position: 'top',
    });
    return;
  }

  if (editingVideoIndex.value !== null) {
    const existingVideo = videos.value[editingVideoIndex.value];
    if (existingVideo) {
      videos.value[editingVideoIndex.value] = {
        ...newVideo,
        id: existingVideo.id || generateId(),
        order: editingVideoIndex.value,
      };
    }
  } else {
    videos.value.push({
      ...newVideo,
      id: generateId(),
      order: videos.value.length,
    });
  }

  cancelAddVideo();
  $q.notify({
    type: 'positive',
    message: editingVideoIndex.value !== null ? 'Video actualizado' : 'Video agregado',
    position: 'top',
  });
}

function editVideo(index: number): void {
  editingVideoIndex.value = index;
  const video = videos.value[index];
  if (!video) return;
  newVideo.name = video.name;
  newVideo.url = video.url;
  newVideo.description = video.description || '';
  showAddVideoDialog.value = true;
}

function removeVideo(index: number): void {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este video?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    videos.value.splice(index, 1);
    videos.value.forEach((v, idx) => {
      v.order = idx;
    });
    $q.notify({
      type: 'positive',
      message: 'Video eliminado',
      position: 'top',
    });
  });
}

function cancelAddVideo(): void {
  showAddVideoDialog.value = false;
  editingVideoIndex.value = null;
  newVideo.name = '';
  newVideo.url = '';
  newVideo.description = '';
  newVideo.order = 0;
}

// Funciones para manejar archivos
function getFileUploadLabel(): string {
  if (newFile.type === 'PDF') {
    return 'Seleccionar archivo PDF *';
  }
  return 'Seleccionar imagen *';
}

function getFileAcceptTypes(): string {
  if (newFile.type === 'PDF') {
    return '.pdf';
  }
  return 'image/*';
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function getFilePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

function previewFile(file: File | null): void {
  if (!file) return;
  if (isImageFile(file)) {
    const url = getFilePreviewUrl(file);
    $q.dialog({
      component: 'div',
      componentProps: {
        style: 'text-align: center; padding: 20px;',
      },
    }).onOk(() => {
      URL.revokeObjectURL(url);
    });
    // Mostrar imagen en un modal simple
    window.open(url, '_blank');
  }
}

/**
 * Abre una imagen en un modal para visualización completa
 */
function viewImage(imageUrl: string): void {
  // Abrir la imagen en una nueva ventana para visualización completa
  window.open(imageUrl, '_blank');
}

/**
 * Abre un PDF en un modal para visualización completa con iframe
 */
function openPdfModal(file: Material): void {
  selectedPdf.value = file;
  showPdfModal.value = true;
}

/**
 * Maneja la selección de imagen de portada
 */
async function handleCoverImageSelected(file: File | null): Promise<void> {
  coverImageError.value = '';
  
  if (!file) {
    // Si se elimina el archivo, limpiar preview si es un blob
    if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview.value);
    }
    coverImagePreview.value = undefined;
    return;
  }

  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    coverImageError.value = 'El archivo seleccionado no es una imagen válida';
    coverImageFile.value = null;
    return;
  }

  // Validar tamaño (2MB)
  if (file.size > 2 * 1024 * 1024) {
    coverImageError.value = 'El archivo excede el tamaño máximo de 2MB';
    coverImageFile.value = null;
    return;
  }

  // Mostrar preview inmediato usando URL.createObjectURL
  if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverImagePreview.value);
  }
  coverImagePreview.value = URL.createObjectURL(file);

  // Subir el archivo automáticamente
  await uploadCoverImage(file);
}

/**
 * Sube la imagen de portada al servidor
 */
async function uploadCoverImage(file: File): Promise<void> {
  uploadingCoverImage.value = true;
  coverImageUploadProgress.value = 0;
  coverImageError.value = '';

  try {
    const response = await materialsService.uploadFile(file, (progress) => {
      coverImageUploadProgress.value = progress;
    });

    // Guardar la URL relativa en el formulario
    // El backend espera URLs relativas para archivos locales
    form.coverImageUrl = response.url;

    // Construir URL completa para visualización
    const fullUrl = buildFullUrl(response.url);
    
    // Revocar el blob URL anterior
    if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview.value);
    }
    
    // Actualizar preview con la URL del servidor
    coverImagePreview.value = fullUrl;

    $q.notify({
      type: 'positive',
      message: 'Imagen de portada cargada exitosamente',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Error al subir imagen de portada:', error);
    coverImageError.value = error instanceof Error 
      ? error.message 
      : 'Error al subir la imagen. Por favor, intente nuevamente';
    
    // Limpiar preview y archivo en caso de error
    if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview.value);
    }
    coverImagePreview.value = undefined;
    coverImageFile.value = null;
    form.coverImageUrl = '';

    $q.notify({
      type: 'negative',
      message: 'Error al subir la imagen de portada',
      position: 'top',
      timeout: 3000,
    });
  } finally {
    uploadingCoverImage.value = false;
    coverImageUploadProgress.value = 0;
  }
}

/**
 * Elimina la imagen de portada
 */
function removeCoverImage(): void {
  // Revocar URL del objeto si es un blob
  if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverImagePreview.value);
  }
  
  coverImagePreview.value = undefined;
  coverImageFile.value = null;
  form.coverImageUrl = '';
  coverImageError.value = '';
  
  $q.notify({
    type: 'info',
    message: 'Imagen de portada eliminada',
    position: 'top',
    timeout: 2000,
  });
}

function handleFileSelected(file: File | null): void {
  if (file) {
    // Validar tipo
    if (newFile.type === 'PDF' && file.type !== 'application/pdf') {
      $q.notify({
        type: 'negative',
        message: 'El archivo seleccionado no es un PDF',
        position: 'top',
      });
      newFile.file = null;
      return;
    }
    if (newFile.type === 'IMAGE' && !isImageFile(file)) {
      $q.notify({
        type: 'negative',
        message: 'El archivo seleccionado no es una imagen',
        position: 'top',
      });
      newFile.file = null;
      return;
    }
    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      $q.notify({
        type: 'negative',
        message: 'El archivo excede el tamaño máximo de 10MB',
        position: 'top',
      });
      newFile.file = null;
      return;
    }
  }
}

async function uploadAndSaveFile(): Promise<void> {
  if (!newFile.name || !newFile.file) {
    $q.notify({
      type: 'negative',
      message: 'Complete todos los campos requeridos',
      position: 'top',
    });
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const response = await materialsService.uploadFile(newFile.file, (progress) => {
        uploadProgress.value = progress;
    });

    // Guardar URL relativa para el backend, pero construir URL completa para visualización
    // El backend espera URLs relativas o URLs completas válidas
    // Para archivos locales, guardamos la URL relativa que viene del backend
    // Para visualización, construimos la URL completa
    const relativeUrl = response.url; // El backend ya retorna la URL relativa
    const fullUrl = buildFullUrl(relativeUrl); // Para visualización en el frontend

    // Tipo extendido para incluir URL relativa temporal
    interface MaterialWithRelativeUrl extends Material {
      _relativeUrl?: string;
    }
    
    const fileMaterial: MaterialWithRelativeUrl = {
      id: generateId(),
      name: newFile.name,
      url: fullUrl, // URL completa para visualización en el frontend
      type: newFile.type as 'PDF' | 'IMAGE',
      description: newFile.description || '',
      order: files.value.length,
      // Guardar también la URL relativa para cuando se envíe al backend
      _relativeUrl: relativeUrl,
    };

    if (editingFileIndex.value !== null) {
      files.value[editingFileIndex.value] = fileMaterial;
    } else {
      files.value.push(fileMaterial);
    }

    cancelUploadFile();
    $q.notify({
      type: 'positive',
      message:
        editingFileIndex.value !== null ? 'Archivo actualizado' : 'Archivo subido exitosamente',
      position: 'top',
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al subir el archivo',
      position: 'top',
    });
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
}

function editFile(index: number): void {
  editingFileIndex.value = index;
  const file = files.value[index];
  if (!file) return;
  newFile.name = file.name;
  newFile.type = file.type as 'PDF' | 'IMAGE';
  newFile.description = file.description || '';
  newFile.file = null; // No se puede editar el archivo, solo los metadatos
  showUploadFileDialog.value = true;
}

function removeFile(index: number): void {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este archivo?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    files.value.splice(index, 1);
    files.value.forEach((f, idx) => {
      f.order = idx;
    });
    $q.notify({
      type: 'positive',
      message: 'Archivo eliminado',
      position: 'top',
    });
  });
}

function cancelUploadFile(): void {
  showUploadFileDialog.value = false;
  editingFileIndex.value = null;
  newFile.name = '';
  newFile.type = 'PDF';
  newFile.file = null;
  newFile.description = '';
  uploadProgress.value = 0;
}

// Funciones para manejar preguntas y opciones
function addQuestion(): void {
  if (!form.evaluationInline) return;
  const newQuestion: QuestionOption = {
    tipoPreguntaId: 1,
    enunciado: '',
    // Sin porcentaje específico, se distribuirá automáticamente
    puntaje: 0, // Se calculará automáticamente
    orden: form.evaluationInline.preguntas.length,
    requerida: true,
    opciones: [
      { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
      { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
    ],
  };
  form.evaluationInline.preguntas.push(newQuestion);
  // Recalcular puntajes después de agregar
  calculateQuestionScores();
}

function removeQuestion(index: number): void {
  if (!form.evaluationInline) return;
  if (form.evaluationInline.preguntas.length > 1) {
    form.evaluationInline.preguntas.splice(index, 1);
    // Reordenar
    form.evaluationInline.preguntas.forEach((p, i) => {
      p.orden = i;
    });
    // Recalcular puntajes después de eliminar
    calculateQuestionScores();
  } else {
    $q.notify({
      type: 'warning',
      message: 'Debe tener al menos una pregunta',
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
    // Limpiar estados de imagen de la opción antes de eliminar
    const optionKey = getOptionKey(preguntaIndex, opcionIndex);
    optionImageFiles.value.delete(optionKey);
    optionUploading.value.delete(optionKey);
    optionUploadProgress.value.delete(optionKey);
    
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

// Funciones para manejar imágenes de opciones de respuesta
function getOptionKey(preguntaIndex: number, opcionIndex: number): string {
  return `p${preguntaIndex}_o${opcionIndex}`;
}

function getOptionImageFile(preguntaIndex: number, opcionIndex: number): File | null {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  return optionImageFiles.value.get(key) || null;
}

async function handleOptionImageSelected(preguntaIndex: number, opcionIndex: number, file: File | null): Promise<void> {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  
  if (!file) {
    optionImageFiles.value.delete(key);
    return;
  }
  
  // Validar que sea una imagen
  if (!isImageFile(file)) {
    $q.notify({
      type: 'negative',
      message: 'El archivo seleccionado no es una imagen',
      position: 'top',
    });
    optionImageFiles.value.delete(key);
    return;
  }
  
  // Validar tamaño (10MB máximo, igual que otros archivos)
  if (file.size > 10 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'El archivo excede el tamaño máximo de 10MB',
      position: 'top',
    });
    optionImageFiles.value.delete(key);
    return;
  }
  
  // Guardar el archivo temporalmente
  optionImageFiles.value.set(key, file);
  
  // Subir automáticamente la imagen
  try {
    await uploadOptionImage(preguntaIndex, opcionIndex);
  } catch (error) {
    console.error('Error al subir imagen automáticamente:', error);
    // El error ya se maneja en uploadOptionImage
  }
}

async function uploadOptionImage(preguntaIndex: number, opcionIndex: number): Promise<void> {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  const file = optionImageFiles.value.get(key);
  
  if (!file || !form.evaluationInline) {
    return;
  }
  
  const pregunta = form.evaluationInline.preguntas[preguntaIndex];
  if (!pregunta) return;
  
  const opcion = pregunta.opciones[opcionIndex];
  if (!opcion) return;
  
  optionUploading.value.set(key, true);
  optionUploadProgress.value.set(key, 0);
  
  try {
    const response = await materialsService.uploadFile(file, (progress) => {
      optionUploadProgress.value.set(key, progress);
    });
    
    // Guardar la URL relativa en la opción
    // La URL viene como ruta relativa desde el backend (ej: /storage/materials/1234567890-abc123.jpg)
    // Usar Vue.set o asignación directa para asegurar reactividad
    if (form.evaluationInline) {
      const pregunta = form.evaluationInline.preguntas[preguntaIndex];
      if (pregunta && pregunta.opciones[opcionIndex]) {
        // Asignar directamente a la opción en el array para asegurar reactividad
        pregunta.opciones[opcionIndex].imagenUrl = response.url;
        opcion.imagenUrl = response.url; // También actualizar la referencia local
      }
    }
    
    console.log('✅ Imagen subida exitosamente:', {
      preguntaIndex,
      opcionIndex,
      url: response.url,
      opcionImagenUrl: opcion.imagenUrl,
      urlCompleta: buildFullUrl(response.url),
      preguntaTipo: pregunta?.tipoPreguntaId,
    });
    
    // Limpiar el archivo temporal después de subir
    optionImageFiles.value.delete(key);
    optionUploadProgress.value.set(key, 0);
    
    $q.notify({
      type: 'positive',
      message: 'Imagen subida exitosamente',
      position: 'top',
    });
  } catch (error) {
    console.error('❌ Error al subir imagen de opción:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al subir la imagen. Por favor, intente nuevamente.',
      position: 'top',
    });
    throw error; // Re-lanzar el error para que se maneje en onSubmit
  } finally {
    optionUploading.value.set(key, false);
  }
}

function clearOptionImage(preguntaIndex: number, opcionIndex: number): void {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  optionImageFiles.value.delete(key);
  optionUploadProgress.value.set(key, 0);
  
  if (form.evaluationInline) {
    const pregunta = form.evaluationInline.preguntas[preguntaIndex];
    if (pregunta && pregunta.opciones[opcionIndex]) {
      delete pregunta.opciones[opcionIndex].imagenUrl;
    }
  }
}

function previewOptionImage(preguntaIndex: number, opcionIndex: number): void {
  const file = getOptionImageFile(preguntaIndex, opcionIndex);
  if (file && isImageFile(file)) {
    const url = getFilePreviewUrl(file);
    window.open(url, '_blank');
  } else if (form.evaluationInline) {
    const pregunta = form.evaluationInline.preguntas[preguntaIndex];
    if (pregunta && pregunta.opciones[opcionIndex]?.imagenUrl) {
      window.open(buildFullUrl(pregunta.opciones[opcionIndex].imagenUrl!), '_blank');
    }
  }
}

function isUploadingOptionImage(preguntaIndex: number, opcionIndex: number): boolean {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  return optionUploading.value.get(key) || false;
}

function getOptionUploadProgress(preguntaIndex: number, opcionIndex: number): number {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  return optionUploadProgress.value.get(key) || 0;
}

/**
 * Verifica si una opción tiene una imagen válida
 */
function hasOptionImage(preguntaIndex: number, opcionIndex: number): boolean {
  if (!form.evaluationInline) {
    return false;
  }
  const pregunta = form.evaluationInline.preguntas[preguntaIndex];
  if (!pregunta || !pregunta.opciones || !pregunta.opciones[opcionIndex]) {
    return false;
  }
  const opcion = pregunta.opciones[opcionIndex];
  const hasImage = !!(opcion.imagenUrl && String(opcion.imagenUrl).trim() !== '');
  if (hasImage) {
    console.log('✅ hasOptionImage: true', {
      preguntaIndex,
      opcionIndex,
      texto: opcion.texto,
      imagenUrl: opcion.imagenUrl,
    });
  }
  return hasImage;
}

/**
 * Obtiene la URL completa de la imagen de una opción
 */
function getOptionImageUrl(preguntaIndex: number, opcionIndex: number): string {
  if (!form.evaluationInline) return '';
  const pregunta = form.evaluationInline.preguntas[preguntaIndex];
  if (!pregunta || !pregunta.opciones || !pregunta.opciones[opcionIndex]) return '';
  const opcion = pregunta.opciones[opcionIndex];
  if (!opcion.imagenUrl || String(opcion.imagenUrl).trim() === '') return '';
  const fullUrl = buildFullUrl(String(opcion.imagenUrl).trim());
  console.log('🔗 getOptionImageUrl:', {
    preguntaIndex,
    opcionIndex,
    imagenUrl: opcion.imagenUrl,
    fullUrl,
  });
  return fullUrl;
}

// Referencias a los inputs de archivo para poder activarlos programáticamente
const imageFileInputRefs = ref<Map<string, any>>(new Map());

function setImageFileInputRef(preguntaIndex: number, opcionIndex: number, el: any): void {
  if (el) {
    const key = getOptionKey(preguntaIndex, opcionIndex);
    imageFileInputRefs.value.set(key, el);
  }
}

function triggerImageFileInput(preguntaIndex: number, opcionIndex: number): void {
  const key = getOptionKey(preguntaIndex, opcionIndex);
  const inputRef = imageFileInputRefs.value.get(key);
  
  if (!inputRef) {
    console.warn('No se encontró la referencia al input de archivo para la opción:', { preguntaIndex, opcionIndex, key });
    return;
  }
  
  // Intentar acceder al elemento del input de diferentes formas
  let fileInput: HTMLInputElement | null = null;
  
  // Si es un componente Quasar q-file
  if (inputRef.$el) {
    fileInput = inputRef.$el.querySelector('input[type="file"]') as HTMLInputElement;
  } 
  // Si es directamente un elemento HTML
  else if (inputRef instanceof HTMLElement) {
    fileInput = inputRef.querySelector('input[type="file"]') as HTMLInputElement;
  }
  // Si es un objeto con querySelector
  else if (inputRef && typeof inputRef === 'object' && 'querySelector' in inputRef) {
    fileInput = (inputRef as any).querySelector('input[type="file"]');
  }
  
  if (fileInput) {
    // Limpiar el valor anterior para permitir seleccionar el mismo archivo
    fileInput.value = '';
    fileInput.click();
  } else {
    console.error('No se pudo encontrar el input de archivo para la opción:', { 
      preguntaIndex, 
      opcionIndex, 
      key,
      inputRef 
    });
  }
}

const form = reactive<TrainingFormModel>({
  title: '',
  description: '',
  type: null,
  modality: null,
  location: '',
  capacity: null,
  instructor: null,
  area: '',
  targetAudience: 'Operadores',
  startDate: '',
  endDate: '',
  coverImageUrl: '',
  evaluationId: null, // RF-09: Evaluación obligatoria (para vincular existente)
  evaluationInline: {
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
        puntaje: 100,
        orden: 0,
        requerida: true,
        opciones: [
          { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
          { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
        ],
      },
    ],
  }, // RF-09: Evaluación a crear inline
  attachments: [],
  links: [],
});

function reset() {
  evaluationTitleManuallyModified.value = false;
  evaluationDescriptionManuallyModified.value = false;
  form.title = '';
  form.description = '';
  form.type = null;
  form.modality = null;
  form.location = '';
  form.capacity = null;
  form.instructor = null;
  form.area = '';
  form.targetAudience = 'Conductores';
  form.startDate = '';
  form.endDate = '';
  
  // Limpiar imagen de portada
  if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverImagePreview.value);
  }
  coverImagePreview.value = undefined;
  coverImageFile.value = null;
  coverImageError.value = '';
  form.coverImageUrl = '';
  form.evaluationId = null;
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
        // Sin porcentaje específico, se distribuirá automáticamente
        puntaje: 100, // Se calculará automáticamente (100% / 1 pregunta = 100)
        orden: 0,
        requerida: true,
        opciones: [
          { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 0 },
          { texto: '', esCorrecta: false, puntajeParcial: 0, orden: 1 },
        ],
      },
    ],
  };
  // Calcular puntajes iniciales después de reset
  calculateQuestionScores();
  form.attachments = [];
  form.links = [];
  videos.value = [];
  files.value = [];
  showImagePreview.value = false;
  titleError.value = '';
  descriptionError.value = '';
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
  form.capacity = data.capacity ?? null;
  form.instructor = data.instructor || null;
  form.area = data.area || '';
  form.targetAudience = data.targetAudience ?? 'Conductores';
  form.startDate = data.startDate || '';
  form.endDate = data.endDate || '';
  form.coverImageUrl = data.coverImageUrl || '';

  // Cargar materiales iniciales y separar videos de archivos
  if (props.initialMaterials && props.initialMaterials.length > 0) {
    videos.value = props.initialMaterials.filter((m) => m.type === 'VIDEO');
    files.value = props.initialMaterials.filter((m) => m.type !== 'VIDEO');
  }

  // Cargar evaluación inline si se proporciona (modo edición)
  // Hacer copia profunda para evitar problemas de reactividad
  if (props.initialEvaluationInline) {
    form.evaluationInline = {
      titulo: props.initialEvaluationInline.titulo || '',
      ...(props.initialEvaluationInline.descripcion && {
        descripcion: props.initialEvaluationInline.descripcion,
      }),
      ...(props.initialEvaluationInline.tiempoLimiteMinutos !== undefined && {
      tiempoLimiteMinutos: props.initialEvaluationInline.tiempoLimiteMinutos,
      }),
      intentosPermitidos: props.initialEvaluationInline.intentosPermitidos || 1,
      mostrarResultados: props.initialEvaluationInline.mostrarResultados ?? true,
      mostrarRespuestasCorrectas: props.initialEvaluationInline.mostrarRespuestasCorrectas ?? false,
      puntajeTotal: props.initialEvaluationInline.puntajeTotal || 100,
      minimoAprobacion: props.initialEvaluationInline.minimoAprobacion || 70,
      orden: props.initialEvaluationInline.orden || 0,
      preguntas: props.initialEvaluationInline.preguntas.map((p) => {
        const pregunta = {
          ...(p.id !== undefined && { id: p.id }),
          tipoPreguntaId: typeof p.tipoPreguntaId === 'number' ? p.tipoPreguntaId : parseInt(String(p.tipoPreguntaId || 1)),
          enunciado: p.enunciado || '',
          ...(p.imagenUrl !== undefined && { imagenUrl: p.imagenUrl }),
          ...(p.porcentaje !== undefined && { porcentaje: p.porcentaje }),
          puntaje: p.puntaje || 0, // Se recalculará automáticamente
          orden: p.orden ?? 0,
          requerida: p.requerida ?? true,
          opciones: p.opciones.map((o, oIdx) => {
            const opcion: {
              id?: number;
              texto: string;
              imagenUrl?: string;
              esCorrecta: boolean;
              puntajeParcial: number;
              orden: number;
            } = {
              ...(o.id !== undefined && { id: o.id }),
              texto: o.texto || '',
              esCorrecta: Boolean(o.esCorrecta), // Asegurar que sea booleano
              puntajeParcial: o.puntajeParcial || 0,
              orden: o.orden ?? 0,
            };
            // Asegurar que imagenUrl se asigne correctamente si existe
            if (o.imagenUrl !== undefined && o.imagenUrl !== null && String(o.imagenUrl).trim() !== '') {
              opcion.imagenUrl = String(o.imagenUrl).trim();
              console.log('✅ Imagen asignada en formulario para opción:', {
                preguntaIndex: p.id || 'nueva',
                preguntaTipo: p.tipoPreguntaId,
                opcionIndex: oIdx,
                texto: o.texto,
                imagenUrl: opcion.imagenUrl,
                imagenUrlOriginal: o.imagenUrl,
                urlCompleta: buildFullUrl(opcion.imagenUrl),
              });
            } else {
              console.log('⚠️ No hay imagenUrl para opción:', {
                preguntaIndex: p.id || 'nueva',
                preguntaTipo: p.tipoPreguntaId,
                opcionIndex: oIdx,
                texto: o.texto,
                imagenUrl: o.imagenUrl,
                tipoImagenUrl: typeof o.imagenUrl,
              });
            }
            return opcion;
          }),
        };
        return pregunta;
      }),
    };
    // Calcular puntajes después de cargar datos iniciales
    calculateQuestionScores();
  }
}

// Flag para rastrear si el usuario modificó manualmente el título de evaluación
// IMPORTANTE: Declarar antes de los watches que lo usan
const evaluationTitleManuallyModified = ref(false);
// Flag temporal para evitar que el watch del título de evaluación se active durante la sincronización
const isSyncingFromTrainingTitle = ref(false);
// Flag para rastrear si el usuario modificó manualmente la descripción de evaluación
const evaluationDescriptionManuallyModified = ref(false);
// Flag temporal para evitar que el watch de la descripción de evaluación se active durante la sincronización
const isSyncingFromTrainingDescription = ref(false);

// Inicializar cuando se monta el componente o cambian los props
watch(
  () => props.initialData,
  () => {
    initializeFormWithData();
    // Resetear los flags cuando se inicializa con datos nuevos
    evaluationTitleManuallyModified.value = false;
    evaluationDescriptionManuallyModified.value = false;
  },
  { immediate: true },
);

// También inicializar materiales cuando cambien
watch(
  () => props.initialMaterials,
  (newMaterials) => {
    if (newMaterials && newMaterials.length > 0) {
      videos.value = newMaterials.filter((m) => m.type === 'VIDEO');
      files.value = newMaterials.filter((m) => m.type !== 'VIDEO');
    }
  },
  { immediate: true },
);

// Sincronizar título de capacitación con título de evaluación
// Sincroniza automáticamente a menos que el usuario haya modificado manualmente el título de evaluación
watch(
  () => form.title,
  (newTitle) => {
    if (form.evaluationInline && newTitle && newTitle.trim()) {
      // Solo sincronizar si el usuario no ha modificado manualmente el título de evaluación
      if (!evaluationTitleManuallyModified.value) {
        isSyncingFromTrainingTitle.value = true;
        form.evaluationInline.titulo = newTitle.trim();
        // Resetear el flag después de un pequeño delay para que el watch del título de evaluación no se active
        setTimeout(() => {
          isSyncingFromTrainingTitle.value = false;
        }, 0);
      }
    }
  },
);

// Detectar cuando el usuario modifica manualmente el título de evaluación
watch(
  () => form.evaluationInline?.titulo,
  (newEvalTitle) => {
    // No hacer nada si estamos sincronizando desde el título de capacitación
    if (isSyncingFromTrainingTitle.value) {
      return;
    }

    if (form.evaluationInline && form.title) {
      // Si el título de evaluación no coincide con el título de capacitación,
      // significa que el usuario lo modificó manualmente
      const trainingTitle = form.title.trim();
      const evalTitle = newEvalTitle?.trim() || '';

      if (evalTitle && evalTitle !== trainingTitle) {
        evaluationTitleManuallyModified.value = true;
      } else if (evalTitle === trainingTitle) {
        // Si vuelve a coincidir, resetear el flag (por si el usuario borra y vuelve a escribir)
        evaluationTitleManuallyModified.value = false;
      }
    }
  },
);

// Sincronizar descripción de capacitación con descripción de evaluación
// Sincroniza automáticamente a menos que el usuario haya modificado manualmente la descripción de evaluación
watch(
  () => form.description,
  (newDescription) => {
    if (form.evaluationInline && newDescription && newDescription.trim()) {
      // Solo sincronizar si el usuario no ha modificado manualmente la descripción de evaluación
      if (!evaluationDescriptionManuallyModified.value) {
        isSyncingFromTrainingDescription.value = true;
        form.evaluationInline.descripcion = newDescription.trim();
        // Resetear el flag después de un pequeño delay para que el watch de la descripción de evaluación no se active
        setTimeout(() => {
          isSyncingFromTrainingDescription.value = false;
        }, 0);
      }
    }
  },
);

// Detectar cuando el usuario modifica manualmente la descripción de evaluación
watch(
  () => form.evaluationInline?.descripcion,
  (newEvalDescription) => {
    // No hacer nada si estamos sincronizando desde la descripción de capacitación
    if (isSyncingFromTrainingDescription.value) {
      return;
    }

    if (form.evaluationInline && form.description) {
      // Si la descripción de evaluación no coincide con la descripción de capacitación,
      // significa que el usuario la modificó manualmente
      const trainingDescription = form.description.trim();
      const evalDescription = newEvalDescription?.trim() || '';

      if (evalDescription && evalDescription !== trainingDescription) {
        evaluationDescriptionManuallyModified.value = true;
      } else if (evalDescription === trainingDescription) {
        // Si vuelve a coincidir, resetear el flag (por si el usuario borra y vuelve a escribir)
        evaluationDescriptionManuallyModified.value = false;
      }
    }
  },
);

// Watch para recalcular puntajes cuando cambian las preguntas (agregar/eliminar)
watch(
  () => form.evaluationInline?.preguntas?.length,
  () => {
    calculateQuestionScores();
  }
);

// Watch para recalcular cuando cambia un porcentaje específico
watch(
  () => form.evaluationInline?.preguntas?.map((p) => p.porcentaje),
  () => {
    // Usar nextTick para asegurar que el cambio se haya aplicado
    setTimeout(() => {
      calculateQuestionScores();
    }, 0);
  },
  { deep: true }
);

async function onSubmit() {
  // Prevenir doble submit
  if (isSubmitting.value) {
    return;
  }

  // Validar evaluación obligatoria - siempre inline ahora
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
      message: 'Debe agregar al menos una pregunta',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  // Subir automáticamente todas las imágenes pendientes antes de enviar
  if (form.evaluationInline && form.evaluationInline.preguntas) {
    const pendingUploads: Promise<void>[] = [];
    
    for (let preguntaIndex = 0; preguntaIndex < form.evaluationInline.preguntas.length; preguntaIndex++) {
      const pregunta = form.evaluationInline.preguntas[preguntaIndex];
      if (pregunta && pregunta.tipoPreguntaId === 3 && pregunta.opciones) {
        // Es pregunta tipo imagen, verificar si hay imágenes pendientes
        for (let opcionIndex = 0; opcionIndex < pregunta.opciones.length; opcionIndex++) {
          const opcion = pregunta.opciones[opcionIndex];
          if (opcion) {
            const key = getOptionKey(preguntaIndex, opcionIndex);
            const file = optionImageFiles.value.get(key);
            
            // Si hay un archivo seleccionado pero no subido, subirlo
            if (file && !opcion.imagenUrl) {
              pendingUploads.push(uploadOptionImage(preguntaIndex, opcionIndex));
            }
          }
        }
      }
    }
    
    // Esperar a que todas las imágenes se suban
    if (pendingUploads.length > 0) {
      isSubmitting.value = true;
      try {
        await Promise.all(pendingUploads);
        $q.notify({
          type: 'info',
          message: `${pendingUploads.length} imagen(es) subida(s) exitosamente`,
          position: 'top',
          timeout: 2000,
        });
      } catch (error) {
        console.error('Error al subir imágenes pendientes:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al subir algunas imágenes. Por favor, intente nuevamente.',
          position: 'top',
        });
        isSubmitting.value = false;
        return;
      }
    }
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

  // Marcar como submitting antes de emitir
  isSubmitting.value = true;
  
  try {
    // Verificar que las imágenes se hayan guardado correctamente antes de enviar
    if (form.evaluationInline) {
      console.log('📤 Enviando formulario con evaluación inline:', {
        preguntas: form.evaluationInline.preguntas.map((p, idx) => ({
          index: idx,
          tipo: p.tipoPreguntaId,
          opciones: p.opciones.map((o, oIdx) => ({
            index: oIdx,
            texto: o.texto,
            imagenUrl: o.imagenUrl,
            tieneImagen: !!o.imagenUrl,
          })),
        })),
      });
    }
    
    emit('submit', { ...form }, materials.value);
  } catch (error) {
    // Si hay error en el emit, resetear el estado
    isSubmitting.value = false;
    throw error;
  }
  // Nota: No resetear isSubmitting aquí, dejar que handleSubmit lo haga cuando termine
}

// Exponer estado para que el componente padre pueda resetearlo
defineExpose({
  isSubmitting,
  resetSubmitting: () => {
    isSubmitting.value = false;
  },
});

// Funciones de attachments removidas - ya no se usan en el formulario actual

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

// Función para cargar instructores del backend
async function loadInstructors() {
  loadingInstructors.value = true;
  try {
    // Obtener todos los instructores filtrados únicamente por rol INSTRUCTOR
    // Sin filtrar por usuario creador - se muestran todos los instructores disponibles
    const response = await usersService.findAll({
      page: 1,
      limit: 1000, // Obtener todos los instructores
      filters: {
        // @ts-expect-error - 'instructor' no está en UserRole pero el backend lo soporta
        role: 'instructor', // El servicio mapeará esto a 'INSTRUCTOR' en el backend
      },
    });

    // Mapear usuarios a opciones para el select
    allInstructors.value = response.data.map((user) => ({
      label: user.name?.trim() || user.email || `Usuario ${user.id}`,
      value: user.id.toString(),
    }));

    instructorOptions.value = [...allInstructors.value];
  } catch (error) {
    console.error('Error al cargar instructores:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de instructores',
      position: 'top',
      timeout: 3000,
    });
  } finally {
    loadingInstructors.value = false;
  }
}

// Función para filtrar instructores en el select
function filterInstructors(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      instructorOptions.value = [...allInstructors.value];
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    instructorOptions.value = allInstructors.value.filter(
      (instructor) => instructor.label.toLowerCase().indexOf(needle) > -1,
    );
  });
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
  const typeMap: Record<string, string> = {
    PDF: 'PDF',
    IMAGE: 'Imagen',
    VIDEO: 'Video',
    DOC: 'Documento Word',
    LINK: 'Enlace externo',
    PRESENTATION: 'Presentación',
    AUDIO: 'Audio',
  };
  return typeMap[type] || type;
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
    
    .video-preview {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; // Aspect ratio 16:9
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.1);
      
      .video-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }
    }
    
    .image-preview {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        
        .image-thumbnail {
          transform: scale(1.05);
        }
      }
      
      .image-thumbnail {
        width: 100%;
        border-radius: 8px;
        transition: transform 0.2s ease;
        cursor: pointer;
      }
    }
    
    // Estilos para imágenes de opciones de respuesta (similar a materiales)
    // Estilos para miniaturas de imágenes de opciones de respuesta
    .option-image-wrapper {
      padding: 8px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .option-image-thumbnail-container {
      width: 200px !important;
      min-width: 200px !important;
      height: 110px !important;
      min-height: 110px !important;
      max-width: 200px !important;
      max-height: 110px !important;
      overflow: hidden;
      border-radius: 6px;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
    
    .option-image-thumbnail {
      width: 100% !important;
      height: 100% !important;
      max-width: 200px !important;
      max-height: 110px !important;
      object-fit: cover;
      display: block;
    }
    
    .option-image-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .pdf-preview {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; // Aspect ratio 16:9
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
      border: 2px solid rgba(244, 67, 54, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
        transform: translateY(-2px);
        border-color: rgba(244, 67, 54, 0.4);
        
        .pdf-overlay {
          opacity: 1;
        }
        
        .pdf-preview-content {
          opacity: 0.3;
        }
      }
      
      .pdf-preview-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
        z-index: 1;
      }
      
      .pdf-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 8px;
        z-index: 2;
        
        .pdf-overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
      }
    }
    
    .file-icon-container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .material-info {
    min-width: 0; // Permite que el texto se trunque
  }

  .material-actions {
    flex-shrink: 0;
  }
}

// Para hacer el preview más grande en pantallas medianas
@media (min-width: 600px) {
  .materials-list .material-preview-container {
    width: 200px;
    min-width: 200px;
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

// Estilos para campos readonly compatibles con modo oscuro
.readonly-field {
  .q-field__control {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

body.body--light {
  .readonly-field {
    .q-field__control {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}

body.body--dark {
  .readonly-field {
    .q-field__control {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

// Estilos para el modal de PDF
.pdf-modal-card {
  width: 90vw;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  
  .pdf-modal-header {
    flex-shrink: 0;
    padding: 16px 24px;
    background-color: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .pdf-modal-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    position: relative;
    
    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
      flex: 1;
      min-height: 0;
    }
  }
}

// Ajustes responsivos para el modal de PDF
@media (max-width: 768px) {
  .pdf-modal-card {
    width: 95vw;
    height: 95vh;
    max-height: none;
  }
}

body.body--dark {
  .pdf-modal-card {
    .pdf-modal-header {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
  
  .pdf-preview {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.08) 100%);
    border-color: rgba(244, 67, 54, 0.3);
    
    &:hover {
      border-color: rgba(244, 67, 54, 0.5);
    }
  }
}

// Ocultar input de archivo para opciones de imagen
.hidden-file-input {
  display: none !important;
}

// Utilidad para opacidad
.opacity-60 {
  opacity: 0.6;
}

// Estilos para la vista previa de imagen de portada
.cover-image-preview-container {
  width: 50%;
  
  .cover-image-preview {
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; // Aspect ratio 16:9
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.05);
    border: 2px solid rgba(0, 0, 0, 0.1);
    
    .cover-image-thumbnail {
      width: 100%;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.02);
      }
    }
  }
}

body.body--dark {
  .cover-image-preview-container {
    .cover-image-preview {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
