import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 导入模式枚举
 */
export enum ImportMode {
  UPSERT = 'upsert',         // 存在则更新，不存在则新增
  INSERT_ONLY = 'insertOnly', // 只新增，重复则失败
  UPDATE_ONLY = 'updateOnly', // 只更新，不存在则失败
}

/**
 * 导入选项 DTO
 */
export class ImportOptionsDto {
  @ApiPropertyOptional({
    description: '导入模式',
    enum: ImportMode,
    default: ImportMode.UPSERT,
    example: 'upsert',
  })
  @IsOptional()
  @IsEnum(ImportMode)
  mode?: ImportMode = ImportMode.UPSERT;

  @ApiPropertyOptional({
    description: '是否只预览不落库',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  dryRun?: boolean = false;
}

/**
 * 导入结果 DTO
 */
export class ImportResultDto {
  @ApiProperty({ description: '成功条数', example: 10 })
  success: number;

  @ApiProperty({ description: '失败条数', example: 2 })
  failed: number;

  @ApiProperty({ description: '新增条数', example: 8 })
  created: number;

  @ApiProperty({ description: '更新条数', example: 2 })
  updated: number;

  @ApiProperty({ description: '跳过条数', example: 0 })
  skipped: number;

  @ApiProperty({
    description: '错误详情',
    example: [{ row: 5, field: 'code', message: '编码已存在' }],
  })
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;

  @ApiPropertyOptional({
    description: '文件内重复行',
    example: [{ row: 12, duplicateOf: 5, uniqueKey: 'code=DT-001' }],
  })
  duplicateRows?: Array<{
    row: number;
    duplicateOf: number;
    uniqueKey: string;
  }>;

  @ApiPropertyOptional({
    description: '是否为预览模式',
    example: false,
  })
  isDryRun?: boolean;
}
