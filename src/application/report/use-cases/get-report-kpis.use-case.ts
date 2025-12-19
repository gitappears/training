// Caso de uso: Obtener KPIs de reportes (RF-41)
// Capa de Aplicación (arquitectura hexagonal)

import type { IReportRepository, ReportFilters, ReportKPIs } from '../report.repository.port';

/**
 * Caso de uso para obtener KPIs principales del dashboard
 * RF-41: Dashboard institucional con indicadores clave
 */
export class GetReportKPIsUseCase {
  constructor(private readonly repository: IReportRepository) {}

  async execute(filters?: ReportFilters): Promise<ReportKPIs> {
    return this.repository.getKPIs(filters);
  }
}

