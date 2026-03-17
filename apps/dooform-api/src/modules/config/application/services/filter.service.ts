import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { FilterCategoryModel } from '../../infrastructure/persistence/typeorm/models/filter-category.model'
import { FilterOptionModel } from '../../infrastructure/persistence/typeorm/models/filter-option.model'
import { DEFAULT_FILTERS } from '../../domain/constants/default-filters'
import type {
  CreateFilterCategoryDto,
  UpdateFilterCategoryDto,
  CreateFilterOptionDto,
  UpdateFilterOptionDto,
} from '../dtos/filter.dto'

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name)

  constructor(
    @InjectRepository(FilterCategoryModel)
    private readonly categoryRepository: Repository<FilterCategoryModel>,
    @InjectRepository(FilterOptionModel)
    private readonly optionRepository: Repository<FilterOptionModel>,
  ) {}

  // ========== Filter Categories ==========

  async getAllCategories(activeOnly = false): Promise<FilterCategoryModel[]> {
    const qb = this.categoryRepository
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.options', 'opt')
      .orderBy('cat.sort_order', 'ASC')
      .addOrderBy('cat.name', 'ASC')
      .addOrderBy('opt.sort_order', 'ASC')
      .addOrderBy('opt.label', 'ASC')

    if (activeOnly) {
      qb.where('cat.is_active = :active', { active: true })
      qb.andWhere('(opt.is_active = :active OR opt.id IS NULL)', { active: true })
    }

    return qb.getMany()
  }

  async getCategoryById(id: string): Promise<FilterCategoryModel> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['options'],
    })
    if (!category) {
      throw new NotFoundException(`Filter category with id '${id}' not found`)
    }
    return category
  }

  async createCategory(dto: CreateFilterCategoryDto): Promise<FilterCategoryModel> {
    const existing = await this.categoryRepository.findOne({ where: { code: dto.code } })
    if (existing) {
      throw new BadRequestException(`Filter category with code '${dto.code}' already exists`)
    }

    const category = this.categoryRepository.create({
      id: uuidv4(),
      code: dto.code,
      name: dto.name,
      nameEn: dto.nameEn ?? '',
      description: dto.description ?? '',
      fieldName: dto.fieldName,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      isSystem: false,
    })
    return this.categoryRepository.save(category)
  }

  async updateCategory(id: string, dto: UpdateFilterCategoryDto): Promise<FilterCategoryModel> {
    const category = await this.getCategoryById(id)
    if (dto.name !== undefined) category.name = dto.name
    if (dto.nameEn !== undefined) category.nameEn = dto.nameEn
    if (dto.description !== undefined) category.description = dto.description
    if (dto.fieldName !== undefined) category.fieldName = dto.fieldName
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder
    if (dto.isActive !== undefined) category.isActive = dto.isActive
    return this.categoryRepository.save(category)
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id)
    if (category.isSystem) {
      throw new BadRequestException('Cannot delete system filter category')
    }
    await this.optionRepository.softDelete({ filterCategoryId: id })
    await this.categoryRepository.softDelete(id)
  }

  // ========== Filter Options ==========

  async getOptionsByCategory(categoryId: string, activeOnly = false): Promise<FilterOptionModel[]> {
    const qb = this.optionRepository
      .createQueryBuilder('opt')
      .where('opt.filter_category_id = :categoryId', { categoryId })
      .orderBy('opt.sort_order', 'ASC')
      .addOrderBy('opt.label', 'ASC')

    if (activeOnly) {
      qb.andWhere('opt.is_active = :active', { active: true })
    }

    return qb.getMany()
  }

  async getOptionById(id: string): Promise<FilterOptionModel> {
    const option = await this.optionRepository.findOne({ where: { id } })
    if (!option) {
      throw new NotFoundException(`Filter option with id '${id}' not found`)
    }
    return option
  }

  async createOption(dto: CreateFilterOptionDto): Promise<FilterOptionModel> {
    await this.getCategoryById(dto.filterCategoryId)

    const existing = await this.optionRepository.findOne({
      where: { filterCategoryId: dto.filterCategoryId, value: dto.value },
    })
    if (existing) {
      throw new BadRequestException(`Filter option with value '${dto.value}' already exists in this category`)
    }

    const option = this.optionRepository.create({
      id: uuidv4(),
      filterCategoryId: dto.filterCategoryId,
      value: dto.value,
      label: dto.label,
      labelEn: dto.labelEn ?? '',
      description: dto.description ?? '',
      color: dto.color ?? '',
      icon: dto.icon ?? '',
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      isDefault: dto.isDefault ?? false,
    })
    return this.optionRepository.save(option)
  }

  async updateOption(id: string, dto: UpdateFilterOptionDto): Promise<FilterOptionModel> {
    const option = await this.getOptionById(id)
    if (dto.value !== undefined) option.value = dto.value
    if (dto.label !== undefined) option.label = dto.label
    if (dto.labelEn !== undefined) option.labelEn = dto.labelEn
    if (dto.description !== undefined) option.description = dto.description
    if (dto.color !== undefined) option.color = dto.color
    if (dto.icon !== undefined) option.icon = dto.icon
    if (dto.sortOrder !== undefined) option.sortOrder = dto.sortOrder
    if (dto.isActive !== undefined) option.isActive = dto.isActive
    if (dto.isDefault !== undefined) option.isDefault = dto.isDefault
    return this.optionRepository.save(option)
  }

  async deleteOption(id: string): Promise<void> {
    await this.getOptionById(id)
    await this.optionRepository.softDelete(id)
  }

  // ========== Initialization ==========

  async initialize(): Promise<void> {
    for (const item of DEFAULT_FILTERS) {
      const existing = await this.categoryRepository.findOne({ where: { id: item.category.id } })
      if (!existing) {
        await this.categoryRepository.save(this.categoryRepository.create(item.category))
      }

      for (const opt of item.options) {
        const existingOpt = await this.optionRepository.findOne({ where: { id: opt.id } })
        if (!existingOpt) {
          await this.optionRepository.save(this.optionRepository.create(opt))
        }
      }
    }

    this.logger.log('Initialized default filters')
  }

  // ========== Aggregated Filters ==========

  async getFilters(): Promise<FilterCategoryModel[]> {
    return this.getAllCategories(true)
  }
}
