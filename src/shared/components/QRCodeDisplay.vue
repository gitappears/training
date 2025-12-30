<template>
  <div class="qrcode-display">
    <div
      v-if="loading"
      class="loading-container"
    >
      <q-spinner
        color="primary"
        size="2em"
      />
      <div class="q-mt-sm text-caption">
        Generando código QR...
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-container"
    >
      <q-icon
        name="error_outline"
        size="32px"
        color="negative"
      />
      <div class="q-mt-sm text-caption text-negative">
        {{ errorMessage }}
      </div>
    </div>

    <div
      v-else
      class="qrcode-container"
      :class="{ 'with-border': showBorder, 'with-background': showBackground }"
    >
      <!-- Código QR -->
      <div
        ref="qrCodeContainer"
        class="qrcode-image"
        :style="qrCodeStyle"
      />

      <!-- Información adicional -->
      <div
        v-if="showInfo"
        class="qrcode-info q-mt-sm"
      >
        <div
          v-if="title"
          class="text-subtitle2 text-center q-mb-xs"
        >
          {{ title }}
        </div>
        <div
          v-if="description"
          class="text-caption text-grey-7 text-center"
        >
          {{ description }}
        </div>
      </div>

      <!-- Acciones -->
      <div
        v-if="showActions"
        class="qrcode-actions q-mt-md"
      >
        <q-btn
          v-if="allowDownload"
          flat
          dense
          icon="download"
          label="Descargar"
          color="primary"
          size="sm"
          @click="downloadQR"
        />
        <q-btn
          v-if="allowCopy"
          flat
          dense
          icon="content_copy"
          label="Copiar"
          color="primary"
          size="sm"
          @click="copyQR"
        />
        <q-btn
          v-if="allowPrint"
          flat
          dense
          icon="print"
          label="Imprimir"
          color="primary"
          size="sm"
          @click="printQR"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  value: string;
  size?: number;
  title?: string;
  description?: string;
  showBorder?: boolean;
  showBackground?: boolean;
  showInfo?: boolean;
  showActions?: boolean;
  allowDownload?: boolean;
  allowCopy?: boolean;
  allowPrint?: boolean;
  errorMessage?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  showBorder: true,
  showBackground: true,
  showInfo: true,
  showActions: true,
  allowDownload: true,
  allowCopy: true,
  allowPrint: true,
  errorMessage: 'Error al generar el código QR.',
  errorCorrectionLevel: 'M',
  margin: 4,
});

const emit = defineEmits<{
  generated: [];
  error: [error: Error];
  download: [];
  copy: [];
  print: [];
}>();

const $q = useQuasar();

const loading = ref(true);
const error = ref(false);

const qrCodeContainer = ref<HTMLElement | null>(null);

const qrCodeStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
  };
});

onMounted(() => {
  void generateQR();
});

watch(() => props.value, () => {
  void generateQR();
});

watch(() => props.size, () => {
  void generateQR();
});

async function generateQR() {
  loading.value = true;
  error.value = false;

  try {
    if (!props.value) {
      throw new Error('El valor para el código QR no puede estar vacío.');
    }

    if (!qrCodeContainer.value) {
      throw new Error('Contenedor de QR no disponible');
    }

    // Si el valor es una imagen base64 (data:image), mostrarla directamente
    if (props.value.startsWith('data:image')) {
      qrCodeContainer.value.innerHTML = '';
      const img = document.createElement('img');
      img.src = props.value;
      img.alt = 'QR Code';
      img.style.width = `${props.size}px`;
      img.style.height = `${props.size}px`;
      img.style.display = 'block';
      qrCodeContainer.value.appendChild(img);
      loading.value = false;
      emit('generated');
      return;
    }

    // Intentar importar y usar la librería QRCode
    try {
      // Importar dinámicamente la librería qrcode
      const QRCode = (await import('qrcode')).default;
      
      // Limpiar el contenedor
      qrCodeContainer.value.innerHTML = '';
      
      // Crear un canvas para el QR
      const canvas = document.createElement('canvas');
      qrCodeContainer.value.appendChild(canvas);
      
      // Generar el QR code
      await QRCode.toCanvas(canvas, props.value, {
        width: props.size,
        margin: props.margin,
        errorCorrectionLevel: props.errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      loading.value = false;
      emit('generated');
    } catch (importError) {
      // Si falla la importación, usar API externa como fallback
      console.warn('No se pudo cargar la librería qrcode, usando API externa:', importError);
      generateQRWithAPI();
    }
  } catch (err) {
    loading.value = false;
    error.value = true;
    const errorObj = err instanceof Error ? err : new Error(String(err));
    emit('error', errorObj);
    console.error('Error generating QR code:', err);
  }
}

function generateQRWithAPI() {
  if (!qrCodeContainer.value) return;

  // Usar API pública de QR code generation como fallback
  // En producción, se recomienda usar la librería qrcode localmente
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${props.size}x${props.size}&data=${encodeURIComponent(props.value)}&margin=${props.margin}`;

  const img = document.createElement('img');
  img.src = qrApiUrl;
  img.alt = 'QR Code';
  img.style.width = `${props.size}px`;
  img.style.height = `${props.size}px`;

  img.onload = () => {
    if (qrCodeContainer.value) {
      qrCodeContainer.value.innerHTML = '';
      qrCodeContainer.value.appendChild(img);
    }
  };

  img.onerror = () => {
    throw new Error('No se pudo generar el código QR. Por favor, instale la librería qrcode.');
  };
}

function downloadQR() {
  if (!qrCodeContainer.value) return;

  const canvas = qrCodeContainer.value.querySelector('canvas') || qrCodeContainer.value.querySelector('img');
  if (!canvas) return;

  emit('download');

  const link = document.createElement('a');
  if (canvas instanceof HTMLCanvasElement) {
    link.href = canvas.toDataURL('image/png');
  } else if (canvas instanceof HTMLImageElement) {
    link.href = canvas.src;
  } else {
    return;
  }
  link.download = `qrcode-${Date.now()}.png`;
  link.click();
}

async function copyQR() {
  if (!qrCodeContainer.value) return;

  const canvas = qrCodeContainer.value.querySelector('canvas') || qrCodeContainer.value.querySelector('img');
  if (!canvas) return;

  try {
    if (canvas instanceof HTMLCanvasElement) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': new Promise((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
            }, 'image/png');
          }),
        }),
      ]);
    } else if (canvas instanceof HTMLImageElement) {
      // Para imágenes, convertir a blob primero
      const response = await fetch(canvas.src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
    }

    emit('copy');
    $q.notify({
      type: 'positive',
      message: 'Código QR copiado al portapapeles',
      position: 'top',
    });
  } catch (err) {
    console.error('Error copying QR code:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al copiar el código QR',
      position: 'top',
    });
  }
}

function printQR() {
  if (!qrCodeContainer.value) return;

  emit('print');

  const canvas = qrCodeContainer.value.querySelector('canvas') || qrCodeContainer.value.querySelector('img');
  if (!canvas) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const imgSrc = canvas instanceof HTMLCanvasElement
    ? canvas.toDataURL('image/png')
    : canvas instanceof HTMLImageElement
      ? canvas.src
      : '';

  const scriptTag = '</' + 'script>';
  const htmlContent = [
    '<html>',
    '<head>',
    '<title>Imprimir Código QR</title>',
    '<style>',
    'body {',
    '  display: flex;',
    '  justify-content: center;',
    '  align-items: center;',
    '  height: 100vh;',
    '  margin: 0;',
    '}',
    'img {',
    '  max-width: 100%;',
    '  max-height: 100%;',
    '}',
    '</style>',
    '</head>',
    '<body>',
    '<img src="' + imgSrc + '" alt="QR Code" />',
    '<script>',
    'window.onload = function() {',
    '  window.print();',
    '};',
    scriptTag,
    '</body>',
    '</html>',
  ].join('\n');

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
</script>

<style scoped lang="scss">
.qrcode-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
    text-align: center;
  }

  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;

    &.with-border {
      border: 2px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }

    &.with-background {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .qrcode-image {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 8px;
    border-radius: 4px;

    canvas,
    img {
      max-width: 100%;
      max-height: 100%;
      display: block;
    }
  }

  .qrcode-info {
    text-align: center;
    max-width: 300px;
  }

  .qrcode-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.body--dark {
  .qrcode-display {
    .qrcode-container {
      &.with-border {
        border-color: rgba(255, 255, 255, 0.12);
      }

      &.with-background {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }

    .qrcode-image {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>

