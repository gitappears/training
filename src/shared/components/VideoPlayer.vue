<template>
  <div class="video-player">
    <div
      v-if="loading"
      class="loading-container"
    >
      <q-spinner
        color="primary"
        size="3em"
      />
      <div class="q-mt-md text-body2">
        Cargando video...
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-container"
    >
      <q-icon
        name="error_outline"
        size="48px"
        color="negative"
      />
      <div class="q-mt-md text-body1 text-negative">
        {{ errorMessage }}
      </div>
      <div class="q-mt-sm text-body2 text-grey-7">
        Este video no está disponible. Por favor, contacte al administrador.
      </div>
      <q-btn
        v-if="allowRetry"
        color="primary"
        label="Reintentar"
        class="q-mt-md"
        @click="validateAndLoad"
      />
    </div>

    <div
      v-else-if="videoUrl"
      class="video-container"
    >
      <!-- Controles del reproductor -->
      <div class="video-controls q-mb-md">
        <q-btn-group
          flat
          rounded
        >
          <q-btn
            icon="fullscreen"
            @click="toggleFullscreen"
          >
            <q-tooltip>Pantalla completa</q-tooltip>
          </q-btn>
          <q-btn
            v-if="allowDownload && downloadUrl"
            icon="download"
            @click="downloadVideo"
          >
            <q-tooltip>Descargar video</q-tooltip>
          </q-btn>
          <q-btn
            icon="open_in_new"
            @click="openInNewTab"
          >
            <q-tooltip>Abrir en nueva pestaña</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>

      <!-- Iframe del video -->
      <div
        ref="videoWrapper"
        class="video-wrapper"
        :class="{ 'fullscreen': isFullscreen }"
      >
        <iframe
          :src="embedUrl"
          :title="title"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="video-iframe"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Props {
  src: string;
  title?: string;
  allowDownload?: boolean;
  allowRetry?: boolean;
  errorMessage?: string;
  autoplay?: boolean;
  controls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Video',
  allowDownload: false,
  allowRetry: true,
  errorMessage: 'Error al cargar el video.',
  autoplay: false,
  controls: true,
});

const emit = defineEmits<{
  loaded: [];
  error: [error: Error];
  download: [];
}>();

const loading = ref(true);
const error = ref(false);
const videoUrl = ref<string | null>(null);
const embedUrl = ref<string>('');
const downloadUrl = ref<string | null>(null);
const isFullscreen = ref(false);

const videoWrapper = ref<HTMLElement | null>(null);

const videoType = computed(() => {
  if (!props.src) return null;
  const url = props.src.toLowerCase();
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('drive.google.com')) return 'googledrive';
  if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) return 'onedrive';
  return null;
});

onMounted(() => {
  void validateAndLoad();
});

watch(() => props.src, () => {
  void validateAndLoad();
});

function validateAndLoad() {
  loading.value = true;
  error.value = false;
  videoUrl.value = null;
  embedUrl.value = '';
  downloadUrl.value = null;

  try {
    // Validar URL según RF-12, RF-13, RF-14
    const type = videoType.value;

    if (!type) {
      throw new Error('URL de video no válida. Solo se permiten YouTube, Google Drive y OneDrive.');
    }

    // Validar que la URL sea accesible (RF-12)
    const isValid = validateVideoUrl(props.src, type);

    if (!isValid) {
      throw new Error('El video no está disponible o no es accesible.');
    }

    // Generar URL de embed según el tipo (RF-13)
    embedUrl.value = generateEmbedUrl(props.src, type);

    videoUrl.value = props.src;
    downloadUrl.value = props.src;

    loading.value = false;
    emit('loaded');
  } catch (err) {
    loading.value = false;
    error.value = true;
    const errorObj = err instanceof Error ? err : new Error(String(err));
    emit('error', errorObj);
    console.error('Error loading video:', err);
  }
}

function validateVideoUrl(url: string, type: string): boolean {
  // Validación básica - en producción se podría hacer una petición HEAD
  // para verificar que la URL es accesible
  try {
    // Para YouTube, validar formato
    if (type === 'youtube') {
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
      return youtubeRegex.test(url);
    }

    // Para Google Drive, validar formato
    if (type === 'googledrive') {
      return url.includes('drive.google.com') && (url.includes('/file/d/') || url.includes('id='));
    }

    // Para OneDrive, validar formato
    if (type === 'onedrive') {
      return url.includes('onedrive.live.com') || url.includes('1drv.ms');
    }

    return false;
  } catch {
    return false;
  }
}

function generateEmbedUrl(url: string, type: string): string {
  if (type === 'youtube') {
    // Extraer ID de YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      const videoId = match[1];
      const autoplayParam = props.autoplay ? '&autoplay=1' : '';
      return `https://www.youtube.com/embed/${videoId}?rel=0${autoplayParam}`;
    }
  }

  if (type === 'googledrive') {
    // Extraer ID de Google Drive
    let fileId = '';
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    } else if (url.includes('id=')) {
      const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }

    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  if (type === 'onedrive') {
    // OneDrive requiere conversión especial
    // Por ahora, usar la URL directamente si es un enlace de embed
    if (url.includes('/embed')) {
      return url;
    }
    // Intentar convertir URL de OneDrive a embed
    // Nota: Esto puede requerir la API de Microsoft Graph en producción
    return url;
  }

  return url;
}

function toggleFullscreen() {
  if (!isFullscreen.value) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

function enterFullscreen() {
  if (videoWrapper.value) {
    if (videoWrapper.value.requestFullscreen) {
      void videoWrapper.value.requestFullscreen();
    }
    isFullscreen.value = true;
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    void document.exitFullscreen();
  }
  isFullscreen.value = false;
}

function downloadVideo() {
  if (downloadUrl.value) {
    emit('download');
    const link = document.createElement('a');
    link.href = downloadUrl.value;
    link.target = '_blank';
    link.click();
  }
}

function openInNewTab() {
  if (videoUrl.value) {
    window.open(videoUrl.value, '_blank');
  }
}
</script>

<style scoped lang="scss">
.video-player {
  width: 100%;

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
    text-align: center;
  }

  .video-container {
    width: 100%;
  }

  .video-controls {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; // 16:9 aspect ratio
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    background-color: #000;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      padding-bottom: 0;
      z-index: 9999;
      border-radius: 0;
    }
  }

  .video-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
}

.body--dark {
  .video-player {
    .video-controls {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>

