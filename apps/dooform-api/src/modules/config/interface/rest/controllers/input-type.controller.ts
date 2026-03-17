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
import { InputTypeService } from '../../../application/services/input-type.service'
import { CreateInputTypeDto, UpdateInputTypeDto } from '../../../application/dtos/input-type.dto'

@Controller('input-types')
export class InputTypeController {
  constructor(private readonly inputTypeService: InputTypeService) {}

  @Get()
  async getAll(@Query('active_only') activeOnly?: string) {
    return this.inputTypeService.getAll(activeOnly === 'true')
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.inputTypeService.getById(id)
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateInputTypeDto) {
    return this.inputTypeService.create(dto)
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInputTypeDto) {
    return this.inputTypeService.update(id, dto)
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.inputTypeService.delete(id)
    return { message: 'Input type deleted successfully' }
  }

  @Roles('admin')
  @Post('initialize')
  async initialize() {
    return this.inputTypeService.initialize()
  }
}
