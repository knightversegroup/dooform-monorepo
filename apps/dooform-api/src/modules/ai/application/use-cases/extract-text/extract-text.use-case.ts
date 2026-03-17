import { Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { TyphoonService, type OcrResult } from '../../services/typhoon.service'
import { ExtractTextDto } from '../../dtos/extract-text.dto'

interface ExtractTextResult {
  raw_text: string
  extracted_data: OcrResult['extracted_data']
  detection_score: number
  provider: string
  document_type: string | null
  message: string
}

@Injectable()
@UseClassLogger('ai')
export class ExtractTextUseCase implements UseCase<ExtractTextDto, ExtractTextResult> {
  constructor(private readonly typhoonService: TyphoonService) {}

  @UseResult()
  @ValidateInput(ExtractTextDto)
  async execute(dto: ExtractTextDto): Promise<Result<ExtractTextResult>> {
    const image = this.typhoonService.stripDataUrlPrefix(dto.image)
    const result = await this.typhoonService.extractTextFromImage(image)

    return {
      raw_text: result.raw_text,
      extracted_data: result.extracted_data,
      detection_score: result.detection_score,
      provider: result.provider,
      document_type: result.extracted_data?.document_type ?? null,
      message: 'Text extracted successfully',
    } as any
  }
}
