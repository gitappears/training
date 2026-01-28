import { api } from '../../../boot/axios';

// Tipo local para evitar dependencia de módulo no existente
export type CertificateFormatType = 'alimentos' | 'sustancias' | 'otros';

export interface CertificateFormat {
  id?: number;
  tipo: CertificateFormatType;
  configAlimentos?: any;
  configSustancias?: any;
  configOtros?: any;
  fondoAlimentosPath?: string | null;
  fondoSustanciasPath?: string | null;
  fondoGeneralPath?: string | null;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateCertificateFormatDto {
  tipo: CertificateFormatType;
  configAlimentos?: any;
  configSustancias?: any;
  configOtros?: any;
}

export interface UpdateCertificateFormatDto extends Partial<CreateCertificateFormatDto> {
  activo?: boolean;
}

export interface PdfConfig {
  alimentos?: any;
  sustancias?: any;
  otros?: any;
}

class CertificateFormatsService {
  private readonly baseUrl = '/certificate-formats';

  /**
   * Obtener todos los formatos
   */
  async findAll(): Promise<CertificateFormat[]> {
    const response = await api.get<CertificateFormat[]>(this.baseUrl);
    return response.data;
  }

  /**
   * Obtener un formato por ID
   */
  async findOne(id: number): Promise<CertificateFormat> {
    const response = await api.get<CertificateFormat>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Obtener el formato activo
   */
  async findActive(): Promise<CertificateFormat | null> {
    const response = await api.get<CertificateFormat | null>(
      `${this.baseUrl}/active`,
    );
    return response.data;
  }

  /**
   * Obtener la configuración activa como PdfConfig
   */
  async getActiveConfig(): Promise<PdfConfig | null> {
    const response = await api.get<PdfConfig | null>(
      `${this.baseUrl}/config`,
    );
    return response.data;
  }

  /**
   * Obtener la configuración activa pública (sin autenticación)
   */
  async getPublicConfig(): Promise<PdfConfig | null> {
    try {
      const response = await api.get<PdfConfig | null>(
        `${this.baseUrl}/config/public`,
      );
      return response.data;
    } catch (error) {
      console.warn('[CertificateFormatsService] Error obteniendo config pública:', error);
      return null;
    }
  }

  /**
   * Obtener configuración por tipo
   */
  async getConfigByType(tipo: CertificateFormatType): Promise<any> {
    const response = await api.get<any>(`${this.baseUrl}/config/${tipo}`);
    return response.data;
  }

  /**
   * Crear un nuevo formato
   */
  async create(data: CreateCertificateFormatDto): Promise<CertificateFormat> {
    const response = await api.post<CertificateFormat>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Actualizar un formato
   */
  async update(
    id: number,
    data: UpdateCertificateFormatDto,
  ): Promise<CertificateFormat> {
    const response = await api.patch<CertificateFormat>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return response.data;
  }

  /**
   * Eliminar un formato
   */
  async remove(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Subir o actualizar archivo PNG de fondo
   */
  async uploadBackground(
    tipo: CertificateFormatType,
    file: File,
  ): Promise<CertificateFormat> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    const response = await api.post<CertificateFormat>(
      `${this.baseUrl}/upload-background?tipo=${tipo}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }
}

export const certificateFormatsService = new CertificateFormatsService();
