import { ref } from 'vue';
import { useQuasar } from 'quasar';

export interface FileUploadOptions {
  accept?: string;
  maxSize?: number; // en bytes
  multiple?: boolean;
}

/**
 * Composable para manejar la subida de archivos
 * Proporciona validación y manejo de archivos
 */
export function useFileUpload(options: FileUploadOptions = {}) {
  const $q = useQuasar();
  const file = ref<File | null>(null);
  const files = ref<File[]>([]);
  const uploading = ref(false);
  const uploadProgress = ref(0);

  const {
    accept = '*',
    maxSize = 10 * 1024 * 1024, // 10MB por defecto
  } = options;

  /**
   * Valida un archivo antes de asignarlo
   */
  function validateFile(fileToValidate: File): { valid: boolean; error?: string } {
    // Validar tipo de archivo
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileType = fileToValidate.type.toLowerCase();
      const fileExtension = '.' + fileToValidate.name.split('.').pop()?.toLowerCase();

      const isAccepted = acceptedTypes.some((type) => {
        const normalizedType = type.toLowerCase();
        // Verificar por tipo MIME o extensión
        return (
          fileType.includes(normalizedType) ||
          normalizedType.includes(fileExtension) ||
          fileExtension === normalizedType
        );
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `Tipo de archivo no permitido. Tipos aceptados: ${accept}`,
        };
      }
    }

    // Validar tamaño
    if (fileToValidate.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Maneja la selección de un archivo
   */
  function handleFileSelect(selectedFile: File | File[] | null) {
    if (!selectedFile) {
      file.value = null;
      files.value = [];
      return;
    }

    if (Array.isArray(selectedFile)) {
      // Múltiples archivos
      const validFiles: File[] = [];
      for (const f of selectedFile) {
        const validation = validateFile(f);
        if (validation.valid) {
          validFiles.push(f);
        } else {
          $q.notify({
            type: 'negative',
            message: validation.error || 'Archivo inválido',
          });
        }
      }
      files.value = validFiles;
      file.value = validFiles[0] || null;
    } else {
      // Un solo archivo
      const validation = validateFile(selectedFile);
      if (validation.valid) {
        file.value = selectedFile;
        files.value = [selectedFile];
      } else {
        $q.notify({
          type: 'negative',
          message: validation.error || 'Archivo inválido',
        });
        file.value = null;
        files.value = [];
      }
    }
  }

  /**
   * Limpia los archivos seleccionados
   */
  function clearFiles() {
    file.value = null;
    files.value = [];
    uploadProgress.value = 0;
  }

  /**
   * Obtiene el tamaño formateado de un archivo
   */
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene la extensión de un archivo
   */
  function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Simula la subida de un archivo (para testing o cuando no hay endpoint)
   */
  async function simulateUpload(duration: number = 1000): Promise<string> {
    uploading.value = true;
    uploadProgress.value = 0;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        uploadProgress.value += 10;
        if (uploadProgress.value >= 100) {
          clearInterval(interval);
          uploading.value = false;
          resolve(`/uploads/${file.value?.name || 'file'}`);
        }
      }, duration / 10);
    });
  }

  return {
    file,
    files,
    uploading,
    uploadProgress,
    handleFileSelect,
    clearFiles,
    validateFile,
    formatFileSize,
    getFileExtension,
    simulateUpload,
  };
}
