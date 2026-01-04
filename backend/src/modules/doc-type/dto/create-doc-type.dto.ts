import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDocTypeDto {
  @ApiProperty({ description: '文件类型编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '文件类型名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '所属项目阶段' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectPhase?: string;

  @ApiPropertyOptional({ description: '所属大类' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  majorCategory?: string;

  @ApiPropertyOptional({ description: '所属小类' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  minorCategory?: string;

  @ApiPropertyOptional({ description: '文件特征信息（用于LLM识别）' })
  @IsOptional()
  @IsString()
  fileFeature?: string;

  @ApiPropertyOptional({ description: '适用项目类型（逗号分隔）' })
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

  @ApiPropertyOptional({ description: '业务说明/使用场景' })
  @IsOptional()
  @IsString()
  bizDescription?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

