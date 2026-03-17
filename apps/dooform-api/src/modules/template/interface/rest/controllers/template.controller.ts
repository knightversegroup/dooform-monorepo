import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { Public } from '../../../../../common/decorators/public.decorator'
import { Roles } from '../../../../../common/decorators/roles.decorator'
import { CreateTemplateUseCase } from '../../../application/use-cases/create-template/create-template.use-case'
import { GetTemplateByIdUseCase } from '../../../application/use-cases/get-template-by-id/get-template-by-id.use-case'
import { GetAllTemplatesUseCase } from '../../../application/use-cases/get-all-templates/get-all-templates.use-case'
import { UpdateTemplateUseCase } from '../../../application/use-cases/update-template/update-template.use-case'
import { DeleteTemplateUseCase } from '../../../application/use-cases/delete-template/delete-template.use-case'
import {
  GetFieldDefinitionsUseCase,
  UpdateFieldDefinitionsUseCase,
  RegenerateFieldDefinitionsUseCase,
} from '../../../application/use-cases/field-definitions/field-definitions.use-case'
import { GetGroupedTemplatesUseCase } from '../../../application/use-cases/get-grouped-templates/get-grouped-templates.use-case'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { toTemplateResponse } from '../../../application/mappers/template.mapper'
import { DocxProcessorService } from '../../../application/services/docx-processor.service'
import { generateFieldDefinitions } from '../../../application/services/field-type-detector'
import { StorageService } from '../../../../document/application/services/storage.service'
import { LibreOfficeService, ThumbnailQuality } from '../../../../libreoffice'
import type { UpdateTemplateDto } from '../../../application/dtos/update-template.dto'
import type { UpdateFieldDefinitionsDto } from '../../../application/dtos/update-field-definitions.dto'
import type { CreateTemplateDto } from '../../../application/dtos/create-template.dto'

@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class TemplateController {
  private readonly logger = new Logger(TemplateController.name)

  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly getTemplateByIdUseCase: GetTemplateByIdUseCase,
    private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    private readonly getFieldDefinitionsUseCase: GetFieldDefinitionsUseCase,
    private readonly updateFieldDefinitionsUseCase: UpdateFieldDefinitionsUseCase,
    private readonly regenerateFieldDefinitionsUseCase: RegenerateFieldDefinitionsUseCase,
    private readonly getGroupedTemplatesUseCase: GetGroupedTemplatesUseCase,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly storageService: StorageService,
    private readonly libreOfficeService: LibreOfficeService,
    private readonly docxProcessor: DocxProcessorService,
  ) {}

  // POST /api/templates/upload
  @Post('upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('template'))
  async uploadTemplate(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body() body: CreateTemplateDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    return this.createTemplateUseCase.executeWithFile(file, body)
  }

  // POST /api/templates (create without file)
  @Post()
  @Roles('admin')
  async createTemplate(@Body() body: CreateTemplateDto) {
    const result = await this.createTemplateUseCase.execute(body)
    return getResultValue(result)
  }

  // GET /api/templates?grouped=true|false&document_type_id=&type=&tier=&search=&sort=&limit=
  @Get()
  @Public()
  async getTemplates(
    @Query('grouped') grouped?: string,
    @Query('document_type_id') documentTypeId?: string,
    @Query('type') type?: string,
    @Query('tier') tier?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('is_verified') isVerified?: string,
    @Query('include_document_type') includeDocumentType?: string,
    @Query('limit') limit?: string,
  ) {
    if (grouped === 'true') {
      const result = await this.getGroupedTemplatesUseCase.execute({})
      return getResultValue(result)
    }

    const result = await this.getAllTemplatesUseCase.execute({
      documentTypeId,
      type,
      tier,
      category,
      search,
      sort,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      includeDocumentType: includeDocumentType === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    return { templates: getResultValue(result) }
  }

  // GET /api/templates/:id
  @Get(':id')
  @Public()
  async getTemplateById(@Param('id') id: string) {
    const result = await this.getTemplateByIdUseCase.execute({ id })
    return { template: getResultValue(result) }
  }

  // PUT /api/templates/:id
  @Put(':id')
  @Roles('admin')
  async updateTemplate(@Param('id') id: string, @Body() body: UpdateTemplateDto) {
    const result = await this.updateTemplateUseCase.execute({ id, ...body })
    return getResultValue(result)
  }

  // DELETE /api/templates/:id
  @Delete(':id')
  @Roles('admin')
  async deleteTemplate(@Param('id') id: string) {
    const result = await this.deleteTemplateUseCase.execute({ id })
    return getResultValue(result)
  }

  // GET /api/templates/:id/placeholders
  @Get(':id/placeholders')
  @Public()
  async getPlaceholders(@Param('id') id: string) {
    const result = await this.getTemplateByIdUseCase.execute({ id })
    const template = getResultValue(result)
    return { placeholders: (template as any).placeholders ?? [] }
  }

  // GET /api/templates/:id/field-definitions
  @Get(':id/field-definitions')
  @Public()
  async getFieldDefinitions(@Param('id') id: string) {
    const result = await this.getFieldDefinitionsUseCase.execute({ id })
    return { field_definitions: getResultValue(result) ?? {} }
  }

  // PUT /api/templates/:id/field-definitions
  @Put(':id/field-definitions')
  @Roles('admin')
  async updateFieldDefinitions(
    @Param('id') id: string,
    @Body() body: UpdateFieldDefinitionsDto,
  ) {
    const result = await this.updateFieldDefinitionsUseCase.execute({
      id,
      fieldDefinitions: body.fieldDefinitions,
    })
    return getResultValue(result)
  }

  // POST /api/templates/:id/field-definitions/regenerate
  @Post(':id/field-definitions/regenerate')
  @Roles('admin')
  async regenerateFieldDefinitions(@Param('id') id: string) {
    const result = await this.regenerateFieldDefinitionsUseCase.execute({ id })
    return getResultValue(result)
  }

  // GET /api/templates/:id/preview/pdf - Returns PDF blob
  // NOTE: This route must be defined before :id/preview to avoid route conflicts
  @Get(':id/preview/pdf')
  @Public()
  async getPdfPreview(@Param('id') id: string, @Res() res: any) {
    const template = await this.templateRepository.findById(id)
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`)
    }

    const props = template.getProps()

    // If a PDF file is already stored, return it directly
    if (props.filePathPdf) {
      try {
        const pdfBuffer = await this.storageService.readFile(props.filePathPdf)
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${props.filename.replace(/\.docx$/i, '.pdf')}"`,
        })
        res.send(pdfBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to read stored PDF for template ${id}: ${error}`)
      }
    }

    // Try to convert from DOCX using LibreOffice
    if (props.filePathDocx && (await this.libreOfficeService.isPDFConversionAvailable())) {
      try {
        const docxBuffer = await this.storageService.readFile(props.filePathDocx)
        const pdfBuffer = await this.libreOfficeService.convertToPdf(docxBuffer, props.filename)
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${props.filename.replace(/\.docx$/i, '.pdf')}"`,
        })
        res.send(pdfBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to convert DOCX to PDF for template ${id}: ${error}`)
      }
    }

    // No PDF available
    res.status(204).send()
  }

  // GET /api/templates/:id/preview - Returns HTML preview of the template
  @Get(':id/preview')
  @Public()
  async getHtmlPreview(@Param('id') id: string, @Res() res: any) {
    const template = await this.templateRepository.findById(id)
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`)
    }

    const props = template.getProps()

    // If an HTML file is already stored, return it directly
    if (props.filePathHtml) {
      try {
        const htmlBuffer = await this.storageService.readFile(props.filePathHtml)
        res.set({ 'Content-Type': 'text/html; charset=utf-8' })
        res.send(htmlBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to read stored HTML for template ${id}: ${error}`)
      }
    }

    // Try to convert from DOCX using LibreOffice
    if (props.filePathDocx && (await this.libreOfficeService.isHTMLConversionAvailable())) {
      try {
        const docxBuffer = await this.storageService.readFile(props.filePathDocx)
        const htmlBuffer = await this.libreOfficeService.convertToHtml(docxBuffer, props.filename)
        res.set({ 'Content-Type': 'text/html; charset=utf-8' })
        res.send(htmlBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to convert DOCX to HTML for template ${id}: ${error}`)
      }
    }

    // No HTML available
    res.status(204).send()
  }

  // GET /api/templates/:id/thumbnail - Returns thumbnail PNG
  @Get(':id/thumbnail')
  @Public()
  async getThumbnail(
    @Param('id') id: string,
    @Res() res: any,
    @Query('quality') quality?: string,
    @Query('width') width?: string,
  ) {
    const template = await this.templateRepository.findById(id)
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`)
    }

    const props = template.getProps()
    const thumbnailWidth = width ? parseInt(width, 10) : quality === 'hd' ? 800 : 300
    const thumbnailQuality = quality === 'hd' ? ThumbnailQuality.HD : ThumbnailQuality.Normal

    // If a thumbnail file is already stored, return it directly
    if (props.filePathThumbnail) {
      try {
        const thumbnailBuffer = await this.storageService.readFile(props.filePathThumbnail)
        res.set({ 'Content-Type': 'image/png' })
        res.send(thumbnailBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to read stored thumbnail for template ${id}: ${error}`)
      }
    }

    // Try to generate thumbnail: first get a PDF, then generate thumbnail from it
    if (props.filePathDocx && (await this.libreOfficeService.isThumbnailGenerationAvailable())) {
      try {
        let pdfBuffer: Buffer
        // Try to read existing PDF first
        if (props.filePathPdf) {
          try {
            pdfBuffer = await this.storageService.readFile(props.filePathPdf)
          } catch {
            // Fall back to converting DOCX to PDF
            const docxBuffer = await this.storageService.readFile(props.filePathDocx)
            pdfBuffer = await this.libreOfficeService.convertToPdf(docxBuffer, props.filename)
          }
        } else {
          const docxBuffer = await this.storageService.readFile(props.filePathDocx)
          pdfBuffer = await this.libreOfficeService.convertToPdf(docxBuffer, props.filename)
        }

        const pdfFilename = props.filename.replace(/\.docx$/i, '.pdf')
        const thumbnailBuffer = await this.libreOfficeService.generateThumbnail(
          pdfBuffer,
          pdfFilename,
          thumbnailWidth,
          thumbnailQuality,
        )
        res.set({ 'Content-Type': 'image/png' })
        res.send(thumbnailBuffer)
        return
      } catch (error) {
        this.logger.warn(`Failed to generate thumbnail for template ${id}: ${error}`)
      }
    }

    // No thumbnail available
    res.status(204).send()
  }

  // POST /api/templates/:id/files - Replace template files (DOCX, HTML, thumbnail)
  @Post(':id/files')
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'docx', maxCount: 1 },
      { name: 'html', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async replaceTemplateFiles(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      docx?: { buffer: Buffer; originalname: string; mimetype: string; size: number }[]
      html?: { buffer: Buffer; originalname: string; mimetype: string; size: number }[]
      thumbnail?: { buffer: Buffer; originalname: string; mimetype: string; size: number }[]
    },
    @Body() body: { regenerate_fields?: string },
  ) {
    const template = await this.templateRepository.findById(id)
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`)
    }

    let placeholders = template.getParsedPlaceholders()

    // Replace DOCX file
    if (files.docx?.[0]) {
      const docxFile = files.docx[0]
      const objectName = `templates/${id}/${docxFile.originalname}`
      await this.storageService.uploadFile(docxFile.buffer, objectName, docxFile.mimetype)

      template.updateFilePaths({ docx: objectName })

      // Update file metadata
      const currentProps = template.getProps()
      ;(template as any)._props = {
        ...currentProps,
        filename: docxFile.originalname,
        originalName: docxFile.originalname,
        fileSize: docxFile.size,
        mimeType: docxFile.mimetype,
      }

      // Extract placeholders from new DOCX
      placeholders = await this.docxProcessor.extractPlaceholders(docxFile.buffer)
      template.updatePlaceholders(JSON.stringify(placeholders))

      // Regenerate field definitions if requested
      if (body.regenerate_fields === 'true') {
        const fieldDefinitions = generateFieldDefinitions(placeholders)
        template.updateFieldDefinitions(JSON.stringify(fieldDefinitions))
      }
    }

    // Replace HTML file
    if (files.html?.[0]) {
      const htmlFile = files.html[0]
      const objectName = `templates/${id}/${htmlFile.originalname}`
      await this.storageService.uploadFile(htmlFile.buffer, objectName, htmlFile.mimetype)
      template.updateFilePaths({ html: objectName })
    }

    // Replace thumbnail file
    if (files.thumbnail?.[0]) {
      const thumbnailFile = files.thumbnail[0]
      const objectName = `templates/${id}/${thumbnailFile.originalname}`
      await this.storageService.uploadFile(thumbnailFile.buffer, objectName, thumbnailFile.mimetype)
      template.updateFilePaths({ thumbnail: objectName })
    }

    const saved = await this.templateRepository.save(template)
    const response = toTemplateResponse(saved)

    return {
      message: 'Template files replaced successfully',
      template_id: id,
      filename: saved.getProps().filename,
      placeholders,
      template: response,
    }
  }
}
