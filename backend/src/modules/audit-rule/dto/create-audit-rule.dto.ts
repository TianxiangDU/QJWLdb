import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateAuditRuleDto {
  @ApiProperty({ description: '规则编码' })
  @IsString()
  @MaxLength(50)
  ruleCode: string;

  @ApiProperty({ description: '规则名称' })
  @IsString()
  @MaxLength(200)
  ruleName: string;

  @ApiPropertyOptional({ description: '规则分类' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ruleCategory?: string;

  @ApiPropertyOptional({ description: '规则业务说明' })
  @IsOptional()
  @IsString()
  bizDescription?: string;

  @ApiPropertyOptional({ description: '比对方法/思路说明' })
  @IsOptional()
  @IsString()
  compareMethod?: string;

  @ApiPropertyOptional({ description: '风险等级' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  riskLevel?: string;

  @ApiPropertyOptional({ description: '适用项目阶段' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectPhase?: string;

  @ApiPropertyOptional({ description: '适用项目类型' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectType?: string;

  @ApiPropertyOptional({ description: '适用地区' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ description: '适用业主' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ownerOrg?: string;

  @ApiPropertyOptional({ description: '版本号' })
  @IsOptional()
  @IsInt()
  version?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}


