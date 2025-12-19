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
import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import MaterialViewer from '../../../shared/components/MaterialViewer.vue';
import type { Material } from '../../../shared/components/MaterialViewer.vue';

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

const $q = useQuasar();
const showImagePreview = ref(false);
const showAddMaterialDialog = ref(false);
const editingMaterialIndex = ref<number | null>(null);
const materials = ref<Material[]>([]);

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
</style>
