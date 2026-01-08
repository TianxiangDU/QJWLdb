import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDocFieldDefDto {
  @ApiProperty({ description: '所属文件类型ID' })
  @IsInt()
  docTypeId: number;

  @ApiProperty({ description: '字段编码' })
  @IsString()
  @MaxLength(50)
  fieldCode: string;

  @ApiProperty({ description: '字段名称' })
  @IsString()
  @MaxLength(100)
  fieldName: string;

  @ApiPropertyOptional({ description: '字段类别' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fieldCategory?: string;

  @ApiPropertyOptional({ description: '是否必填：1-是，0-否' })
  @IsOptional()
  @IsInt()
  requiredFlag?: number;

  @ApiPropertyOptional({ description: '取值方式（在文件中的位置）' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  valueSource?: string;

  @ApiPropertyOptional({ description: '枚举值（当字段类别为枚举时填写）' })
  @IsOptional()
  @IsString()
  enumOptions?: string;

  @ApiPropertyOptional({ description: '示例数据' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  exampleValue?: string;

  @ApiPropertyOptional({ description: '字段说明' })
  @IsOptional()
  @IsString()
  fieldDescription?: string;

  @ApiPropertyOptional({ description: '定位词' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  anchorWord?: string;
}
