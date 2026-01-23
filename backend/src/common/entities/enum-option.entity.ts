import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 枚举选项表
 * 用于存储各种动态枚举值，支持前端选择时新增
 */
@Entity('enum_option')
@Index(['category', 'parentValue'])
@Index(['category', 'value'], { unique: true })
export class EnumOption {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /**
   * 枚举分类
   * 如：projectPhase, majorCategory, minorCategory, region, ownerOrg
   */
  @ApiProperty({ description: '枚举分类', example: 'projectPhase' })
  @Column({ type: 'varchar', length: 50, comment: '枚举分类' })
  category: string;

  /**
   * 枚举值
   */
  @ApiProperty({ description: '枚举值', example: '招投标阶段' })
  @Column({ type: 'varchar', length: 100, comment: '枚举值' })
  value: string;

  /**
   * 显示标签（可选，默认等于 value）
   */
  @ApiProperty({ description: '显示标签' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '显示标签' })
  label: string;

  /**
   * 缩写编码（用于生成文件类型编码，如 QQ=前期准备阶段）
   */
  @ApiProperty({ description: '缩写编码' })
  @Column({ name: 'short_code', type: 'varchar', length: 10, nullable: true, comment: '缩写编码' })
  shortCode: string;

  /**
   * 父级值（用于级联，如小类的父级是大类的值）
   */
  @ApiProperty({ description: '父级值（用于级联）' })
  @Column({ name: 'parent_value', type: 'varchar', length: 100, nullable: true, comment: '父级值' })
  parentValue: string;

  /**
   * 排序顺序
   */
  @ApiProperty({ description: '排序顺序' })
  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序顺序' })
  sortOrder: number;

  /**
   * 状态：1-启用，0-停用
   */
  @ApiProperty({ description: '状态' })
  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-停用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
