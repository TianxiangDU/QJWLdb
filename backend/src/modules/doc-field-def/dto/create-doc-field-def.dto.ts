import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDocFieldDefDto {
  @ApiProperty({ description: '所属文件类型ID', example: 1 })
  @IsInt()
  docTypeId: number;

  @ApiProperty({ description: '字段编码', example: 'CONTRACT_AMOUNT' })
  @IsString()
  @MaxLength(50)
  fieldCode: string;

  @ApiProperty({ description: '字段名称', example: '合同金额' })
  @IsString()
  @MaxLength(100)
  fieldName: string;

  @ApiPropertyOptional({ description: '字段类别', example: '金额' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fieldCategory?: string;

  @ApiPropertyOptional({ description: '是否必填：1-是，0-否', example: 1 })
  @IsOptional()
  @IsInt()
  requiredFlag?: number;

  @ApiPropertyOptional({ description: '取值方式（在文件中的位置）', example: '正文第三条第2款' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  valueSource?: string;

  @ApiPropertyOptional({ description: '枚举值（当字段类别为枚举时填写）', example: '是,否,待定' })
  @IsOptional()
  @IsString()
  enumOptions?: string;

  @ApiPropertyOptional({ description: '示例数据', example: '1000000.00' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  exampleValue?: string;

  @ApiPropertyOptional({ description: '字段说明', example: '施工合同的总金额，不含变更金额' })
  @IsOptional()
  @IsString()
  fieldDescription?: string;

  @ApiPropertyOptional({ description: '定位词', example: '合同价款,合同金额,总价' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  anchorWord?: string;
}
