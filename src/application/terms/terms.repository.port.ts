/**
 * Puerto del repositorio de términos y aceptaciones
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
}

export interface Aceptacion {
  id: number;
  documentoLegalId: number;
  version: string;
  fechaAceptacion: Date;
}

export interface ITermsRepository {
  /**
   * Obtiene todos los documentos legales activos que el usuario debe aceptar
   */
  getActiveDocuments(): Promise<DocumentoLegal[]>;

  /**
   * Acepta los términos y condiciones especificados
   * @param documentosIds Array de IDs de documentos legales a aceptar
   */
  acceptTerms(documentosIds: number[]): Promise<Aceptacion[]>;

  /**
   * Verifica si el usuario ha aceptado todos los términos activos
   */
  verifyAcceptance(): Promise<{ aceptado: boolean; message: string }>;
}

