import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 操作日志表
 * 记录用户的所有操作行为
 */
@Entity('operation_log')
@Index(['userId', 'createdAt'])
@Index(['module', 'action'])
@Index(['createdAt'])
export class OperationLog {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true, comment: '操作用户ID' })
  userId?: number;

  @ApiProperty({ description: '用户名' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作用户名' })
  username?: string;

  @ApiProperty({ description: '操作模块' })
  @Column({ type: 'varchar', length: 50, comment: '操作模块（如：doc-type, audit-rule）' })
  module: string;

  @ApiProperty({ description: '操作类型' })
  @Column({ type: 'varchar', length: 20, comment: '操作类型：create, update, delete, import, export, login, logout' })
  action: string;

  @ApiProperty({ description: '目标ID' })
  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: true, comment: '操作目标的ID' })
  targetId?: number;

  @ApiProperty({ description: '目标名称' })
  @Column({ name: 'target_name', type: 'varchar', length: 200, nullable: true, comment: '操作目标的名称' })
  targetName?: string;

  @ApiProperty({ description: '操作描述' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '操作描述' })
  description?: string;

  @ApiProperty({ description: '请求参数' })
  @Column({ name: 'request_data', type: 'text', nullable: true, comment: '请求参数（JSON）' })
  requestData?: string;

  @ApiProperty({ description: '响应结果' })
  @Column({ name: 'response_data', type: 'text', nullable: true, comment: '响应结果（JSON）' })
  responseData?: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress?: string;

  @ApiProperty({ description: 'User-Agent' })
  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true, comment: 'User-Agent' })
  userAgent?: string;

  @ApiProperty({ description: '操作结果' })
  @Column({ type: 'tinyint', default: 1, comment: '操作结果：1-成功，0-失败' })
  success: number;

  @ApiProperty({ description: '错误信息' })
  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true, comment: '错误信息' })
  errorMessage?: string;

  @ApiProperty({ description: '操作时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
