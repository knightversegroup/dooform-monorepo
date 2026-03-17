import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, BusinessRuleViolationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { DocumentType } from '../../../domain/entities/document-type.entity'
import { DocumentTypeCategory } from '../../../domain/enums/document-type.enum'
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { toDocumentTypeResponse, toTemplateResponse, type DocumentTypeResponse, type TemplateResponse } from '../../mappers/template.mapper'

// --- Get All Document Types ---

interface GetDocumentTypesInput {
  category?: string
  activeOnly?: boolean
}

@Injectable()
@UseClassLogger('document-type')
export class GetDocumentTypesUseCase implements UseCase<GetDocumentTypesInput, DocumentTypeResponse[]> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: GetDocumentTypesInput): Promise<Result<DocumentTypeResponse[]>> {
    const docTypes = await this.documentTypeRepository.findAll(dto.category, dto.activeOnly)
    return docTypes.map(toDocumentTypeResponse) as any
  }
}

// --- Get Document Type By ID (with templates) ---

interface GetDocumentTypeInput {
  id: string
}

@Injectable()
@UseClassLogger('document-type')
export class GetDocumentTypeByIdUseCase implements UseCase<GetDocumentTypeInput, DocumentTypeResponse> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: GetDocumentTypeInput): Promise<Result<DocumentTypeResponse>> {
    const docType = await this.documentTypeRepository.findById(dto.id)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with id ${dto.id} not found`)
    }

    // Get associated templates
    const templates = await this.templateRepository.findWithFilter({ documentTypeId: dto.id, sort: 'default' })

    return {
      ...toDocumentTypeResponse(docType),
      templates: templates.map(toTemplateResponse),
    } as any
  }
}

// --- Get Document Type By Code ---

interface GetDocumentTypeByCodeInput {
  code: string
}

@Injectable()
@UseClassLogger('document-type')
export class GetDocumentTypeByCodeUseCase implements UseCase<GetDocumentTypeByCodeInput, DocumentTypeResponse> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: GetDocumentTypeByCodeInput): Promise<Result<DocumentTypeResponse>> {
    const docType = await this.documentTypeRepository.findByCode(dto.code)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with code '${dto.code}' not found`)
    }

    return toDocumentTypeResponse(docType) as any
  }
}

// --- Create Document Type ---

interface CreateDocumentTypeInput {
  code: string
  name: string
  nameEn?: string
  description?: string
  originalSource?: string
  category?: string
  icon?: string
  color?: string
  sortOrder?: number
  metadata?: string
}

@Injectable()
@UseClassLogger('document-type')
export class CreateDocumentTypeUseCase implements UseCase<CreateDocumentTypeInput, { message: string; documentType: DocumentTypeResponse }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: CreateDocumentTypeInput): Promise<Result<{ message: string; documentType: DocumentTypeResponse }>> {
    // Check for duplicate code
    const existing = await this.documentTypeRepository.findByCode(dto.code)
    if (existing) {
      throw new BusinessRuleViolationException(`Document type with code '${dto.code}' already exists`)
    }

    const docType = DocumentType.create({
      code: dto.code,
      name: dto.name,
      nameEn: dto.nameEn,
      description: dto.description,
      originalSource: dto.originalSource,
      category: dto.category,
      icon: dto.icon,
      color: dto.color,
      sortOrder: dto.sortOrder,
      metadata: dto.metadata || '{}',
    })

    const saved = await this.documentTypeRepository.save(docType)

    return {
      message: 'Document type created successfully',
      documentType: toDocumentTypeResponse(saved),
    } as any
  }
}

// --- Update Document Type ---

interface UpdateDocumentTypeInput {
  id: string
  code?: string
  name?: string
  nameEn?: string
  description?: string
  originalSource?: string
  category?: string
  icon?: string
  color?: string
  sortOrder?: number
  isActive?: boolean
  metadata?: string
}

@Injectable()
@UseClassLogger('document-type')
export class UpdateDocumentTypeUseCase implements UseCase<UpdateDocumentTypeInput, { message: string; documentType: DocumentTypeResponse }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: UpdateDocumentTypeInput): Promise<Result<{ message: string; documentType: DocumentTypeResponse }>> {
    const docType = await this.documentTypeRepository.findById(dto.id)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with id ${dto.id} not found`)
    }

    const props = docType.getProps()

    // Check for unique code if changed
    if (dto.code && dto.code !== props.code) {
      const existing = await this.documentTypeRepository.findByCode(dto.code)
      if (existing) {
        throw new BusinessRuleViolationException(`Document type with code '${dto.code}' already exists`)
      }
    }

    // Update props (matching Go logic: only set if non-empty)
    const updates: Record<string, any> = {}
    if (dto.code) updates.code = dto.code
    if (dto.name) updates.name = dto.name
    if (dto.nameEn) updates.nameEn = dto.nameEn
    if (dto.description) updates.description = dto.description
    if (dto.originalSource) updates.originalSource = dto.originalSource
    if (dto.category) updates.category = dto.category
    if (dto.icon) updates.icon = dto.icon
    if (dto.color) updates.color = dto.color
    if (dto.sortOrder !== undefined) updates.sortOrder = dto.sortOrder
    if (dto.isActive !== undefined) updates.isActive = dto.isActive
    if (dto.metadata) updates.metadata = dto.metadata

    // Apply updates via internal prop manager
    ;(docType as any)._props = { ...props, ...updates, updatedAt: new Date() }

    const saved = await this.documentTypeRepository.save(docType)

    return {
      message: 'Document type updated successfully',
      documentType: toDocumentTypeResponse(saved),
    } as any
  }
}

// --- Delete Document Type ---

interface DeleteDocumentTypeInput {
  id: string
}

@Injectable()
@UseClassLogger('document-type')
export class DeleteDocumentTypeUseCase implements UseCase<DeleteDocumentTypeInput, { message: string }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: DeleteDocumentTypeInput): Promise<Result<{ message: string }>> {
    const docType = await this.documentTypeRepository.findById(dto.id)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with id ${dto.id} not found`)
    }

    // Check for linked templates
    const count = await this.documentTypeRepository.countTemplatesByDocumentTypeId(dto.id)
    if (count > 0) {
      throw new BusinessRuleViolationException(`Cannot delete document type with ${count} linked templates`)
    }

    await this.documentTypeRepository.deleteById(dto.id)

    return { message: 'Document type deleted successfully' } as any
  }
}

// --- Get Categories ---

@Injectable()
@UseClassLogger('document-type')
export class GetCategoriesUseCase implements UseCase<Record<string, never>, string[]> {
  @UseResult()
  async execute(_dto?: Record<string, never>): Promise<Result<string[]>> {
    return Object.values(DocumentTypeCategory) as any
  }
}

// --- Assign Template to Document Type ---

interface AssignTemplateInput {
  documentTypeId: string
  templateId: string
  variantName?: string
  variantOrder?: number
}

@Injectable()
@UseClassLogger('document-type')
export class AssignTemplateUseCase implements UseCase<AssignTemplateInput, { message: string }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: AssignTemplateInput): Promise<Result<{ message: string }>> {
    // Validate document type exists
    const docType = await this.documentTypeRepository.findById(dto.documentTypeId)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with id ${dto.documentTypeId} not found`)
    }

    // Find and update template
    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    template.assignToDocumentType(dto.documentTypeId, dto.variantName ?? '', dto.variantOrder ?? 0)
    await this.templateRepository.save(template)

    return { message: 'Template assigned successfully' } as any
  }
}

// --- Unassign Template from Document Type ---

interface UnassignTemplateInput {
  templateId: string
}

@Injectable()
@UseClassLogger('document-type')
export class UnassignTemplateUseCase implements UseCase<UnassignTemplateInput, { message: string }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: UnassignTemplateInput): Promise<Result<{ message: string }>> {
    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    template.unassignFromDocumentType()
    await this.templateRepository.save(template)

    return { message: 'Template unassigned successfully' } as any
  }
}

// --- Bulk Assign Templates ---

interface BulkAssignTemplatesInput {
  documentTypeId: string
  assignments: { templateId: string; variantName?: string; variantOrder?: number }[]
}

@Injectable()
@UseClassLogger('document-type')
export class BulkAssignTemplatesUseCase implements UseCase<BulkAssignTemplatesInput, { message: string }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: BulkAssignTemplatesInput): Promise<Result<{ message: string }>> {
    // Validate document type exists
    const docType = await this.documentTypeRepository.findById(dto.documentTypeId)
    if (!docType) {
      throw new EntityNotFoundException(`Document type with id ${dto.documentTypeId} not found`)
    }

    for (const assignment of dto.assignments) {
      const template = await this.templateRepository.findById(assignment.templateId)
      if (!template) {
        throw new EntityNotFoundException(`Template with id ${assignment.templateId} not found`)
      }

      template.assignToDocumentType(dto.documentTypeId, assignment.variantName ?? '', assignment.variantOrder ?? 0)
      await this.templateRepository.save(template)
    }

    return { message: 'Templates assigned successfully' } as any
  }
}

// --- Get Templates By Document Type ---

interface GetTemplatesByDocumentTypeInput {
  documentTypeId: string
}

@Injectable()
@UseClassLogger('document-type')
export class GetTemplatesByDocumentTypeUseCase implements UseCase<GetTemplatesByDocumentTypeInput, TemplateResponse[]> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: GetTemplatesByDocumentTypeInput): Promise<Result<TemplateResponse[]>> {
    const templates = await this.templateRepository.findWithFilter({
      documentTypeId: dto.documentTypeId,
    })

    return templates.map(toTemplateResponse) as any
  }
}
