import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class DownloadDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @IsString()
  @IsOptional()
  @IsIn(['docx', 'pdf'])
  format?: string

  @IsString()
  @IsOptional()
  userId?: string
}
