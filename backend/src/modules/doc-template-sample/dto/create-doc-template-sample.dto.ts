import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDocTemplateSampleDto {
  @ApiProperty({ description: '所属文件类型ID' })
  @IsInt()
  docTypeId: number;

  @ApiProperty({ description: '文件名称' })
  @IsString()
  @MaxLength(200)
  fileName: string;

  @ApiPropertyOptional({ description: '文件链接' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;

  @ApiPropertyOptional({ description: '说明' })
  @IsOptional()
  @IsString()
  description?: string;
}
