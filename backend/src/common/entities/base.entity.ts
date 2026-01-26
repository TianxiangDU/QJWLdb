import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 基础实体类
 * 所有业务实体都应继承此类
 */
export abstract class BaseEntity {
  @ApiProperty({ description: '主键ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: '状态：1-启用，0-停用', example: 1 })
  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-停用' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * 带编码的基础实体类
 * 支持自动编码、唯一编码和乐观锁
 */
export abstract class CodedBaseEntity extends BaseEntity {
  @ApiPropertyOptional({
    description: '唯一编码（留空自动生成）',
    example: 'DT-202601-000001',
  })
  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '唯一编码',
  })
  @Index({ unique: true })
  code: string;

  @ApiProperty({ description: '数据版本号（乐观锁）', example: 1 })
  @VersionColumn({ name: 'row_version', default: 1 })
  rowVersion: number;
}

/**
 * 子资源基础实体类
 * 用于有父级关联的资源
 */
export abstract class ChildCodedBaseEntity extends BaseEntity {
  @ApiPropertyOptional({
    description: '唯一编码（留空自动生成）',
    example: 'DT-202601-000001-FD-0001',
  })
  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    comment: '唯一编码',
  })
  code: string;

  @ApiProperty({ description: '数据版本号（乐观锁）', example: 1 })
  @VersionColumn({ name: 'row_version', default: 1 })
  rowVersion: number;
}