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
            :rules="[(val) => !!val || 'El título es obligatorio']"
            hint="Nombre descriptivo y atractivo para la capacitación"
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
            hint="Proporciona información detallada que motive a los participantes"
            rows="4"
            :dense="false"
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
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-sm text-weight-medium">
            <q-icon name="attach_file" size="18px" class="q-mr-xs" />
            Adjuntos (archivos / documentos)
          </div>
          <div v-if="form.attachments.length === 0" class="text-grey-6 q-mb-sm">
            No hay adjuntos agregados
          </div>
          <div class="column q-gutter-sm">
            <q-card
              v-for="(att, index) in form.attachments"
              :key="att.id"
              flat
              bordered
              class="q-pa-sm"
            >
              <div class="row q-col-gutter-sm items-center">
                <div class="col-5">
                  <q-input
                    v-model="att.label"
                    dense
                    filled
                    label="Nombre del adjunto"
                    placeholder="Ej: Guía de estudio"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="att.url"
                    dense
                    filled
                    label="URL / ruta"
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
                    @click="removeAttachment(index)"
                  >
                    <q-tooltip>Eliminar adjunto</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card>
            <q-btn
              outline
              color="primary"
              icon="add"
              label="Agregar adjunto"
              @click="addAttachment"
              class="q-mt-sm"
            />
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-sm text-weight-medium">
            <q-icon name="link" size="18px" class="q-mr-xs" />
            Enlaces Externos
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
        </div>
      </div>
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
import { reactive, ref } from 'vue';

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
  attachments: { id: string; label: string; url: string }[];
  links: { id: string; label: string; url: string }[];
}

const emit = defineEmits<{
  submit: [TrainingFormModel];
}>();

const showImagePreview = ref(false);

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
  form.attachments = [];
  form.links = [];
  showImagePreview.value = false;
}

function onSubmit() {
  emit('submit', { ...form });
}

function addAttachment() {
  form.attachments.push({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    label: '',
    url: '',
  });
}

function removeAttachment(index: number) {
  form.attachments.splice(index, 1);
}

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

function validateImageUrl() {
  if (form.coverImageUrl && !form.coverImageUrl.startsWith('http')) {
    // Podrías agregar validación adicional aquí
  }
}
</script>

<style scoped>
.q-card {
  transition: box-shadow 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
