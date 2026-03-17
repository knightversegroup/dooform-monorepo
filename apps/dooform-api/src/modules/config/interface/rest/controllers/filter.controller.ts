import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common'

import { Roles } from '../../../../../common/decorators/roles.decorator'
import { FilterService } from '../../../application/services/filter.service'
import {
  CreateFilterCategoryDto,
  UpdateFilterCategoryDto,
  CreateFilterOptionDto,
  UpdateFilterOptionDto,
} from '../../../application/dtos/filter.dto'

@Controller('filters')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get()
  async getFilters() {
    return this.filterService.getFilters()
  }

  @Roles('admin')
  @Post('initialize')
  async initialize() {
    await this.filterService.initialize()
    return { message: 'Default filters initialized successfully' }
  }

  // ========== Categories ==========

  @Get('categories')
  async getAllCategories(@Query('active_only') activeOnly?: string) {
    return this.filterService.getAllCategories(activeOnly === 'true')
  }

  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.filterService.getCategoryById(id)
  }

  @Roles('admin')
  @Post('categories')
  async createCategory(@Body() dto: CreateFilterCategoryDto) {
    return this.filterService.createCategory(dto)
  }

  @Roles('admin')
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateFilterCategoryDto) {
    return this.filterService.updateCategory(id, dto)
  }

  @Roles('admin')
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.filterService.deleteCategory(id)
    return { message: 'Filter category deleted successfully' }
  }

  @Get('categories/:id/options')
  async getOptionsByCategory(
    @Param('id') id: string,
    @Query('active_only') activeOnly?: string,
  ) {
    return this.filterService.getOptionsByCategory(id, activeOnly === 'true')
  }

  // ========== Options ==========

  @Get('options/:id')
  async getOptionById(@Param('id') id: string) {
    return this.filterService.getOptionById(id)
  }

  @Roles('admin')
  @Post('options')
  async createOption(@Body() dto: CreateFilterOptionDto) {
    return this.filterService.createOption(dto)
  }

  @Roles('admin')
  @Put('options/:id')
  async updateOption(@Param('id') id: string, @Body() dto: UpdateFilterOptionDto) {
    return this.filterService.updateOption(id, dto)
  }

  @Roles('admin')
  @Delete('options/:id')
  async deleteOption(@Param('id') id: string) {
    await this.filterService.deleteOption(id)
    return { message: 'Filter option deleted successfully' }
  }
}
