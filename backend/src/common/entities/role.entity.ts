import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from './permission.entity';

/**
 * 角色表
 * 定义系统中的角色，角色关联多个权限
 */
@Entity('role')
export class Role {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: '角色编码' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '角色编码' })
  code: string;

  @ApiProperty({ description: '角色名称' })
  @Column({ type: 'varchar', length: 100, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '角色描述' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '角色描述' })
  description: string;

  @ApiProperty({ description: '是否内置角色' })
  @Column({ name: 'is_system', type: 'tinyint', default: 0, comment: '是否内置角色：1-是，0-否' })
  isSystem: number;

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

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
