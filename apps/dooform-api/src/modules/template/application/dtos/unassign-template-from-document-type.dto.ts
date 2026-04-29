import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UnassignTemplateFromDocumentTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentTypeId!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId!: string
}
