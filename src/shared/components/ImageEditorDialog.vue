<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    :maximized="$q.screen.lt.md"
    :style="{ '--cropper-size': 'min(80vw, 500px)' }"
  >
    <q-card class="image-editor-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Editar Foto de Perfil</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="cropper-container">
          <Cropper
            ref="cropperRef"
            :src="imageSrc"
            :stencil-props="{
              aspectRatio: 1,
              minAspectRatio: 1,
              maxAspectRatio: 1,
              resizable: true,
              movable: false,
            }"
            :default-size="{
              width: 200,
              height: 200,
            }"
            :default-position="{
              left: 0,
              top: 0,
            }"
            :size-restrictions="{
              minWidth: 150,
              minHeight: 150,
              maxWidth: 250,
              maxHeight: 250,
            }"
            class="cropper"
            @change="onChange"
          />
        </div>
        <div class="text-caption text-center q-mt-md text-grey-6">
          Ajusta el área de recorte (150px - 250px). La imagen final será de 250x250px.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="$emit('update:modelValue', false)" />
        <q-btn flat label="Recortar" color="primary" @click="handleCrop" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

interface Props {
  modelValue: boolean;
  imageSrc: string;
  onCrop: (file: File) => void;
  getOriginalFile: () => File | null;
  createCroppedFile: (canvas: HTMLCanvasElement) => Promise<File | null>;
  targetSize: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);

function onChange() {
  // El cropper maneja los cambios automáticamente
}

async function handleCrop() {
  if (!cropperRef.value) {
    $q.notify({
      type: 'negative',
      message: 'Error al procesar la imagen',
    });
    return;
  }

  try {
    // Obtener el canvas del cropper
    const canvas = cropperRef.value.getResult();

    if (!canvas || !canvas.canvas) {
      $q.notify({
        type: 'negative',
        message: 'Error al procesar la imagen',
      });
      return;
    }

    // Redimensionar el canvas al tamaño objetivo (250x250)
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = props.targetSize;
    resizedCanvas.height = props.targetSize;
    const ctx = resizedCanvas.getContext('2d');

    if (!ctx) {
      $q.notify({
        type: 'negative',
        message: 'Error al procesar la imagen',
      });
      return;
    }

    ctx.drawImage(canvas.canvas, 0, 0, props.targetSize, props.targetSize);

    const croppedFile = await props.createCroppedFile(resizedCanvas);

    if (croppedFile) {
      props.onCrop(croppedFile);
      $q.notify({
        type: 'positive',
        message: 'Imagen recortada exitosamente',
      });
      emit('update:modelValue', false);
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al procesar la imagen',
      });
    }
  } catch (error) {
    console.error('Error al recortar imagen:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al recortar la imagen',
    });
  }
}
</script>

<style scoped lang="scss">
.image-editor-card {
  width: 100%;
  max-width: 600px;
}

.cropper-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.cropper {
  width: 100%;
  height: 100%;
}
</style>
