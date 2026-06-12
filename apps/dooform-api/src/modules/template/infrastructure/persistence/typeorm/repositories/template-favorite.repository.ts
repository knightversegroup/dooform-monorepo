import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { ITemplateFavoriteRepository } from '../../../../domain/repositories/template-favorite.repository'
import { TemplateFavoriteModel } from '../models/template-favorite.model'

@Injectable()
export class TypeOrmTemplateFavoriteRepository implements ITemplateFavoriteRepository {
  constructor(
    @InjectRepository(TemplateFavoriteModel)
    private readonly repository: Repository<TemplateFavoriteModel>,
  ) {}

  async addFavorite(userId: string, templateId: string): Promise<boolean> {
    try {
      await this.repository.insert({ userId, templateId })
      return true
    } catch (error: any) {
      // If duplicate key error (already favorited), return false
      if (error.code === '23505') {
        return false
      }
      throw error
    }
  }

  async removeFavorite(userId: string, templateId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, templateId })
    return (result.affected ?? 0) > 0
  }

  async isFavorite(userId: string, templateId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { userId, templateId } })
    return count > 0
  }

  async getFavoriteTemplateIds(userId: string): Promise<string[]> {
    const favorites = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: ['templateId'],
    })
    return favorites.map((f) => f.templateId)
  }
}
