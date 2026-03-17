import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseFilters,
} from '@nestjs/common'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'
import { Roles } from '../../../../../common/decorators/roles.decorator'

import {
  GetDocumentTypesUseCase,
  GetDocumentTypeByIdUseCase,
  GetDocumentTypeByCodeUseCase,
  CreateDocumentTypeUseCase,
  UpdateDocumentTypeUseCase,
  DeleteDocumentTypeUseCase,
  GetCategoriesUseCase,
  AssignTemplateUseCase,
  UnassignTemplateUseCase,
  BulkAssignTemplatesUseCase,
  GetTemplatesByDocumentTypeUseCase,
} from '../../../application/use-cases/document-type/document-type.use-case'
import type { CreateDocumentTypeDto } from '../../../application/dtos/create-document-type.dto'
import type { UpdateDocumentTypeDto } from '../../../application/dtos/update-document-type.dto'
import type { AssignTemplateDto, BulkAssignTemplatesDto } from '../../../application/dtos/assign-template.dto'

@Controller('document-types')
@UseFilters(HttpResultExceptionFilter)
export class DocumentTypeController {
  constructor(
    private readonly getDocumentTypesUseCase: GetDocumentTypesUseCase,
    private readonly getDocumentTypeByIdUseCase: GetDocumentTypeByIdUseCase,
    private readonly getDocumentTypeByCodeUseCase: GetDocumentTypeByCodeUseCase,
    private readonly createDocumentTypeUseCase: CreateDocumentTypeUseCase,
    private readonly updateDocumentTypeUseCase: UpdateDocumentTypeUseCase,
    private readonly deleteDocumentTypeUseCase: DeleteDocumentTypeUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly assignTemplateUseCase: AssignTemplateUseCase,
    private readonly unassignTemplateUseCase: UnassignTemplateUseCase,
    private readonly bulkAssignTemplatesUseCase: BulkAssignTemplatesUseCase,
    private readonly getTemplatesByDocumentTypeUseCase: GetTemplatesByDocumentTypeUseCase,
  ) {}

  // GET /api/document-types
  @Get()
  async getDocumentTypes(
    @Query('category') category?: string,
    @Query('active_only') activeOnly?: string,
  ) {
    const result = await this.getDocumentTypesUseCase.execute({
      category,
      activeOnly: activeOnly === 'true',
    })
    return { documentTypes: getResultValue(result) }
  }

  // GET /api/document-types/categories
  @Get('categories')
  async getCategories() {
    const result = await this.getCategoriesUseCase.execute({})
    return { categories: getResultValue(result) }
  }

  // GET /api/document-types/suggestions
  @Get('suggestions')
  async getAutoSuggestions() {
    return { suggestions: [] }
  }

  // GET /api/document-types/suggestions/:templateId
  @Get('suggestions/:templateId')
  async getSuggestionForTemplate(@Param('templateId') templateId: string) {
    return { suggestion: null }
  }

  // POST /api/document-types/suggestions/apply
  @Post('suggestions/apply')
  @Roles('admin')
  async applySuggestion(@Body() body: any) {
    return { success: true, message: 'No suggestions to apply', document_type: null }
  }

  // POST /api/document-types/auto-group
  @Post('auto-group')
  @Roles('admin')
  async autoGroupAllTemplates() {
    return { success: true, message: 'Auto-grouping not yet configured', grouped: 0, created_document_types: [] }
  }

  // GET /api/document-types/code/:code
  @Get('code/:code')
  async getDocumentTypeByCode(@Param('code') code: string) {
    const result = await this.getDocumentTypeByCodeUseCase.execute({ code })
    return { documentType: getResultValue(result) }
  }

  // GET /api/document-types/:id
  @Get(':id')
  async getDocumentTypeById(@Param('id') id: string) {
    const result = await this.getDocumentTypeByIdUseCase.execute({ id })
    return { documentType: getResultValue(result) }
  }

  // POST /api/document-types
  @Post()
  async createDocumentType(@Body() body: CreateDocumentTypeDto) {
    const result = await this.createDocumentTypeUseCase.execute(body)
    return getResultValue(result)
  }

  // PUT /api/document-types/:id
  @Put(':id')
  async updateDocumentType(@Param('id') id: string, @Body() body: UpdateDocumentTypeDto) {
    const result = await this.updateDocumentTypeUseCase.execute({ id, ...body })
    return getResultValue(result)
  }

  // DELETE /api/document-types/:id
  @Delete(':id')
  async deleteDocumentType(@Param('id') id: string) {
    const result = await this.deleteDocumentTypeUseCase.execute({ id })
    return getResultValue(result)
  }

  // GET /api/document-types/:id/templates
  @Get(':id/templates')
  async getTemplatesByDocumentType(@Param('id') id: string) {
    const result = await this.getTemplatesByDocumentTypeUseCase.execute({ documentTypeId: id })
    return { templates: getResultValue(result) }
  }

  // POST /api/document-types/:id/templates
  @Post(':id/templates')
  async assignTemplate(@Param('id') id: string, @Body() body: AssignTemplateDto) {
    const result = await this.assignTemplateUseCase.execute({
      documentTypeId: id,
      templateId: body.templateId,
      variantName: body.variantName,
      variantOrder: body.variantOrder,
    })
    return getResultValue(result)
  }

  // POST /api/document-types/:id/templates/bulk
  @Post(':id/templates/bulk')
  async bulkAssignTemplates(@Param('id') id: string, @Body() body: BulkAssignTemplatesDto) {
    const result = await this.bulkAssignTemplatesUseCase.execute({
      documentTypeId: id,
      assignments: body.assignments,
    })
    return getResultValue(result)
  }

  // DELETE /api/document-types/:id/templates/:templateId
  @Delete(':id/templates/:templateId')
  async unassignTemplate(@Param('templateId') templateId: string) {
    const result = await this.unassignTemplateUseCase.execute({ templateId })
    return getResultValue(result)
  }
}
