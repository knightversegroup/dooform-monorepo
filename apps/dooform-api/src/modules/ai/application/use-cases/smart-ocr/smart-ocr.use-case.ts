import { Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import {
  TyphoonService,
  type OcrResult,
  type FormFieldMapping,
} from '../../services/typhoon.service'
import { SmartOcrDto } from '../../dtos/smart-ocr.dto'

interface SmartOcrResult {
  raw_text: string
  extracted_data: OcrResult['extracted_data']
  mapped_fields: Record<string, string> | null
  field_mappings: Record<string, FormFieldMapping>
  detection_score: number
  document_type: string | null
  provider: string
  message: string
}

@Injectable()
@UseClassLogger('ai')
export class SmartOcrUseCase implements UseCase<SmartOcrDto, SmartOcrResult> {
  constructor(private readonly typhoonService: TyphoonService) {}

  @UseResult()
  @ValidateInput(SmartOcrDto)
  async execute(dto: SmartOcrDto): Promise<Result<SmartOcrResult>> {
    const image = this.typhoonService.stripDataUrlPrefix(dto.image)
    const placeholders = dto.placeholders ?? []

    const { result, fieldMappings } = await this.typhoonService.extractAndMapToForm(
      image,
      placeholders,
    )

    return {
      raw_text: result.raw_text,
      extracted_data: result.extracted_data,
      mapped_fields: result.mapped_fields,
      field_mappings: fieldMappings,
      detection_score: result.detection_score,
      document_type: result.extracted_data?.document_type ?? null,
      provider: result.provider,
      message: 'OCR extraction completed successfully',
    } as any
  }
}
