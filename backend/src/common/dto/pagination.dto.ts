import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '关键词搜索', example: '合同' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态：1-启用，0-停用', enum: [0, 1], example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

export class PaginationResultDto<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class BatchIdsDto {
  @ApiProperty({ description: '要操作的ID列表', example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}


