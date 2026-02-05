/**
 * Puerto del repositorio de personas/conductores externos
 * Define la interfaz que debe implementar el adaptador de infraestructura
 */

export interface CreateExternalDriverDto {
  numeroDocumento: string;
  tipoDocumento: string; // CC, TI, CE, PA, RC, NIT
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string; // ISO date string
  genero?: string; // M, F, O
  direccion?: string;
}

export interface Persona {
  id: number;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  genero?: string;
  direccion?: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Alumno {
  id: number;
  codigoEstudiante: string;
  esExterno: boolean;
  fechaIngreso: Date;
  activo: boolean;
  fechaCreacion: Date;
}

export interface ExternalDriver {
  persona: Persona;
  alumno: Alumno;
}

export interface BulkUploadResult {
  totalFilas: number;
  registradosExitosos: number;
  filasConErrores: number;
  errores: Array<{
    fila: number;
    error: string;
    datos: Record<string, unknown>;
  }>;
}

export interface IPeopleRepository {
  /**
   * Crea un conductor externo manualmente
   */
  createExternalDriver(dto: CreateExternalDriverDto): Promise<ExternalDriver>;

  /**
   * Carga masiva de conductores mediante archivo CSV
   * @param file Archivo CSV con los datos de los conductores
   */
  bulkUploadDrivers(file: File): Promise<BulkUploadResult>;
}
