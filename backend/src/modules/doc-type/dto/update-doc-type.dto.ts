import { PartialType } from '@nestjs/swagger';
import { CreateDocTypeDto } from './create-doc-type.dto';
import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocTypeDto extends PartialType(CreateDocTypeDto) {
  @ApiPropertyOptional({ description: '状态：1-启用，0-停用' })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '数据版本号（乐观锁）' })
  @IsOptional()
  @IsInt()
  rowVersion?: number;
}


