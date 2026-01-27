/**
 * Puerto del repositorio de documentos legales
 * Define la interfaz que debe implementar el adaptador de infraestructura
 */

export interface DocumentoLegal {
  id: number;
  tipo: string;
  titulo: string;
  contenido: string;
  version: string;
  requiereFirmaDigital: boolean;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CreateDocumentoLegalDto {
  tipo: string;
  titulo: string;
  contenido: string;
  version?: string;
  requiereFirmaDigital?: boolean;
  activo?: boolean;
}

export interface UpdateDocumentoLegalDto {
  tipo?: string;
  titulo?: string;
  contenido?: string;
  version?: string;
  requiereFirmaDigital?: boolean;
  activo?: boolean;
}

export interface IDocumentosLegalesRepository {
  /**
   * Obtiene todos los documentos legales
   */
  findAll(activo?: boolean): Promise<DocumentoLegal[]>;

  /**
   * Obtiene un documento legal por ID
   */
  findOne(id: number): Promise<DocumentoLegal | null>;

  /**
   * Obtiene documentos legales por tipo
   */
  findByTipo(tipo: string, activo?: boolean): Promise<DocumentoLegal[]>;

  /**
   * Crea un nuevo documento legal
   */
  create(dto: CreateDocumentoLegalDto): Promise<DocumentoLegal>;

  /**
   * Actualiza un documento legal existente
   */
  update(id: number, dto: UpdateDocumentoLegalDto): Promise<DocumentoLegal>;

  /**
   * Elimina un documento legal
   */
  remove(id: number): Promise<void>;
}
