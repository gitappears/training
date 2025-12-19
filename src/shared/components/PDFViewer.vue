<template>
  <div class="pdf-viewer">
    <div
      v-if="loading"
      class="loading-container"
    >
      <q-spinner
        color="primary"
        size="3em"
      />
      <div class="q-mt-md text-body2">
        Cargando PDF...
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
      <q-btn
        v-if="allowRetry"
        color="primary"
        label="Reintentar"
        class="q-mt-md"
        @click="loadPdf"
      />
    </div>

    <div
      v-else
      class="pdf-container"
    >
      <!-- Controles de zoom y navegación -->
      <div class="pdf-controls q-mb-md">
        <q-btn-group
          flat
          rounded
        >
          <q-btn
            icon="zoom_out"
            :disable="zoom <= minZoom"
            @click="zoomOut"
          >
            <q-tooltip>Alejar</q-tooltip>
          </q-btn>
          <q-btn
            :label="`${Math.round(zoom * 100)}%`"
            disable
            style="min-width: 80px;"
          />
          <q-btn
            icon="zoom_in"
            :disable="zoom >= maxZoom"
            @click="zoomIn"
          >
            <q-tooltip>Acercar</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-space />

        <q-btn-group
          flat
          rounded
        >
          <q-btn
            icon="first_page"
            :disable="currentPage <= 1"
            @click="goToFirstPage"
          >
            <q-tooltip>Primera página</q-tooltip>
          </q-btn>
          <q-btn
            icon="chevron_left"
            :disable="currentPage <= 1"
            @click="previousPage"
          >
            <q-tooltip>Página anterior</q-tooltip>
          </q-btn>
          <q-btn
            :label="`${currentPage} / ${totalPages}`"
            disable
            style="min-width: 100px;"
          />
          <q-btn
            icon="chevron_right"
            :disable="currentPage >= totalPages"
            @click="nextPage"
          >
            <q-tooltip>Página siguiente</q-tooltip>
          </q-btn>
          <q-btn
            icon="last_page"
            :disable="currentPage >= totalPages"
            @click="goToLastPage"
          >
            <q-tooltip>Última página</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-space />

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
            v-if="allowDownload"
            icon="download"
            @click="downloadPdf"
          >
            <q-tooltip>Descargar PDF</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>

      <!-- Contenedor del PDF -->
      <div
        ref="pdfContainer"
        class="pdf-content"
        :class="{ 'fullscreen': isFullscreen }"
      >
        <canvas
          ref="pdfCanvas"
          class="pdf-canvas"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  src: string;
  allowDownload?: boolean;
  allowRetry?: boolean;
  errorMessage?: string;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
  allowDownload: true,
  allowRetry: true,
  errorMessage: 'Error al cargar el PDF. Por favor, intente nuevamente.',
  minZoom: 0.5,
  maxZoom: 3,
  initialZoom: 1,
});

const emit = defineEmits<{
  loaded: [];
  error: [error: Error];
  pageChange: [page: number];
  download: [];
}>();

const loading = ref(true);
const error = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const zoom = ref(props.initialZoom);
const isFullscreen = ref(false);

const pdfContainer = ref<HTMLElement | null>(null);
const pdfCanvas = ref<HTMLCanvasElement | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfDoc: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;

onMounted(() => {
  loadPdfLibrary();
  void loadPdf();
});

onUnmounted(() => {
  if (isFullscreen.value) {
    exitFullscreen();
  }
});

watch(() => props.src, async () => {
  await loadPdf();
});

watch(zoom, () => {
  void renderPage();
});

function loadPdfLibrary() {
  try {
    // Intentar cargar pdfjs-dist si está disponible
    // En producción, esto debería estar instalado: npm install pdfjs-dist
    if (typeof window !== 'undefined') {
      // Mock para desarrollo - en producción usar librería real
      pdfjsLib = {
        getDocument: () => {
          // Mock implementation
          return {
            promise: Promise.resolve({
              numPages: 1,
              getPage: () => ({
                getViewport: () => ({ width: 800, height: 600 }),
                render: () => Promise.resolve(),
              }),
            }),
          };
        },
      };
    }
  } catch (err) {
    console.error('Error loading PDF.js library:', err);
  }
}

async function loadPdf() {
  loading.value = true;
  error.value = false;

  try {
    if (!pdfjsLib) {
      loadPdfLibrary();
    }

    if (!pdfjsLib) {
      throw new Error('PDF.js library not available. Please install pdfjs-dist package.');
    }

    const loadingTask = pdfjsLib.getDocument(props.src);
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    currentPage.value = 1;

    await renderPage();

    loading.value = false;
    emit('loaded');
  } catch (err) {
    loading.value = false;
    error.value = true;
    const errorObj = err instanceof Error ? err : new Error(String(err));
    emit('error', errorObj);
    console.error('Error loading PDF:', err);
  }
}

async function renderPage() {
  if (!pdfDoc || !pdfCanvas.value) return;

  try {
    const page = await pdfDoc.getPage(currentPage.value);
    const viewport = page.getViewport({ scale: zoom.value });

    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  } catch (err) {
    console.error('Error rendering PDF page:', err);
  }
}

function zoomIn() {
  if (zoom.value < props.maxZoom) {
    zoom.value = Math.min(zoom.value + 0.25, props.maxZoom);
  }
}

function zoomOut() {
  if (zoom.value > props.minZoom) {
    zoom.value = Math.max(zoom.value - 0.25, props.minZoom);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    emit('pageChange', currentPage.value);
    void renderPage();
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    emit('pageChange', currentPage.value);
    void renderPage();
  }
}

function goToFirstPage() {
  currentPage.value = 1;
  emit('pageChange', currentPage.value);
  void renderPage();
}

function goToLastPage() {
  currentPage.value = totalPages.value;
  emit('pageChange', currentPage.value);
  void renderPage();
}

function toggleFullscreen() {
  if (!isFullscreen.value) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

function enterFullscreen() {
  if (pdfContainer.value) {
    if (pdfContainer.value.requestFullscreen) {
      void pdfContainer.value.requestFullscreen();
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

function downloadPdf() {
  emit('download');
  const link = document.createElement('a');
  link.href = props.src;
  link.download = 'documento.pdf';
  link.click();
}
</script>

<style scoped lang="scss">
.pdf-viewer {
  width: 100%;
  height: 100%;

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
  }

  .pdf-container {
    width: 100%;
  }

  .pdf-controls {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .pdf-content {
    width: 100%;
    overflow: auto;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    background-color: #f5f5f5;
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 600px;
    max-height: 80vh;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      max-height: 100vh;
      border: none;
      border-radius: 0;
    }
  }

  .pdf-canvas {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
}

.body--dark {
  .pdf-viewer {
    .pdf-controls {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .pdf-content {
      border-color: rgba(255, 255, 255, 0.12);
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>

