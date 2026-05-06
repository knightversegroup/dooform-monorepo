import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IAnnouncementRepository } from '../../../domain/repositories/announcement.repository'
import { DeleteAnnouncementDto } from '../../dtos/delete-announcement.dto'

@Injectable()
@UseClassLogger('announcement')
export class DeleteAnnouncementUseCase
  implements UseCase<DeleteAnnouncementDto, { success: boolean }>
{
  constructor(
    @Inject('IAnnouncementRepository')
    private readonly repository: IAnnouncementRepository,
  ) {}

  @UseResult()
  @ValidateInput(DeleteAnnouncementDto)
  async execute(dto: DeleteAnnouncementDto): Promise<Result<{ success: boolean }>> {
    const entity = await this.repository.findById(dto.id)
    if (!entity) {
      throw new EntityNotFoundException(`Announcement with id ${dto.id} not found`)
    }
    await this.repository.deleteById(dto.id)
    return { success: true } as any
  }
}
