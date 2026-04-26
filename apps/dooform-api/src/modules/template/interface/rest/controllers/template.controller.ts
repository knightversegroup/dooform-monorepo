import { Controller, Get, Post, Param, Body, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { getResultValue } from '@dooform-api-core/shared';
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs';

import { CreateTemplateUseCase } from '../../../application/use-cases/create-template/create-template.use-case';
import { GetTemplateByIdUseCase } from '../../../application/use-cases/get-template-by-id/get-template-by-id.use-case';
import { GetAllTemplatesUseCase } from '../../../application/use-cases/get-all-templates/get-all-templates.use-case';
import { CreateTemplateDto } from '../../../application/dtos/create-template.dto';

@ApiTags('Templates')
@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class TemplateController {
  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly getTemplateByIdUseCase: GetTemplateByIdUseCase,
    private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  async createTemplate(@Body() body: CreateTemplateDto) {
    const result = await this.createTemplateUseCase.execute(body);
    return getResultValue(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  async getTemplateById(@Param('id') id: string) {
    const result = await this.getTemplateByIdUseCase.execute({ id });
    return getResultValue(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  async getAllTemplates() {
    const result = await this.getAllTemplatesUseCase.execute({});
    return getResultValue(result);
  }
}
