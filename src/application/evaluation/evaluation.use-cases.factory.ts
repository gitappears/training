// Factory para crear instancias de casos de uso de evaluaciones

import type { IEvaluationRepository } from './evaluation.repository.port';
import {
  ListEvaluationsUseCase,
  GetEvaluationUseCase,
  SubmitEvaluationUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class EvaluationUseCasesFactory {
  static getListEvaluationsUseCase(repository: IEvaluationRepository): ListEvaluationsUseCase {
    return new ListEvaluationsUseCase(repository);
  }

  static getGetEvaluationUseCase(repository: IEvaluationRepository): GetEvaluationUseCase {
    return new GetEvaluationUseCase(repository);
  }

  static getSubmitEvaluationUseCase(repository: IEvaluationRepository): SubmitEvaluationUseCase {
    return new SubmitEvaluationUseCase(repository);
  }
}

