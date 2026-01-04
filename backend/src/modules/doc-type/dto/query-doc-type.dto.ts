import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDocTypeDto extends PaginationDto {
  @ApiPropertyOptional({ description: '文件类型编码' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '所属项目阶段' })
  @IsOptional()
  @IsString()
  projectPhase?: string;

  @ApiPropertyOptional({ description: '适用项目类型' })
  @IsOptional()
  @IsString()
  projectType?: string;
}


