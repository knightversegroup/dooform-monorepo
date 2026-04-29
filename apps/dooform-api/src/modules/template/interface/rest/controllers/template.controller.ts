import { Controller, Get, Post, Put, Delete, Param, Body, Query, Res, UseFilters, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import 'multer';

import { getResultValue } from '@dooform-api-core/shared';
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs';

import { TemplateStatus, TemplateType, TemplateTier, TemplateCategory } from '../../../domain/enums/template.enum';
import { CreateTemplateUseCase } from '../../../application/use-cases/create-template/create-template.use-case';
import { GetTemplateByIdUseCase } from '../../../application/use-cases/get-template-by-id/get-template-by-id.use-case';
import { GetAllTemplatesUseCase } from '../../../application/use-cases/get-all-templates/get-all-templates.use-case';
import { UpdateTemplateUseCase } from '../../../application/use-cases/update-template/update-template.use-case';
import { DeleteTemplateUseCase } from '../../../application/use-cases/delete-template/delete-template.use-case';
import { PublishTemplateUseCase } from '../../../application/use-cases/publish-template/publish-template.use-case';
import { ArchiveTemplateUseCase } from '../../../application/use-cases/archive-template/archive-template.use-case';
import { ReplaceTemplateFilesUseCase } from '../../../application/use-cases/replace-template-files/replace-template-files.use-case';
import { GetPlaceholdersUseCase } from '../../../application/use-cases/get-placeholders/get-placeholders.use-case';
import { GetFieldDefinitionsUseCase } from '../../../application/use-cases/get-field-definitions/get-field-definitions.use-case';
import { UpdateFieldDefinitionsUseCase } from '../../../application/use-cases/update-field-definitions/update-field-definitions.use-case';
import { RegenerateFieldDefinitionsUseCase } from '../../../application/use-cases/regenerate-field-definitions/regenerate-field-definitions.use-case';
import { GetTemplateHtmlPreviewUseCase } from '../../../application/use-cases/get-template-html-preview/get-template-html-preview.use-case';
import { GetTemplatePdfPreviewUseCase } from '../../../application/use-cases/get-template-pdf-preview/get-template-pdf-preview.use-case';
import { GetTemplateThumbnailUseCase } from '../../../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case';
import type { FieldDefinition } from '../../../domain/entities/field-definition.interface';
import { CurrentUser, type UserContext } from '../../../../document/interface/rest/decorators/user-context.decorator';

@ApiTags('Templates')
@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class TemplateController {
  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly getTemplateByIdUseCase: GetTemplateByIdUseCase,
    private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    private readonly publishTemplateUseCase: PublishTemplateUseCase,
    private readonly archiveTemplateUseCase: ArchiveTemplateUseCase,
    private readonly replaceTemplateFilesUseCase: ReplaceTemplateFilesUseCase,
    private readonly getPlaceholdersUseCase: GetPlaceholdersUseCase,
    private readonly getFieldDefinitionsUseCase: GetFieldDefinitionsUseCase,
    private readonly updateFieldDefinitionsUseCase: UpdateFieldDefinitionsUseCase,
    private readonly regenerateFieldDefinitionsUseCase: RegenerateFieldDefinitionsUseCase,
    private readonly getTemplateHtmlPreviewUseCase: GetTemplateHtmlPreviewUseCase,
    private readonly getTemplatePdfPreviewUseCase: GetTemplatePdfPreviewUseCase,
    private readonly getTemplateThumbnailUseCase: GetTemplateThumbnailUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template with DOCX file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['template', 'name'],
      properties: {
        template: { type: 'string', format: 'binary', description: 'DOCX template file' },
        name: { type: 'string', example: 'Customer Feedback Form' },
        displayName: { type: 'string', example: 'Customer Feedback' },
        description: { type: 'string', example: 'A form to collect customer feedback' },
        author: { type: 'string', example: 'Admin' },
        type: { type: 'string', enum: ['FORM', 'SURVEY', 'QUIZ', 'OFFICIAL', 'PRIVATE', 'COMMUNITY'] },
        tier: { type: 'string', enum: ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE'] },
        category: { type: 'string', enum: ['FREQUENTLY_USED', 'IDENTIFICATION', 'CERTIFICATE', 'CONTRACT', 'APPLICATION', 'FINANCIAL', 'GOVERNMENT', 'EDUCATION', 'MEDICAL', 'OTHER'] },
        pageOrientation: { type: 'string', enum: ['PORTRAIT', 'LANDSCAPE'] },
      },
    },
  })
  @UseInterceptors(FileInterceptor('template'))
  async createTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
  ) {
    if (!file) {
      throw new BadRequestException('Template DOCX file is required');
    }

    const result = await this.createTemplateUseCase.execute(
      {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        author: body.author,
        type: body.type as any,
        tier: body.tier as any,
        category: body.category as any,
        pageOrientation: body.pageOrientation as any,
      },
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    );
    return getResultValue(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with optional filters' })
  @ApiQuery({ name: 'status', enum: TemplateStatus, required: false })
  @ApiQuery({ name: 'type', enum: TemplateType, required: false })
  @ApiQuery({ name: 'tier', enum: TemplateTier, required: false })
  @ApiQuery({ name: 'category', enum: TemplateCategory, required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'documentTypeId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'grouped', required: false, type: Boolean })
  async getAllTemplates(
    @Query('status') status?: TemplateStatus,
    @Query('type') type?: TemplateType,
    @Query('tier') tier?: TemplateTier,
    @Query('category') category?: TemplateCategory,
    @Query('search') search?: string,
    @Query('documentTypeId') documentTypeId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('grouped') grouped?: string,
    @CurrentUser() user?: UserContext,
  ) {
    const result = await this.getAllTemplatesUseCase.execute(
      {
        status,
        type,
        tier,
        category,
        search,
        documentTypeId,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        grouped: grouped === 'true',
      },
      user?.userTier,
    );
    return getResultValue(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  async getTemplateById(@Param('id') id: string) {
    const result = await this.getTemplateByIdUseCase.execute({ id });
    return getResultValue(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template metadata' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    const result = await this.updateTemplateUseCase.execute({ id, ...body });
    return getResultValue(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  async deleteTemplate(@Param('id') id: string) {
    const result = await this.deleteTemplateUseCase.execute({ id });
    return getResultValue(result);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish a template' })
  async publishTemplate(@Param('id') id: string) {
    const result = await this.publishTemplateUseCase.execute({ id });
    return getResultValue(result);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive a template' })
  async archiveTemplate(@Param('id') id: string) {
    const result = await this.archiveTemplateUseCase.execute({ id });
    return getResultValue(result);
  }

  @Post(':id/files')
  @ApiOperation({ summary: 'Replace template DOCX file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['template'],
      properties: {
        template: { type: 'string', format: 'binary', description: 'New DOCX template file' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('template'))
  async replaceTemplateFiles(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Template DOCX file is required');
    }

    const result = await this.replaceTemplateFilesUseCase.execute(
      { id },
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    );
    return getResultValue(result);
  }

  @Get(':id/placeholders')
  @ApiOperation({ summary: 'Get extracted placeholders from template DOCX' })
  async getPlaceholders(@Param('id') id: string) {
    const result = await this.getPlaceholdersUseCase.execute({ id });
    return getResultValue(result);
  }

  @Get(':id/field-definitions')
  @ApiOperation({ summary: 'Get auto-generated field definitions' })
  async getFieldDefinitions(@Param('id') id: string) {
    const result = await this.getFieldDefinitionsUseCase.execute({ id });
    return getResultValue(result);
  }

  @Put(':id/field-definitions')
  @ApiOperation({ summary: 'Update field definitions manually' })
  async updateFieldDefinitions(
    @Param('id') id: string,
    @Body() body: { fieldDefinitions: FieldDefinition[] },
  ) {
    const result = await this.updateFieldDefinitionsUseCase.execute({
      id,
      fieldDefinitions: body.fieldDefinitions,
    });
    return getResultValue(result);
  }

  @Post(':id/field-definitions/regenerate')
  @ApiOperation({ summary: 'Regenerate field definitions from stored DOCX' })
  async regenerateFieldDefinitions(@Param('id') id: string) {
    const result = await this.regenerateFieldDefinitionsUseCase.execute({ id });
    return getResultValue(result);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get HTML preview of template' })
  async getHtmlPreview(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getTemplateHtmlPreviewUseCase.execute({ id });
    const value = getResultValue(result) as { buffer: Buffer; filename: string };
    res.set({ 'Content-Type': 'text/html', 'Content-Length': value.buffer.length.toString() });
    res.send(value.buffer);
  }

  @Get(':id/preview/pdf')
  @ApiOperation({ summary: 'Get PDF preview of template' })
  async getPdfPreview(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getTemplatePdfPreviewUseCase.execute({ id });
    const value = getResultValue(result) as { buffer: Buffer; filename: string };
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="preview.pdf"', 'Content-Length': value.buffer.length.toString() });
    res.send(value.buffer);
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get template thumbnail image' })
  async getThumbnail(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getTemplateThumbnailUseCase.execute({ id });
    const value = getResultValue(result) as { buffer: Buffer; filename: string };
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60', 'Content-Length': value.buffer.length.toString() });
    res.send(value.buffer);
  }
}
