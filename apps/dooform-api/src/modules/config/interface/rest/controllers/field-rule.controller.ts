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
import { FieldRuleService } from '../../../application/services/field-rule.service'
import {
  CreateFieldRuleDto,
  UpdateFieldRuleDto,
  TestFieldRuleDto,
  GenerateFieldDefinitionsDto,
} from '../../../application/dtos/field-rule.dto'

@Controller('field-rules')
export class FieldRuleController {
  constructor(private readonly fieldRuleService: FieldRuleService) {}

  @Get()
  async getAll() {
    return this.fieldRuleService.getAllIncludingInactive()
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.fieldRuleService.getById(id)
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateFieldRuleDto) {
    return this.fieldRuleService.create(dto)
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFieldRuleDto) {
    return this.fieldRuleService.update(id, dto)
  }

  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.fieldRuleService.delete(id)
    return { message: 'Field rule deleted successfully' }
  }

  @Post('test')
  async testRule(@Body() dto: TestFieldRuleDto) {
    return this.fieldRuleService.testRule(dto.pattern, dto.testString)
  }

  @Roles('admin')
  @Post('initialize')
  async initialize() {
    return this.fieldRuleService.initialize()
  }

  @Post('generate')
  async generateFieldDefinitions(@Body() dto: GenerateFieldDefinitionsDto) {
    const fieldDefinitions = await this.fieldRuleService.generateFieldDefinitions(dto.placeholders)
    return { fieldDefinitions }
  }
}
