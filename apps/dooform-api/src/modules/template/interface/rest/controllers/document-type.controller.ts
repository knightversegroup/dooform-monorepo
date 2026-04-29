import { Controller, Get, Post, Put, Delete, Param, Body, UseFilters } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { CreateDocumentTypeUseCase } from '../../../application/use-cases/create-document-type/create-document-type.use-case'
import { GetAllDocumentTypesUseCase } from '../../../application/use-cases/get-all-document-types/get-all-document-types.use-case'
import { GetDocumentTypeByIdUseCase } from '../../../application/use-cases/get-document-type-by-id/get-document-type-by-id.use-case'
import { GetDocumentTypeByCodeUseCase } from '../../../application/use-cases/get-document-type-by-code/get-document-type-by-code.use-case'
import { UpdateDocumentTypeUseCase } from '../../../application/use-cases/update-document-type/update-document-type.use-case'
import { DeleteDocumentTypeUseCase } from '../../../application/use-cases/delete-document-type/delete-document-type.use-case'
import { GetDocumentTypeCategoriesUseCase } from '../../../application/use-cases/get-document-type-categories/get-document-type-categories.use-case'
import { GetTemplatesByDocumentTypeUseCase } from '../../../application/use-cases/get-templates-by-document-type/get-templates-by-document-type.use-case'
import { AssignTemplateToDocumentTypeUseCase } from '../../../application/use-cases/assign-template-to-document-type/assign-template-to-document-type.use-case'
import { BulkAssignTemplatesUseCase } from '../../../application/use-cases/bulk-assign-templates/bulk-assign-templates.use-case'
import { UnassignTemplateFromDocumentTypeUseCase } from '../../../application/use-cases/unassign-template-from-document-type/unassign-template-from-document-type.use-case'

@ApiTags('Document Types')
@Controller('document-types')
@UseFilters(HttpResultExceptionFilter)
export class DocumentTypeController {
  constructor(
    private readonly createDocumentTypeUseCase: CreateDocumentTypeUseCase,
    private readonly getAllDocumentTypesUseCase: GetAllDocumentTypesUseCase,
    private readonly getDocumentTypeByIdUseCase: GetDocumentTypeByIdUseCase,
    private readonly getDocumentTypeByCodeUseCase: GetDocumentTypeByCodeUseCase,
    private readonly updateDocumentTypeUseCase: UpdateDocumentTypeUseCase,
    private readonly deleteDocumentTypeUseCase: DeleteDocumentTypeUseCase,
    private readonly getDocumentTypeCategoriesUseCase: GetDocumentTypeCategoriesUseCase,
    private readonly getTemplatesByDocumentTypeUseCase: GetTemplatesByDocumentTypeUseCase,
    private readonly assignTemplateUseCase: AssignTemplateToDocumentTypeUseCase,
    private readonly bulkAssignTemplatesUseCase: BulkAssignTemplatesUseCase,
    private readonly unassignTemplateUseCase: UnassignTemplateFromDocumentTypeUseCase,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all document type categories' })
  async getCategories() {
    const result = await this.getDocumentTypeCategoriesUseCase.execute({})
    return getResultValue(result)
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get document type by code' })
  async getByCode(@Param('code') code: string) {
    const result = await this.getDocumentTypeByCodeUseCase.execute({ code })
    return getResultValue(result)
  }

  @Get()
  @ApiOperation({ summary: 'Get all document types' })
  async getAll() {
    const result = await this.getAllDocumentTypesUseCase.execute({})
    return getResultValue(result)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document type by ID' })
  async getById(@Param('id') id: string) {
    const result = await this.getDocumentTypeByIdUseCase.execute({ id })
    return getResultValue(result)
  }

  @Post()
  @ApiOperation({ summary: 'Create a document type' })
  async create(@Body() body: Record<string, any>) {
    const result = await this.createDocumentTypeUseCase.execute(body as any)
    return getResultValue(result)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document type' })
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const result = await this.updateDocumentTypeUseCase.execute({ id, ...body } as any)
    return getResultValue(result)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document type' })
  async delete(@Param('id') id: string) {
    const result = await this.deleteDocumentTypeUseCase.execute({ id })
    return getResultValue(result)
  }

  @Get(':id/templates')
  @ApiOperation({ summary: 'Get templates assigned to document type' })
  async getTemplates(@Param('id') id: string) {
    const result = await this.getTemplatesByDocumentTypeUseCase.execute({ id })
    return getResultValue(result)
  }

  @Post(':id/templates')
  @ApiOperation({ summary: 'Assign a template to document type' })
  async assignTemplate(
    @Param('id') id: string,
    @Body() body: { templateId: string; variantName?: string; variantOrder?: number },
  ) {
    const result = await this.assignTemplateUseCase.execute({
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
    const result = await this.bulkAssignTemplatesUseCase.execute({
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
    const result = await this.unassignTemplateUseCase.execute({
      documentTypeId: id,
      templateId,
    })
    return getResultValue(result)
  }
}
