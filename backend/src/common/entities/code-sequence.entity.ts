import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * 编码序列表
 * 用于生成全局唯一的自动编码
 */
@Entity('code_sequence')
export class CodeSequence {
  /**
   * 作用域
   * 格式：{resourceType}:{YYYYMM} 或 {resourceType}:{parentCode}
   * 例如：docType:202601, docFieldDef:DT-202601-000123
   */
  @PrimaryColumn({ type: 'varchar', length: 128 })
  scope: string;

  /**
   * 下一个序列号
   */
  @Column({ name: 'next_seq', type: 'int', default: 1 })
  nextSeq: number;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
