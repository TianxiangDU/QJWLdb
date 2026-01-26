import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 文件资产表
 * 用于文件去重存储
 */
@Entity('file_asset')
export class FileAsset {
  @ApiProperty({ description: '文件ID' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  /**
   * 文件内容 SHA256 哈希值（用于去重）
   */
  @ApiProperty({ description: '文件SHA256哈希' })
  @Column({ type: 'varchar', length: 64, unique: true })
  sha256: string;

  /**
   * 原始文件名
   */
  @ApiProperty({ description: '原始文件名' })
  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  /**
   * 文件大小（字节）
   */
  @ApiProperty({ description: '文件大小（字节）' })
  @Column({ type: 'bigint' })
  size: number;

  /**
   * MIME 类型
   */
  @ApiProperty({ description: 'MIME类型' })
  @Column({ type: 'varchar', length: 100 })
  mime: string;

  /**
   * 存储路径
   */
  @ApiProperty({ description: '存储路径' })
  @Column({ name: 'storage_path', type: 'varchar', length: 500 })
  storagePath: string;

  /**
   * 创建时间
   */
  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
