import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, Res, UseFilters, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import 'multer'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { TemplateStatus, TemplateType, TemplateTier, TemplateCategory } from '../../../domain/enums/template.enum'
import type { FieldDefinition } from '../../../domain/entities/field-definition.interface'
import { CurrentUser, type UserContext } from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Templates')
@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class TemplateController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Post()
  @RequirePermission('templates:create')
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
        visibility: { type: 'string', enum: ['ORGANIZATION', 'GLOBAL'], description: 'GLOBAL is GLOBAL_ADMIN-only' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('template'))
  async createTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
    @CurrentUser() user: UserContext & { role?: string },
    @Req() req: { user?: { role?: string } },
  ) {
    if (!file) throw new BadRequestException('Template DOCX file is required')

    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-template/create-template.use-case.module'),
      () => import('../../../application/use-cases/create-template/create-template.use-case'),
    )
    const callerRole = req.user?.role ?? 'USER'
    const result = await uc.execute(
      {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        author: body.author,
        type: body.type as any,
        tier: body.tier as any,
        category: body.category as any,
        pageOrientation: body.pageOrientation as any,
        visibility: body.visibility as any,
        organizationId: user.organizationId,
        ownerUserId: user.userId,
        callerRole,
      },
      { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype, size: file.size },
    )
    return getResultValue(result)
  }

  @Get()
  @RequirePermission('templates:read')
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
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case.module'),
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case'),
    )
    const result = await uc.execute(
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
        organizationId: user?.organizationId ?? null,
        callerRole: user?.role,
      },
      user?.userTier,
    )
    return getResultValue(result)
  }

  @Get(':id')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get a template by ID' })
  async getTemplateById(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'),
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        callerRole: user?.role,
        callerOrganizationId: user?.organizationId,
        callerUserId: user?.userId,
      }),
    )
  }

  @Put(':id')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Update template metadata' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @CurrentUser() user?: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-template/update-template.use-case.module'),
      () => import('../../../application/use-cases/update-template/update-template.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        ...body,
        callerRole: user?.role ?? 'USER',
        callerOrganizationId: user?.organizationId ?? null,
        callerUserId: user?.userId,
      }),
    )
  }

  @Delete(':id')
  @RequirePermission('templates:delete')
  @ApiOperation({ summary: 'Delete a template' })
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-template/delete-template.use-case.module'),
      () => import('../../../application/use-cases/delete-template/delete-template.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        callerRole: user?.role,
        callerOrganizationId: user?.organizationId,
        callerUserId: user?.userId,
      }),
    )
  }

  @Put(':id/publish')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Publish a template' })
  async publishTemplate(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/publish-template/publish-template.use-case.module'),
      () => import('../../../application/use-cases/publish-template/publish-template.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        callerRole: user?.role,
        callerOrganizationId: user?.organizationId,
        callerUserId: user?.userId,
      }),
    )
  }

  @Put(':id/unpublish')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Revert a template back to DRAFT' })
  async unpublishTemplate(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/unpublish-template/unpublish-template.use-case.module'),
      () => import('../../../application/use-cases/unpublish-template/unpublish-template.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        callerRole: user?.role,
        callerOrganizationId: user?.organizationId,
        callerUserId: user?.userId,
      }),
    )
  }

  @Put(':id/archive')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Archive a template' })
  async archiveTemplate(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/archive-template/archive-template.use-case.module'),
      () => import('../../../application/use-cases/archive-template/archive-template.use-case'),
    )
    return getResultValue(
      await uc.execute({
        id,
        callerRole: user?.role,
        callerOrganizationId: user?.organizationId,
        callerUserId: user?.userId,
      }),
    )
  }

  @Post(':id/files')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Replace template DOCX file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['template'], properties: { template: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('template'))
  async replaceTemplateFiles(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user?: UserContext,
  ) {
    if (!file) throw new BadRequestException('Template DOCX file is required')

    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/replace-template-files/replace-template-files.use-case.module'),
      () => import('../../../application/use-cases/replace-template-files/replace-template-files.use-case'),
    )
    return getResultValue(
      await uc.execute(
        {
          id,
          callerRole: user?.role,
          callerOrganizationId: user?.organizationId,
          callerUserId: user?.userId,
        },
        { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype, size: file.size },
      ),
    )
  }

  @Get(':id/placeholders')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get extracted placeholders from template DOCX' })
  async getPlaceholders(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-placeholders/get-placeholders.use-case.module'),
      () => import('../../../application/use-cases/get-placeholders/get-placeholders.use-case'),
    )
    return getResultValue(await uc.execute({ id }))
  }

  @Get(':id/field-definitions')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get auto-generated field definitions' })
  async getFieldDefinitions(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-field-definitions/get-field-definitions.use-case.module'),
      () => import('../../../application/use-cases/get-field-definitions/get-field-definitions.use-case'),
    )
    return getResultValue(await uc.execute({ id }))
  }

  @Put(':id/field-definitions')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Update field definitions manually' })
  async updateFieldDefinitions(@Param('id') id: string, @Body() body: { fieldDefinitions: FieldDefinition[] }) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-field-definitions/update-field-definitions.use-case.module'),
      () => import('../../../application/use-cases/update-field-definitions/update-field-definitions.use-case'),
    )
    return getResultValue(await uc.execute({ id, fieldDefinitions: body.fieldDefinitions }))
  }

  @Post(':id/field-definitions/regenerate')
  @RequirePermission('templates:update')
  @ApiOperation({ summary: 'Regenerate field definitions from stored DOCX' })
  async regenerateFieldDefinitions(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/regenerate-field-definitions/regenerate-field-definitions.use-case.module'),
      () => import('../../../application/use-cases/regenerate-field-definitions/regenerate-field-definitions.use-case'),
    )
    return getResultValue(await uc.execute({ id }))
  }

  @Get(':id/preview')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get HTML preview of template' })
  async getHtmlPreview(@Param('id') id: string, @Res() res: Response) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-html-preview/get-template-html-preview.use-case.module'),
      () => import('../../../application/use-cases/get-template-html-preview/get-template-html-preview.use-case'),
    )
    const value = getResultValue(await uc.execute({ id })) as { buffer: Buffer; filename: string }
    res.set({ 'Content-Type': 'text/html', 'Content-Length': value.buffer.length.toString() })
    res.send(value.buffer)
  }

  @Get(':id/preview/pdf')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get PDF preview of template' })
  async getPdfPreview(@Param('id') id: string, @Res() res: Response) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-pdf-preview/get-template-pdf-preview.use-case.module'),
      () => import('../../../application/use-cases/get-template-pdf-preview/get-template-pdf-preview.use-case'),
    )
    const value = getResultValue(await uc.execute({ id })) as { buffer: Buffer; filename: string }
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="preview.pdf"', 'Content-Length': value.buffer.length.toString() })
    res.send(value.buffer)
  }

  @Get(':id/thumbnail')
  @RequirePermission('templates:read')
  @ApiOperation({ summary: 'Get template thumbnail image' })
  async getThumbnail(@Param('id') id: string, @Res() res: Response) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case.module'),
      () => import('../../../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case'),
    )
    const value = getResultValue(await uc.execute({ id })) as { buffer: Buffer; filename: string }
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60', 'Content-Length': value.buffer.length.toString() })
    res.send(value.buffer)
  }
}
