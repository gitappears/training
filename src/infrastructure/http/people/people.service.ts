// Implementación HTTP del repositorio de personas/conductores externos
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IPeopleRepository,
  CreateExternalDriverDto,
  ExternalDriver,
  BulkUploadResult,
} from '../../../application/people/people.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendPersona {
  id: number;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  activo: boolean;
  fechaCreacion: string;
}

interface BackendAlumno {
  id: number;
  codigoEstudiante: string;
  esExterno: boolean;
  fechaIngreso: string;
  activo: boolean;
  fechaCreacion: string;
}

interface BackendConductorExterno {
  persona: BackendPersona;
  alumno: BackendAlumno;
}

interface BackendCargaMasiva {
  totalFilas: number;
  registradosExitosos: number;
  filasConErrores: number;
  errores: Array<{
    fila: number;
    error: string;
    datos: Record<string, unknown>;
  }>;
}

/**
 * Servicio HTTP para personas/conductores externos
 * Implementa el puerto IPeopleRepository usando axios
 */
export class PeopleService implements IPeopleRepository {
  private readonly baseUrl = '/people';

  async createExternalDriver(dto: CreateExternalDriverDto): Promise<ExternalDriver> {
    try {
      const response = await api.post<BackendConductorExterno>(
        `${this.baseUrl}/external-drivers`,
        dto,
      );

      const persona = response.data.persona;
      return {
        persona: {
          id: persona.id,
          numeroDocumento: persona.numeroDocumento,
          tipoDocumento: persona.tipoDocumento,
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          activo: persona.activo,
          fechaCreacion: new Date(persona.fechaCreacion),
          ...(persona.email !== undefined && { email: persona.email }),
          ...(persona.telefono !== undefined && { telefono: persona.telefono }),
          ...(persona.fechaNacimiento !== undefined && {
            fechaNacimiento: new Date(persona.fechaNacimiento),
          }),
          ...(persona.genero !== undefined && { genero: persona.genero }),
          ...(persona.direccion !== undefined && { direccion: persona.direccion }),
        },
        alumno: {
          id: response.data.alumno.id,
          codigoEstudiante: response.data.alumno.codigoEstudiante,
          esExterno: response.data.alumno.esExterno,
          fechaIngreso: new Date(response.data.alumno.fechaIngreso),
          activo: response.data.alumno.activo,
          fechaCreacion: new Date(response.data.alumno.fechaCreacion),
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message ?? 'Error al crear el conductor externo');
    }
  }

  async bulkUploadDrivers(file: File): Promise<BulkUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<BackendCargaMasiva>(
        `${this.baseUrl}/external-drivers/bulk-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return {
        totalFilas: response.data.totalFilas,
        registradosExitosos: response.data.registradosExitosos,
        filasConErrores: response.data.filasConErrores,
        errores: response.data.errores,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al procesar la carga masiva de conductores',
      );
    }
  }
}

// Exportar instancia singleton
export const peopleService = new PeopleService();
