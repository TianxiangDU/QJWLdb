import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryAuditRuleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '审计类型' })
  @IsOptional()
  @IsString()
  auditType?: string;

  @ApiPropertyOptional({ description: '阶段' })
  @IsOptional()
  @IsString()
  phase?: string;

  @ApiPropertyOptional({ description: '查证板块' })
  @IsOptional()
  @IsString()
  verifySection?: string;
}
