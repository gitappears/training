// Caso de uso: Obtener reporte por cursos (RF-40, RF-41)
// Capa de Aplicación (arquitectura hexagonal)

import type { IReportRepository, ReportFilters, CourseReport } from '../report.repository.port';

/**
 * Caso de uso para obtener reporte de cursos
 * RF-40, RF-41: Reportes con filtros por curso
 */
export class GetCourseReportsUseCase {
  constructor(private readonly repository: IReportRepository) {}

  async execute(filters?: ReportFilters): Promise<CourseReport[]> {
    return this.repository.getCourseReports(filters);
  }
}

