import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateAuditRuleDto {
  @ApiPropertyOptional({ description: '规则编码（留空自动生成）' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ruleCode?: string;

  @ApiProperty({ description: '规则名称' })
  @IsString()
  @MaxLength(200)
  ruleName: string;

  // ===== 三个枚举字段（用于自动编码） =====
  @ApiPropertyOptional({ description: '审计类型' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  auditType?: string;

  @ApiPropertyOptional({ description: '阶段' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phase?: string;

  @ApiPropertyOptional({ description: '查证板块' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  verifySection?: string;

  // ===== 字符串字段 =====
  @ApiPropertyOptional({ description: '问题描述' })
  @IsOptional()
  @IsString()
  problemDesc?: string;

  @ApiPropertyOptional({ description: '比对方式' })
  @IsOptional()
  @IsString()
  compareMethod?: string;

  @ApiPropertyOptional({ description: '比对方式-LLM用' })
  @IsOptional()
  @IsString()
  compareMethodLlm?: string;

  @ApiPropertyOptional({ description: '审计依据内容' })
  @IsOptional()
  @IsString()
  auditBasis?: string;

  // ===== 5个数据源 =====
  @ApiPropertyOptional({ description: '数据源1编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source1Code?: string;

  @ApiPropertyOptional({ description: '数据源1名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source1Name?: string;

  @ApiPropertyOptional({ description: '数据源2编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source2Code?: string;

  @ApiPropertyOptional({ description: '数据源2名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source2Name?: string;

  @ApiPropertyOptional({ description: '数据源3编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source3Code?: string;

  @ApiPropertyOptional({ description: '数据源3名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source3Name?: string;

  @ApiPropertyOptional({ description: '数据源4编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source4Code?: string;

  @ApiPropertyOptional({ description: '数据源4名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source4Name?: string;

  @ApiPropertyOptional({ description: '数据源5编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source5Code?: string;

  @ApiPropertyOptional({ description: '数据源5名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source5Name?: string;

  // ===== 法规关联 =====
  @ApiPropertyOptional({ description: '法条编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lawClauseCode?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
