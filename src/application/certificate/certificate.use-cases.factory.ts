// Factory para crear instancias de casos de uso de certificados

import type { ICertificateRepository } from './certificate.repository.port';
import {
  ListCertificatesUseCase,
  GetCertificateUseCase,
  VerifyCertificateUseCase,
  CheckExpirationsManuallyUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class CertificateUseCasesFactory {
  static getListCertificatesUseCase(
    repository: ICertificateRepository,
  ): ListCertificatesUseCase {
    return new ListCertificatesUseCase(repository);
  }

  static getGetCertificateUseCase(repository: ICertificateRepository): GetCertificateUseCase {
    return new GetCertificateUseCase(repository);
  }

  static getVerifyCertificateUseCase(
    repository: ICertificateRepository,
  ): VerifyCertificateUseCase {
    return new VerifyCertificateUseCase(repository);
  }

  static getCheckExpirationsManuallyUseCase(
    repository: ICertificateRepository,
  ): CheckExpirationsManuallyUseCase {
    return new CheckExpirationsManuallyUseCase(repository);
  }
}

