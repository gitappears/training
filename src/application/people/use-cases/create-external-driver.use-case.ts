import type { IPeopleRepository, ExternalDriver, CreateExternalDriverDto } from '../people.repository.port';

export class CreateExternalDriverUseCase {
  constructor(private readonly peopleRepository: IPeopleRepository) {}

  async execute(dto: CreateExternalDriverDto): Promise<ExternalDriver> {
    return await this.peopleRepository.createExternalDriver(dto);
  }
}

