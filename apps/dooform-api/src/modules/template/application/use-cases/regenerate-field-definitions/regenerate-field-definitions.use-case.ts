import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { FieldDefinition } from '../../../domain/entities/field-definition.interface'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { IPlaceholderExtractorService } from '../../../domain/services/placeholder-extractor.service'
import type { IFieldDefinitionGeneratorService } from '../../../domain/services/field-definition-generator.service'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class RegenerateFieldDefinitionsUseCase implements UseCase<GetTemplateByIdDto, { placeholders: string[]; fieldDefinitions: FieldDefinition[] }> {
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
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ placeholders: string[]; fieldDefinitions: FieldDefinition[] }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    if (!template.filePath) {
      throw new InvalidOperationException('No DOCX file stored for this template')
    }

    // Re-read the DOCX from storage
    const docxBuffer = await this.storageService.read(template.filePath)

    // Re-extract placeholders
    const placeholders = await this.placeholderExtractor.extractPlaceholders(docxBuffer)
    template.setPlaceholders(placeholders)

    // Re-generate field definitions
    const fieldDefs = this.fieldDefinitionGenerator.generateFromPlaceholders(placeholders)
    template.setFieldDefinitions(fieldDefs)

    await this.templateRepository.save(template)

    return { placeholders, fieldDefinitions: fieldDefs } as any
  }
}
