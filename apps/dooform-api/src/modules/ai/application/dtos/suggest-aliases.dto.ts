import { IsArray, IsOptional, IsString } from 'class-validator'

export class SuggestAliasesDto {
  @IsString()
  @IsOptional()
  html_content?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  placeholders?: string[]
}
