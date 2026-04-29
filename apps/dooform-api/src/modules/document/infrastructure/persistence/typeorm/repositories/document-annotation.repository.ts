import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { DocumentAnnotation, type DocumentAnnotationProps } from '../../../../domain/entities/document-annotation.entity'
import type { IDocumentAnnotationRepository } from '../../../../domain/repositories/document-annotation.repository'
import { DocumentAnnotationModel } from '../models/document-annotation.model'

@Injectable()
export class TypeOrmDocumentAnnotationRepository implements IDocumentAnnotationRepository {
  constructor(
    @InjectRepository(DocumentAnnotationModel)
    private readonly repository: Repository<DocumentAnnotationModel>,
  ) {}

  async findByDocumentAndUser(documentId: string, userId: string): Promise<DocumentAnnotation | null> {
    const model = await this.repository.findOne({
      where: { documentId, userId },
    })
    return model ? this.toEntity(model) : null
  }

  async findByDocumentId(documentId: string): Promise<DocumentAnnotation | null> {
    const model = await this.repository.findOne({
      where: { documentId },
    })
    return model ? this.toEntity(model) : null
  }

  async findById(id: string): Promise<DocumentAnnotation | null> {
    const model = await this.repository.findOne({ where: { id } })
    return model ? this.toEntity(model) : null
  }

  async findOne(conditions: Record<string, unknown>): Promise<DocumentAnnotation | null> {
    const model = await this.repository.findOne({ where: conditions as any })
    return model ? this.toEntity(model) : null
  }

  async findMany(conditions: Record<string, unknown>): Promise<DocumentAnnotation[]> {
    const models = await this.repository.find({ where: conditions as any })
    return models.map((m) => this.toEntity(m))
  }

  async findAll(): Promise<DocumentAnnotation[]> {
    const models = await this.repository.find()
    return models.map((m) => this.toEntity(m))
  }

  async save(entity: DocumentAnnotation): Promise<DocumentAnnotation> {
    const modelData = this.toModel(entity)
    const saved = await this.repository.save(modelData)
    return this.toEntity(saved)
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length > 0) await this.repository.delete(ids)
  }

  async bulkSave(entities: DocumentAnnotation[]): Promise<DocumentAnnotation[]> {
    const models = entities.map((e) => this.toModel(e))
    const saved = await this.repository.save(models)
    return saved.map((m) => this.toEntity(m))
  }

  async exists(id: string): Promise<boolean> {
    return (await this.repository.count({ where: { id } })) > 0
  }

  async count(conditions?: Record<string, unknown>): Promise<number> {
    return this.repository.count(conditions ? { where: conditions as any } : undefined)
  }

  async countAll(): Promise<number> {
    return this.repository.count()
  }

  async findWithSearchOptions(): Promise<any> {
    throw new Error('Not implemented for DocumentAnnotation')
  }

  private toEntity(model: DocumentAnnotationModel): DocumentAnnotation {
    const props: DocumentAnnotationProps = {
      id: model.id,
      documentId: model.documentId,
      userId: model.userId,
      version: model.version,
      data: model.data,
      finalized: model.finalized,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }
    return new (DocumentAnnotation as any)(props)
  }

  private toModel(entity: DocumentAnnotation): Partial<DocumentAnnotationModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      documentId: props.documentId,
      userId: props.userId,
      version: props.version,
      data: props.data,
      finalized: props.finalized,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    }
  }
}
