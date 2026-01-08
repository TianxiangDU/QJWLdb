import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDocTypeDto {
  @ApiProperty({ description: '文件类型编码', example: 'CONTRACT_001' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '文件类型名称', example: '施工合同' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '所属项目阶段', example: '招投标阶段' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectPhase?: string;

  @ApiPropertyOptional({ description: '所属大类', example: '合同类' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  majorCategory?: string;

  @ApiPropertyOptional({ description: '所属小类', example: '施工合同' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  minorCategory?: string;

  @ApiPropertyOptional({ description: '文件特征信息（用于LLM识别）', example: '包含甲方乙方信息、合同金额、工期等关键条款' })
  @IsOptional()
  @IsString()
  fileFeature?: string;

  @ApiPropertyOptional({ description: '适用项目类型（逗号分隔）', example: '房建工程,市政工程' })
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

  @ApiPropertyOptional({ description: '业务说明/使用场景', example: '用于审计施工合同的合规性和金额准确性' })
  @IsOptional()
  @IsString()
  bizDescription?: string;

  @ApiPropertyOptional({ description: '备注', example: '需要关注合同变更情况' })
  @IsOptional()
  @IsString()
  remark?: string;
}

