import { PartialType } from '@nestjs/swagger';
import { CreateDocFieldDefDto } from './create-doc-field-def.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateDocFieldDefDto extends PartialType(CreateDocFieldDefDto) {
  @IsOptional()
  @IsInt()
  status?: number;
}
