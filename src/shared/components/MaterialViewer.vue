<template>
  <div class="material-viewer">
    <!-- Preview del material antes de abrir -->
    <div
      v-if="showPreview && !isViewing"
      class="material-preview"
    >
      <q-card
        flat
        bordered
        class="preview-card cursor-pointer"
        @click="openViewer"
      >
        <q-card-section class="row items-center q-pa-md">
          <q-avatar
            :icon="materialIcon"
            :color="materialColor"
            text-color="white"
            size="48px"
            class="q-mr-md"
          />
          <div class="col">
            <div class="text-body1 text-weight-medium">
              {{ material.name || 'Material' }}
            </div>
            <div
              v-if="material.description"
              class="text-caption text-grey-7 q-mt-xs"
            >
              {{ material.description }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              <q-icon
                :name="materialTypeIcon"
                size="14px"
                class="q-mr-xs"
              />
              {{ materialTypeLabel }}
            </div>
          </div>
          <q-btn
            icon="open_in_new"
            flat
            round
            dense
            @click.stop="openViewer"
          >
            <q-tooltip>Ver material</q-tooltip>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <!-- Visualizador principal -->
    <div
      v-else-if="isViewing"
      class="material-viewer-container"
    >
      <!-- Header del visualizador -->
      <div class="viewer-header q-pa-md">
        <div class="row items-center">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            @click="closeViewer"
          >
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
          <div class="col q-ml-md">
            <div class="text-h6 text-weight-medium">
              {{ material.name || 'Material' }}
            </div>
            <div
              v-if="material.description"
              class="text-caption text-grey-7 q-mt-xs"
            >
              {{ material.description }}
            </div>
          </div>
          <q-btn-group
            flat
            rounded
          >
            <q-btn
              v-if="allowDownload"
              icon="download"
              @click="downloadMaterial"
            >
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn
              icon="fullscreen"
              @click="toggleFullscreen"
            >
              <q-tooltip>Pantalla completa</q-tooltip>
            </q-btn>
            <q-btn
              icon="close"
              @click="closeViewer"
            >
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </div>

      <!-- Contenido según tipo de material -->
      <div class="viewer-content">
        <!-- PDF -->
        <PDFViewer
          v-if="materialType === 'PDF'"
          :src="material.url"
          :title="material.name"
          :allow-download="allowDownload"
          :allow-retry="true"
          class="full-height"
        />

        <!-- Imagen -->
        <div
          v-else-if="materialType === 'IMAGE'"
          class="image-viewer full-height"
        >
          <q-img
            :src="material.url"
            :alt="material.name"
            class="full-height"
            fit="contain"
            loading="lazy"
          >
            <template #loading>
              <div class="absolute-full flex flex-center">
                <q-spinner
                  color="primary"
                  size="3em"
                />
              </div>
            </template>
          </q-img>
        </div>

        <!-- Video -->
        <div
          v-else-if="materialType === 'VIDEO'"
          class="video-viewer full-height"
        >
          <VideoPlayer
            :src="material.url"
            :title="material.name"
            :allow-download="allowDownload"
            :allow-retry="true"
            class="full-height"
          />
        </div>

        <!-- Otros tipos (link, audio, etc.) -->
        <div
          v-else
          class="other-material-viewer full-height flex flex-center column q-pa-xl"
        >
          <q-icon
            :name="materialIcon"
            size="64px"
            :color="materialColor"
          />
          <div class="text-h6 q-mt-md text-weight-medium">
            {{ material.name }}
          </div>
          <div
            v-if="material.description"
            class="text-body2 text-grey-7 q-mt-sm text-center"
          >
            {{ material.description }}
          </div>
          <q-btn
            v-if="material.url"
            color="primary"
            label="Abrir enlace"
            icon="open_in_new"
            class="q-mt-lg"
            @click="openLink"
          />
        </div>
      </div>
    </div>

    <!-- Vista directa sin preview -->
    <div
      v-else
      class="material-viewer-direct"
    >
      <!-- PDF -->
      <PDFViewer
        v-if="materialType === 'PDF'"
        :src="material.url"
        :title="material.name"
        :allow-download="allowDownload"
        :allow-retry="true"
      />

      <!-- Imagen -->
      <div
        v-else-if="materialType === 'IMAGE'"
        class="image-viewer"
      >
        <q-img
          :src="material.url"
          :alt="material.name"
          fit="contain"
          loading="lazy"
          class="material-image"
        >
          <template #loading>
            <div class="absolute-full flex flex-center">
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
          </template>
        </q-img>
      </div>

      <!-- Video -->
      <div
        v-else-if="materialType === 'VIDEO'"
        class="video-viewer"
      >
        <VideoPlayer
          :src="material.url"
          :title="material.name"
          :allow-download="allowDownload"
          :allow-retry="true"
        />
      </div>

      <!-- Otros tipos -->
      <div
        v-else
        class="other-material-viewer flex flex-center column q-pa-xl"
      >
        <q-icon
          :name="materialIcon"
          size="64px"
          :color="materialColor"
        />
        <div class="text-h6 q-mt-md text-weight-medium">
          {{ material.name }}
        </div>
        <q-btn
          v-if="material.url"
          color="primary"
          label="Abrir enlace"
          icon="open_in_new"
          class="q-mt-lg"
          @click="openLink"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PDFViewer from './PDFViewer.vue';
import VideoPlayer from './VideoPlayer.vue';

export interface Material {
  id?: string;
  name: string;
  url: string;
  type: 'PDF' | 'IMAGE' | 'VIDEO' | 'DOC' | 'LINK' | 'PRESENTATION' | 'AUDIO';
  description?: string;
  order?: number;
}

interface Props {
  material: Material;
  showPreview?: boolean;
  allowDownload?: boolean;
  allowFullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPreview: false,
  allowDownload: true,
  allowFullscreen: true,
});

const emit = defineEmits<{
  download: [];
  close: [];
  open: [];
}>();

const isViewing = ref(!props.showPreview);
const isFullscreen = ref(false);

const materialType = computed(() => props.material.type);

const materialIcon = computed(() => {
  switch (props.material.type) {
    case 'PDF':
      return 'picture_as_pdf';
    case 'IMAGE':
      return 'image';
    case 'VIDEO':
      return 'play_circle';
    case 'DOC':
      return 'description';
    case 'LINK':
      return 'link';
    case 'PRESENTATION':
      return 'slideshow';
    case 'AUDIO':
      return 'audiotrack';
    default:
      return 'insert_drive_file';
  }
});

const materialColor = computed(() => {
  switch (props.material.type) {
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
});

const materialTypeIcon = computed(() => materialIcon.value);

const materialTypeLabel = computed(() => {
  switch (props.material.type) {
    case 'PDF':
      return 'Documento PDF';
    case 'IMAGE':
      return 'Imagen';
    case 'VIDEO':
      return 'Video';
    case 'DOC':
      return 'Documento Word';
    case 'LINK':
      return 'Enlace externo';
    case 'PRESENTATION':
      return 'Presentación';
    case 'AUDIO':
      return 'Audio';
    default:
      return 'Archivo';
  }
});

function openViewer() {
  isViewing.value = true;
  emit('open');
}

function closeViewer() {
  isViewing.value = false;
  emit('close');
}

function downloadMaterial() {
  if (props.material.url) {
    const link = document.createElement('a');
    link.href = props.material.url;
    link.download = props.material.name || 'material';
    link.target = '_blank';
    link.click();
    emit('download');
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  // En una implementación completa, aquí se manejaría el fullscreen del contenedor
}

function openLink() {
  if (props.material.url) {
    window.open(props.material.url, '_blank');
  }
}
</script>

<style scoped lang="scss">
.material-viewer {
  width: 100%;

  .material-preview {
    .preview-card {
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .material-viewer-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 500px;

    .viewer-header {
      background-color: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .viewer-content {
      flex: 1;
      overflow: auto;
      position: relative;
    }
  }

  .material-viewer-direct {
    width: 100%;
  }

  .image-viewer {
    width: 100%;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;

    .material-image {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
    }
  }

  .video-viewer {
    width: 100%;
    min-height: 400px;
  }

  .other-material-viewer {
    min-height: 300px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .full-height {
    height: 100%;
  }
}

body.body--dark {
  .material-viewer {
    .viewer-header {
      background-color: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .image-viewer,
    .other-material-viewer {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>

