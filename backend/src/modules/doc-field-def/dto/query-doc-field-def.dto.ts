import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDocFieldDefDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '文件类型ID（支持多选，逗号分隔）' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    }
    return value;
  })
  @IsArray()
  docTypeIds?: number[];

  @ApiPropertyOptional({ description: '字段编码' })
  @IsOptional()
  @IsString()
  fieldCode?: string;

  @ApiPropertyOptional({ description: '字段类别' })
  @IsOptional()
  @IsString()
  fieldCategory?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
