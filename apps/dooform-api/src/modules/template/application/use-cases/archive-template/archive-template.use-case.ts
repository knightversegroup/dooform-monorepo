import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { assertCanEditTemplateByPrincipal } from '../../policies/template-access.policy'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'
import { PermissionService } from '../../../../auth/application/services/permission.service'

@Injectable()
@UseClassLogger('template')
export class ArchiveTemplateUseCase implements UseCase<GetTemplateByIdDto, { id: string; status: string }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly permissions: PermissionService,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ id: string; status: string }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    assertCanEditTemplateByPrincipal(template, dto, this.permissions)

    template.archive()
    const saved = await this.templateRepository.save(template)

    return { id: saved.id, status: saved.status } as any
  }
}
