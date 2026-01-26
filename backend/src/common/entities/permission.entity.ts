import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 权限表
 * 定义系统中的所有权限
 */
@Entity('permission')
@Index(['code'], { unique: true })
@Index(['module'])
export class Permission {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: '权限编码' })
  @Column({ type: 'varchar', length: 100, unique: true, comment: '权限编码（如：doc-type:create）' })
  code: string;

  @ApiProperty({ description: '权限名称' })
  @Column({ type: 'varchar', length: 100, comment: '权限名称' })
  name: string;

  @ApiProperty({ description: '所属模块' })
  @Column({ type: 'varchar', length: 50, comment: '所属模块' })
  module: string;

  @ApiProperty({ description: '操作类型' })
  @Column({ type: 'varchar', length: 20, comment: '操作类型：view, create, update, delete, import, export' })
  action: string;

  @ApiProperty({ description: '权限描述' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '权限描述' })
  description: string;

  @ApiProperty({ description: '排序' })
  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @ApiProperty({ description: '状态' })
  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-停用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
