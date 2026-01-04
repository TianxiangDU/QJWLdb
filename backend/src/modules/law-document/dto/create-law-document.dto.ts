import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateLawDocumentDto {
  @ApiProperty({ description: '法规编号' })
  @IsString()
  @MaxLength(50)
  lawCode: string;

  @ApiProperty({ description: '法规名称' })
  @IsString()
  @MaxLength(300)
  lawName: string;

  @ApiPropertyOptional({ description: '文种类别' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lawCategory?: string;

  @ApiPropertyOptional({ description: '发布单位' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issueOrg?: string;

  @ApiPropertyOptional({ description: '发布日期' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ description: '实施日期' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: '失效日期' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '适用地区范围' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  regionScope?: string;

  @ApiPropertyOptional({ description: '适用行业范围' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  industryScope?: string;

  @ApiPropertyOptional({ description: '当前状态' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  lawStatus?: string;

  @ApiPropertyOptional({ description: '原文文件位置' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;

  @ApiPropertyOptional({ description: '摘要/要点说明' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}


