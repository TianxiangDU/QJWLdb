import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryAuditRuleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '规则编码' })
  @IsOptional()
  @IsString()
  ruleCode?: string;

  @ApiPropertyOptional({ description: '规则分类' })
  @IsOptional()
  @IsString()
  ruleCategory?: string;

  @ApiPropertyOptional({ description: '风险等级' })
  @IsOptional()
  @IsString()
  riskLevel?: string;

  @ApiPropertyOptional({ description: '适用项目阶段' })
  @IsOptional()
  @IsString()
  projectPhase?: string;
}


