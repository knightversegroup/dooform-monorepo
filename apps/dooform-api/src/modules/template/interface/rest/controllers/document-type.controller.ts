import { Controller, Get, Post, Put, Delete, Param, Body, UseFilters } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

@ApiTags('Document Types')
@Controller('document-types')
@UseFilters(HttpResultExceptionFilter)
export class DocumentTypeController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all document type categories' })
  async getCategories() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-document-type-categories/get-document-type-categories.use-case.module'),
      () => import('../../../application/use-cases/get-document-type-categories/get-document-type-categories.use-case'),
    )
    const result = await uc.execute({})
    return getResultValue(result)
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get document type by code' })
  async getByCode(@Param('code') code: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-document-type-by-code/get-document-type-by-code.use-case.module'),
      () => import('../../../application/use-cases/get-document-type-by-code/get-document-type-by-code.use-case'),
    )
    const result = await uc.execute({ code })
    return getResultValue(result)
  }

  @Get()
  @ApiOperation({ summary: 'Get all document types' })
  async getAll() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-all-document-types/get-all-document-types.use-case.module'),
      () => import('../../../application/use-cases/get-all-document-types/get-all-document-types.use-case'),
    )
    const result = await uc.execute({})
    return getResultValue(result)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document type by ID' })
  async getById(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-document-type-by-id/get-document-type-by-id.use-case.module'),
      () => import('../../../application/use-cases/get-document-type-by-id/get-document-type-by-id.use-case'),
    )
    const result = await uc.execute({ id })
    return getResultValue(result)
  }

  @Post()
  @ApiOperation({ summary: 'Create a document type' })
  async create(@Body() body: Record<string, any>) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-document-type/create-document-type.use-case.module'),
      () => import('../../../application/use-cases/create-document-type/create-document-type.use-case'),
    )
    const result = await uc.execute(body as any)
    return getResultValue(result)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document type' })
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-document-type/update-document-type.use-case.module'),
      () => import('../../../application/use-cases/update-document-type/update-document-type.use-case'),
    )
    const result = await uc.execute({ id, ...body } as any)
    return getResultValue(result)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document type' })
  async delete(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-document-type/delete-document-type.use-case.module'),
      () => import('../../../application/use-cases/delete-document-type/delete-document-type.use-case'),
    )
    const result = await uc.execute({ id })
    return getResultValue(result)
  }

  @Get(':id/templates')
  @ApiOperation({ summary: 'Get templates assigned to document type' })
  async getTemplates(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-templates-by-document-type/get-templates-by-document-type.use-case.module'),
      () => import('../../../application/use-cases/get-templates-by-document-type/get-templates-by-document-type.use-case'),
    )
    const result = await uc.execute({ id })
    return getResultValue(result)
  }

  @Post(':id/templates')
  @ApiOperation({ summary: 'Assign a template to document type' })
  async assignTemplate(
    @Param('id') id: string,
    @Body() body: { templateId: string; variantName?: string; variantOrder?: number },
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/assign-template-to-document-type/assign-template-to-document-type.use-case.module'),
      () => import('../../../application/use-cases/assign-template-to-document-type/assign-template-to-document-type.use-case'),
    )
    const result = await uc.execute({
      documentTypeId: id,
      templateId: body.templateId,
      variantName: body.variantName,
      variantOrder: body.variantOrder,
    })
    return getResultValue(result)
  }

  @Post(':id/templates/bulk')
  @ApiOperation({ summary: 'Bulk assign templates to document type' })
  async bulkAssignTemplates(
    @Param('id') id: string,
    @Body() body: { assignments: Array<{ templateId: string; variantName?: string; variantOrder?: number }> },
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/bulk-assign-templates/bulk-assign-templates.use-case.module'),
      () => import('../../../application/use-cases/bulk-assign-templates/bulk-assign-templates.use-case'),
    )
    const result = await uc.execute({
      documentTypeId: id,
      assignments: body.assignments,
    })
    return getResultValue(result)
  }

  @Delete(':id/templates/:templateId')
  @ApiOperation({ summary: 'Unassign a template from document type' })
  async unassignTemplate(
    @Param('id') id: string,
    @Param('templateId') templateId: string,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/unassign-template-from-document-type/unassign-template-from-document-type.use-case.module'),
      () => import('../../../application/use-cases/unassign-template-from-document-type/unassign-template-from-document-type.use-case'),
    )
    const result = await uc.execute({
      documentTypeId: id,
      templateId,
    })
    return getResultValue(result)
  }
}
