import { api } from '../../../boot/axios';

export interface UploadFileResponse {
  url: string;
  originalName: string;
}

export const materialsService = {
  /**
   * Sube un archivo (PDF o imagen) al servidor
   * @param file Archivo a subir
   * @param onUploadProgress Callback para el progreso de upload
   * @returns URL del archivo subido
   */
  async uploadFile(
    file: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>(
      '/materiales/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onUploadProgress(percentCompleted);
          }
        },
      },
    );

    return response.data;
  },
};
