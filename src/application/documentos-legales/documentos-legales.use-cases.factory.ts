// Factory para crear instancias de casos de uso de documentos legales

import type { IDocumentosLegalesRepository } from './documentos-legales.repository.port';
import {
  CreateDocumentoLegalUseCase,
  UpdateDocumentoLegalUseCase,
  RemoveDocumentoLegalUseCase,
  ListDocumentosLegalesUseCase,
  GetDocumentoLegalUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class DocumentosLegalesUseCasesFactory {
  static getCreateDocumentoLegalUseCase(
    repository: IDocumentosLegalesRepository,
  ): CreateDocumentoLegalUseCase {
    return new CreateDocumentoLegalUseCase(repository);
  }

  static getUpdateDocumentoLegalUseCase(
    repository: IDocumentosLegalesRepository,
  ): UpdateDocumentoLegalUseCase {
    return new UpdateDocumentoLegalUseCase(repository);
  }

  static getRemoveDocumentoLegalUseCase(
    repository: IDocumentosLegalesRepository,
  ): RemoveDocumentoLegalUseCase {
    return new RemoveDocumentoLegalUseCase(repository);
  }

  static getListDocumentosLegalesUseCase(
    repository: IDocumentosLegalesRepository,
  ): ListDocumentosLegalesUseCase {
    return new ListDocumentosLegalesUseCase(repository);
  }

  static getGetDocumentoLegalUseCase(
    repository: IDocumentosLegalesRepository,
  ): GetDocumentoLegalUseCase {
    return new GetDocumentoLegalUseCase(repository);
  }
}
