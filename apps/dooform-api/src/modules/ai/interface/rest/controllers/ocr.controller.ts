import { Controller, Post, Body, Param, UseFilters } from '@nestjs/common'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { ExtractTextUseCase } from '../../../application/use-cases/extract-text/extract-text.use-case'
import { SmartOcrUseCase } from '../../../application/use-cases/smart-ocr/smart-ocr.use-case'
import { MapFieldsUseCase } from '../../../application/use-cases/map-fields/map-fields.use-case'
import type { ExtractTextDto } from '../../../application/dtos/extract-text.dto'
import type { SmartOcrDto } from '../../../application/dtos/smart-ocr.dto'
import type { MapFieldsDto } from '../../../application/dtos/map-fields.dto'

@Controller('ocr')
@UseFilters(HttpResultExceptionFilter)
export class OcrController {
  constructor(
    private readonly extractTextUseCase: ExtractTextUseCase,
    private readonly smartOcrUseCase: SmartOcrUseCase,
    private readonly mapFieldsUseCase: MapFieldsUseCase,
  ) {}

  @Post('extract')
  async extractText(@Body() body: ExtractTextDto) {
    const result = await this.extractTextUseCase.execute(body)
    return getResultValue(result)
  }

  @Post('typhoon')
  async extractWithTyphoon(@Body() body: ExtractTextDto) {
    const result = await this.extractTextUseCase.execute(body)
    return getResultValue(result)
  }

  @Post('smart')
  async smartOcr(@Body() body: SmartOcrDto) {
    const result = await this.smartOcrUseCase.execute(body)
    return getResultValue(result)
  }

  @Post('map-fields')
  async mapFields(@Body() body: MapFieldsDto) {
    const result = await this.mapFieldsUseCase.execute(body)
    return getResultValue(result)
  }
}

@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class TemplateOcrController {
  constructor(private readonly smartOcrUseCase: SmartOcrUseCase) {}

  @Post(':id/ocr')
  async templateOcr(@Param('id') id: string, @Body() body: SmartOcrDto) {
    const result = await this.smartOcrUseCase.execute({
      ...body,
      template_id: id,
    })
    return getResultValue(result)
  }
}
