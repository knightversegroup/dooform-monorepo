import { Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import {
  TyphoonService,
  type OcrResult,
  type FormFieldMapping,
} from '../../services/typhoon.service'
import { MapFieldsDto } from '../../dtos/map-fields.dto'

interface MapFieldsResult {
  raw_text: string
  extracted_data: OcrResult['extracted_data']
  mapped_fields: Record<string, string> | null
  field_mappings: Record<string, FormFieldMapping>
  detection_score: number
  provider: string
  message: string
}

@Injectable()
@UseClassLogger('ai')
export class MapFieldsUseCase implements UseCase<MapFieldsDto, MapFieldsResult> {
  constructor(private readonly typhoonService: TyphoonService) {}

  @UseResult()
  @ValidateInput(MapFieldsDto)
  async execute(dto: MapFieldsDto): Promise<Result<MapFieldsResult>> {
    const image = this.typhoonService.stripDataUrlPrefix(dto.image)

    const { result, fieldMappings } = await this.typhoonService.extractAndMapToForm(
      image,
      dto.placeholders,
    )

    return {
      raw_text: result.raw_text,
      extracted_data: result.extracted_data,
      mapped_fields: result.mapped_fields,
      field_mappings: fieldMappings,
      detection_score: result.detection_score,
      provider: result.provider,
      message: 'Fields mapped successfully',
    } as any
  }
}
