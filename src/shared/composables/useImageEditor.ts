import { ref } from 'vue';

const TARGET_SIZE = 250; // Tamaño objetivo: 250x250px

/**
 * Composable simplificado para manejar la edición y recorte de imágenes con vue-advanced-cropper
 */
export function useImageEditor() {
  const showImageEditor = ref(false);
  const editorImageSrc = ref<string>('');
  const originalFile = ref<File | null>(null);

  function openImageEditor(imageSrc: string, file?: File | null) {
    editorImageSrc.value = imageSrc;
    originalFile.value = file || null;
    showImageEditor.value = true;
  }

  function closeImageEditor() {
    showImageEditor.value = false;
    editorImageSrc.value = '';
    originalFile.value = null;
  }

  function getOriginalFile() {
    return originalFile.value;
  }

  async function createCroppedFile(canvas: HTMLCanvasElement): Promise<File | null> {
    if (!originalFile.value) return null;

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const croppedFile = new File([blob], originalFile.value!.name, {
            type: originalFile.value!.type || 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(croppedFile);
        },
        originalFile.value!.type || 'image/jpeg',
        0.95, // Calidad
      );
    });
  }

  return {
    showImageEditor,
    editorImageSrc,
    openImageEditor,
    closeImageEditor,
    getOriginalFile,
    createCroppedFile,
    TARGET_SIZE,
  };
}
