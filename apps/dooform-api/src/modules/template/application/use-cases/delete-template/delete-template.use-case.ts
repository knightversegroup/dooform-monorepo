import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class DeleteTemplateUseCase implements UseCase<GetTemplateByIdDto, { success: boolean }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ success: boolean }>> {
    const exists = await this.templateRepository.exists(dto.id)
    if (!exists) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    await this.templateRepository.deleteById(dto.id)
    return { success: true } as any
  }
}
