import type { IPeopleRepository } from './people.repository.port';
import { CreateExternalDriverUseCase } from './use-cases/create-external-driver.use-case';
import { BulkUploadDriversUseCase } from './use-cases/bulk-upload-drivers.use-case';

export class PeopleUseCasesFactory {
  static getCreateExternalDriverUseCase(
    peopleRepository: IPeopleRepository,
  ): CreateExternalDriverUseCase {
    return new CreateExternalDriverUseCase(peopleRepository);
  }

  static getBulkUploadDriversUseCase(
    peopleRepository: IPeopleRepository,
  ): BulkUploadDriversUseCase {
    return new BulkUploadDriversUseCase(peopleRepository);
  }
}

