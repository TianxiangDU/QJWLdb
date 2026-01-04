import { PartialType } from '@nestjs/swagger';
import { CreateLawDocumentDto } from './create-law-document.dto';
import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLawDocumentDto extends PartialType(CreateLawDocumentDto) {
  @ApiPropertyOptional({ description: '状态：1-启用，0-停用' })
  @IsOptional()
  @IsInt()
  status?: number;
}


