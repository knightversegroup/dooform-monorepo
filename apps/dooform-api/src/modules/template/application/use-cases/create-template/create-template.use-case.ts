import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Template } from '../../../domain/entities/template.entity'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { generateFieldDefinitions } from '../../services/field-type-detector'
import { toTemplateResponse, type TemplateResponse } from '../../mappers/template.mapper'
import { CreateTemplateDto } from '../../dtos/create-template.dto'
import { StorageService } from '../../../../document/application/services/storage.service'

interface UploadTemplateResult {
  message: string
  template: TemplateResponse
}

@Injectable()
@UseClassLogger('template')
export class CreateTemplateUseCase implements UseCase<CreateTemplateDto, UploadTemplateResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly docxProcessor: DocxProcessorService,
    private readonly storageService: StorageService,
  ) {}

  @UseResult()
  @ValidateInput(CreateTemplateDto)
  async execute(dto: CreateTemplateDto): Promise<Result<UploadTemplateResult>> {
    const template = Template.create({
      filename: dto.displayName,
      displayName: dto.displayName,
      description: dto.description,
      author: dto.author,
    })

    const saved = await this.templateRepository.save(template)

    return {
      message: 'Template created successfully',
      template: toTemplateResponse(saved),
    } as any
  }

  /**
   * Upload a template with a DOCX file buffer.
   * Called directly from the controller for multipart uploads.
   */
  async executeWithFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    dto: CreateTemplateDto,
  ): Promise<UploadTemplateResult> {
    // Extract placeholders from DOCX
    const placeholders = await this.docxProcessor.extractPlaceholders(file.buffer)
    const fieldDefinitions = generateFieldDefinitions(placeholders)

    const template = Template.create({
      filename: file.originalname,
      originalName: file.originalname,
      displayName: dto.displayName || file.originalname,
      description: dto.description,
      author: dto.author,
    })

    // Upload file to storage
    const objectName = `templates/${template.id}/${file.originalname}`
    await this.storageService.uploadFile(file.buffer, objectName, file.mimetype)

    // Set file metadata and storage path
    const props = template.getProps()
    ;(template as any)._props = {
      ...props,
      filePathDocx: objectName,
      fileSize: file.size,
      mimeType: file.mimetype,
      placeholders: JSON.stringify(placeholders),
      fieldDefinitions: JSON.stringify(fieldDefinitions),
    }

    const saved = await this.templateRepository.save(template)

    return {
      message: 'Template uploaded successfully',
      template: toTemplateResponse(saved),
    }
  }
}
