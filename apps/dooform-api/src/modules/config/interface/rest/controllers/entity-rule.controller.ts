import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common'

import { Roles } from '../../../../../common/decorators/roles.decorator'
import { EntityRuleService } from '../../../application/services/entity-rule.service'
import {
  CreateEntityRuleDto,
  UpdateEntityRuleDto,
  DetectEntityDto,
} from '../../../application/dtos/entity-rule.dto'

@Controller('entity-rules')
export class EntityRuleController {
  constructor(private readonly entityRuleService: EntityRuleService) {}

  @Get()
  async getAll() {
    return this.entityRuleService.getAllIncludingInactive()
  }

  @Get('labels')
  async getLabels() {
    const labels = await this.entityRuleService.getEntityLabels()
    return { labels }
  }

  @Get('colors')
  async getColors() {
    const colors = await this.entityRuleService.getEntityColors()
    return { colors }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.entityRuleService.getById(id)
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateEntityRuleDto) {
    return this.entityRuleService.create(dto)
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEntityRuleDto) {
    return this.entityRuleService.update(id, dto)
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.entityRuleService.delete(id)
    return { message: 'Entity rule deleted successfully' }
  }

  @Roles('admin')
  @Post('initialize')
  async initialize() {
    return this.entityRuleService.initialize()
  }

  @Post('detect')
  async detectEntity(@Body() dto: DetectEntityDto) {
    const entity = await this.entityRuleService.detectEntity(dto.key)
    return { key: dto.key, entity }
  }
}
