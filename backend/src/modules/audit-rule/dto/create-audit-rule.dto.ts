import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateAuditRuleDto {
  @ApiProperty({ description: '规则编码', example: 'AUDIT_001' })
  @IsString()
  @MaxLength(50)
  ruleCode: string;

  @ApiProperty({ description: '规则名称', example: '合同金额与预算对比审计' })
  @IsString()
  @MaxLength(200)
  ruleName: string;

  @ApiPropertyOptional({ description: '规则分类', example: '金额审计' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ruleCategory?: string;

  @ApiPropertyOptional({ description: '规则业务说明', example: '检查施工合同金额是否超过批复预算，超过需要说明原因' })
  @IsOptional()
  @IsString()
  bizDescription?: string;

  @ApiPropertyOptional({ description: '比对方法/思路说明', example: '1.获取合同金额 2.获取批复预算 3.计算差额比例 4.超过10%则预警' })
  @IsOptional()
  @IsString()
  compareMethod?: string;

  @ApiPropertyOptional({ description: '风险等级', example: '高' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  riskLevel?: string;

  @ApiPropertyOptional({ description: '适用项目阶段', example: '招投标阶段,施工阶段' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectPhase?: string;

  @ApiPropertyOptional({ description: '适用项目类型', example: '房建工程,市政工程' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectType?: string;

  @ApiPropertyOptional({ description: '适用地区', example: '全国' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ description: '适用业主', example: '政府投资项目' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ownerOrg?: string;

  @ApiPropertyOptional({ description: '版本号', example: 1 })
  @IsOptional()
  @IsInt()
  version?: number;

  @ApiPropertyOptional({ description: '备注', example: '参考GB50500-2013标准' })
  @IsOptional()
  @IsString()
  remark?: string;
}


