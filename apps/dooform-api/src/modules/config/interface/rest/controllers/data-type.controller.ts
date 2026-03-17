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
import { DataTypeService } from '../../../application/services/data-type.service'
import { CreateDataTypeDto, UpdateDataTypeDto } from '../../../application/dtos/data-type.dto'

@Controller('data-types')
export class DataTypeController {
  constructor(private readonly dataTypeService: DataTypeService) {}

  @Get()
  async getAll(@Query('active_only') activeOnly?: string) {
    return this.dataTypeService.getAll(activeOnly === 'true')
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.dataTypeService.getById(id)
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateDataTypeDto) {
    return this.dataTypeService.create(dto)
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDataTypeDto) {
    return this.dataTypeService.update(id, dto)
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.dataTypeService.delete(id)
    return { message: 'Data type deleted successfully' }
  }

  @Roles('admin')
  @Post('initialize')
  async initialize() {
    return this.dataTypeService.initialize()
  }
}
