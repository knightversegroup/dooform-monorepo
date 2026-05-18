import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import { TemplateVisibility } from '../../../domain/enums/template.enum'
import { OrgPath } from '../../../../../common/storage/org-path'
import { StorageQuotaService } from '../../../../user/application/services/storage-quota.service'
import { assertCanEditTemplateByPrincipal } from '../../policies/template-access.policy'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'
import { PermissionService } from '../../../../auth/application/services/permission.service'

@Injectable()
@UseClassLogger('template')
export class ReplaceTemplateHtmlUseCase implements UseCase<GetTemplateByIdDto, any> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    private readonly quota: StorageQuotaService,
    private readonly permissions: PermissionService,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(
    dto: GetTemplateByIdDto,
    htmlFile: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<any>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    assertCanEditTemplateByPrincipal(template, dto, this.permissions)

    // Reuse the existing HTML path if one was set at create time; otherwise
    // compute it the same way CreateTemplateUseCase does so we land in the
    // canonical org/global namespace.
    const orgId =
      template.visibility === TemplateVisibility.GLOBAL ? null : template.organizationId
    const htmlPath =
      template.filePathHTML ??
      (orgId
        ? OrgPath.for(orgId, 'templates', template.id, 'preview.html')
        : `global/templates/${template.id}/preview.html`)

    if (orgId) {
      await this.quota.assertCanWrite(orgId, htmlFile.size)
    }
    await this.storageService.save(htmlPath, htmlFile.buffer)
    if (orgId) {
      await this.quota.recordWrite(orgId, htmlFile.size)
    }

    if (template.filePathHTML !== htmlPath) {
      template.setFilePathHTML(htmlPath)
    }

    const saved = await this.templateRepository.save(template)
    const props = saved.getProps()

    new Logger('ReplaceTemplateHtmlUseCase').debug(
      `Replaced HTML preview for template ${saved.id} (${htmlFile.size} bytes)`,
    )

    return {
      id: saved.id,
      filePathHTML: props.filePathHTML,
      updatedAt: props.updatedAt!,
    } as any
  }
}
