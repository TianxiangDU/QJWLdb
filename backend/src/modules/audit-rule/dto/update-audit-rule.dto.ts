import { PartialType } from '@nestjs/swagger';
import { CreateAuditRuleDto } from './create-audit-rule.dto';
import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuditRuleDto extends PartialType(CreateAuditRuleDto) {
  @ApiPropertyOptional({ description: '状态：1-启用，0-停用' })
  @IsOptional()
  @IsInt()
  status?: number;
}


