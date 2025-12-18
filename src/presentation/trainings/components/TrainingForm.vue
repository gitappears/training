<template>
  <q-form class="column q-gutter-md" @submit="onSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="form.title"
          filled
          label="Título de la capacitación *"
          :rules="[(val) => !!val || 'El título es obligatorio']"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="form.type"
          filled
          :options="trainingTypes"
          label="Tipo *"
          emit-value
          map-options
          :rules="[(val) => !!val || 'Seleccione un tipo']"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-input
          v-model="form.description"
          type="textarea"
          filled
          autogrow
          label="Descripción"
          hint="Describe brevemente objetivos y contenidos de la capacitación"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-select
          v-model="form.modality"
          filled
          :options="modalities"
          label="Modalidad *"
          emit-value
          map-options
          :rules="[(val) => !!val || 'Seleccione una modalidad']"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-input v-model="form.location" filled label="Lugar / enlace" />
      </div>
      <div class="col-6 col-md-2">
        <q-input v-model.number="form.durationHours" type="number" min="0" filled label="Horas" />
      </div>
      <div class="col-6 col-md-2">
        <q-input v-model.number="form.capacity" type="number" min="1" filled label="Cupos" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-input v-model="form.instructor" filled label="Relator / instructor" />
      </div>
      <div class="col-12 col-md-4">
        <q-input v-model="form.area" filled label="Área responsable" />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="form.targetAudience"
          filled
          :options="targetAudiences"
          label="Público objetivo"
        />
      </div>
    </div>

    <!-- Recursos: imagen de portada, video promo, adjuntos y links -->
    <q-separator spaced />

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.coverImageUrl"
          filled
          label="URL imagen de portada"
          hint="Imagen que se mostrará como portada del curso"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.promoVideoUrl"
          filled
          label="URL video promocional"
          hint="Opcional: video de presentación del curso"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <div class="text-subtitle2 q-mb-sm">Adjuntos (archivos / documentos)</div>
        <div class="column q-gutter-sm">
          <div v-for="(att, index) in form.attachments" :key="att.id" class="row q-col-gutter-sm">
            <div class="col">
              <q-input v-model="att.label" dense filled label="Nombre del adjunto" />
            </div>
            <div class="col">
              <q-input v-model="att.url" dense filled label="URL / ruta" />
            </div>
            <div class="col-auto self-center">
              <q-btn
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click="removeAttachment(index)"
              />
            </div>
          </div>
          <q-btn dense flat icon="attach_file" label="Agregar adjunto" @click="addAttachment" />
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="text-subtitle2 q-mb-sm">Links externos</div>
        <div class="column q-gutter-sm">
          <div v-for="(link, index) in form.links" :key="link.id" class="row q-col-gutter-sm">
            <div class="col">
              <q-input v-model="link.label" dense filled label="Texto del link" />
            </div>
            <div class="col">
              <q-input v-model="link.url" dense filled label="URL" />
            </div>
            <div class="col-auto self-center">
              <q-btn dense flat round icon="delete" color="negative" @click="removeLink(index)" />
            </div>
          </div>
          <q-btn dense flat icon="link" label="Agregar link" @click="addLink" />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input v-model="form.startDate" filled label="Fecha inicio" mask="####-##-##" />
      </div>
      <div class="col-12 col-md-6">
        <q-input v-model="form.endDate" filled label="Fecha término" mask="####-##-##" />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat label="Limpiar" color="primary" @click="reset" />
      <q-btn type="submit" color="primary" unelevated label="Crear capacitación" />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

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

const targetAudiences = ['Todos los colaboradores', 'Jefaturas', 'Operaciones', 'Backoffice'];

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
</script>
