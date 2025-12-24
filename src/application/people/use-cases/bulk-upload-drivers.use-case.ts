import type { IPeopleRepository, BulkUploadResult } from '../people.repository.port';

export class BulkUploadDriversUseCase {
  constructor(private readonly peopleRepository: IPeopleRepository) {}

  async execute(file: File): Promise<BulkUploadResult> {
    return await this.peopleRepository.bulkUploadDrivers(file);
  }
}

