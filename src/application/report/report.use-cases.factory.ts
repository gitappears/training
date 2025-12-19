// Factory para crear instancias de casos de uso de reportes

import type { IReportRepository } from './report.repository.port';
import { GetReportKPIsUseCase, GetCourseReportsUseCase } from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class ReportUseCasesFactory {
  static getGetReportKPIsUseCase(repository: IReportRepository): GetReportKPIsUseCase {
    return new GetReportKPIsUseCase(repository);
  }

  static getGetCourseReportsUseCase(repository: IReportRepository): GetCourseReportsUseCase {
    return new GetCourseReportsUseCase(repository);
  }
}

