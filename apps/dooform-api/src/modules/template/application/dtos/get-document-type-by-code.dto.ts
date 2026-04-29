import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GetDocumentTypeByCodeDto {
  @ApiProperty({ example: 'passport' })
  @IsString()
  @IsNotEmpty()
  code!: string
}
