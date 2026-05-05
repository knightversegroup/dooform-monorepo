import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { IDataTypeRepository } from '../../../domain/repositories/data-type.repository'

export interface DeleteDataTypeDto {
  id: string
}

@Injectable()
@UseClassLogger('field-types')
export class DeleteDataTypeUseCase
  implements UseCase<DeleteDataTypeDto, { ok: true }>
{
  constructor(
    @Inject('IDataTypeRepository')
    private readonly repo: IDataTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: DeleteDataTypeDto): Promise<Result<{ ok: true }>> {
    const entity = await this.repo.findById(dto.id)
    if (!entity) throw new NotFoundException('Data type not found')
    if (entity.isBuiltIn) {
      throw new BadRequestException('Built-in data types cannot be deleted')
    }
    await this.repo.deleteById(entity.id)
    return { ok: true } as any
  }
}
