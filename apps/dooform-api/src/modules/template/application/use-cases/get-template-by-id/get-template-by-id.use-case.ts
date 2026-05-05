import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { UserModel } from '../../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import { assertCanReadTemplate } from '../../policies/template-access.policy'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

interface GetTemplateByIdResult {
  id: string
  name: string
  description?: string | null
  status: string
  type: string
  tier: string
  filePath?: string | null
  originalFilename?: string | null
  createdAt: Date
  updatedAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetTemplateByIdUseCase implements UseCase<GetTemplateByIdDto, GetTemplateByIdResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @InjectRepository(UserModel)
    private readonly users: Repository<UserModel>,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<GetTemplateByIdResult>> {
    const template = await this.templateRepository.findById(dto.id)

    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    assertCanReadTemplate(template, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    const props = template.getProps()

    // Owner snapshot — surface email/name for the detail page metadata strip. Resolved
    // through a single direct query to keep the use case repo-agnostic for now.
    const ownerUserId = props.ownerUserId ?? null
    let owner: { id: string; email: string; name: string } | null = null
    if (ownerUserId) {
      const user = await this.users.findOne({ where: { id: ownerUserId } })
      if (user) owner = { id: user.id, email: user.email, name: user.displayName }
    }

    return {
      id: template.id,
      name: props.name,
      displayName: props.displayName,
      description: props.description,
      author: props.author,
      status: props.status,
      type: props.type,
      tier: props.tier,
      visibility: props.visibility,
      category: props.category,
      pageOrientation: props.pageOrientation,
      remarks: props.remarks,
      organizationId: props.organizationId,
      ownerUserId,
      owner,
      filePath: props.filePath,
      originalFilename: props.originalFilename,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
