import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateLawDocumentDto {
  @ApiProperty({ description: '法规编号', example: 'GB50500-2013' })
  @IsString()
  @MaxLength(50)
  lawCode: string;

  @ApiProperty({ description: '法规名称', example: '建设工程工程量清单计价规范' })
  @IsString()
  @MaxLength(300)
  lawName: string;

  @ApiPropertyOptional({ description: '文种类别', example: '国家标准' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lawCategory?: string;

  @ApiPropertyOptional({ description: '发布单位', example: '住房和城乡建设部' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issueOrg?: string;

  @ApiPropertyOptional({ description: '发布日期', example: '2013-04-01' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ description: '实施日期', example: '2013-07-01' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: '失效日期', example: null })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '适用地区范围', example: '全国' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  regionScope?: string;

  @ApiPropertyOptional({ description: '适用行业范围', example: '建设工程' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  industryScope?: string;

  @ApiPropertyOptional({ description: '当前状态', example: '现行' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  lawStatus?: string;

  @ApiPropertyOptional({ description: '原文文件位置', example: '/uploads/laws/GB50500-2013.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;

  @ApiPropertyOptional({ description: '摘要/要点说明', example: '规定了建设工程工程量清单的编制方法和计价规则' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '备注', example: '替代GB50500-2008' })
  @IsOptional()
  @IsString()
  remark?: string;
}


