import { PartialType } from '@nestjs/swagger';
import { CreateDocTemplateSampleDto } from './create-doc-template-sample.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateDocTemplateSampleDto extends PartialType(CreateDocTemplateSampleDto) {
  @IsOptional()
  @IsInt()
  status?: number;
}
