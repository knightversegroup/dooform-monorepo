import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { IPlaceholderExtractorService } from '../../../domain/services/placeholder-extractor.service'
import type { IFieldDefinitionGeneratorService } from '../../../domain/services/field-definition-generator.service'
import { assertCanEditTemplate } from '../../policies/template-access.policy'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class ReplaceTemplateFilesUseCase implements UseCase<GetTemplateByIdDto, any> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IPlaceholderExtractorService')
    private readonly placeholderExtractor: IPlaceholderExtractorService,
    @Inject('IFieldDefinitionGeneratorService')
    private readonly fieldDefinitionGenerator: IFieldDefinitionGeneratorService,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(
    dto: GetTemplateByIdDto,
    templateFile?: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<any>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    assertCanEditTemplate(template, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    if (templateFile) {
      // Delete old file if exists
      if (template.filePath) {
        try {
          await this.storageService.delete(template.filePath)
        } catch (err) {
          new Logger('ReplaceTemplateFilesUseCase').warn(`Failed to delete old template file: ${template.filePath}`)
        }
      }

      const filePath = `templates/${template.id}/template.docx`
      await this.storageService.save(filePath, templateFile.buffer)
      template.setFilePath(filePath, templateFile.originalname)
      template.setFileSize(templateFile.size)
      template.setMimeType(templateFile.mimetype)

      // Re-extract placeholders and regenerate field definitions
      try {
        const placeholders = await this.placeholderExtractor.extractPlaceholders(templateFile.buffer)
        template.setPlaceholders(placeholders)

        const fieldDefs = this.fieldDefinitionGenerator.generateFromPlaceholders(placeholders)
        template.setFieldDefinitions(fieldDefs)
      } catch (err) {
        new Logger('ReplaceTemplateFilesUseCase').warn('Failed to extract placeholders from replaced DOCX')
      }
    }

    const saved = await this.templateRepository.save(template)
    const props = saved.getProps()

    return {
      id: saved.id,
      filePath: props.filePath,
      originalFilename: props.originalFilename,
      fileSize: props.fileSize,
      updatedAt: props.updatedAt!,
    } as any
  }
}
