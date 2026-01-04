import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AuditRule } from '../../audit-rule/entities/audit-rule.entity';
import { LawDocument } from '../../law-document/entities/law-document.entity';
import { LawClause } from '../../law-clause/entities/law-clause.entity';

@Entity('audit_rule_law_link')
@Index(['ruleId', 'lawClauseId'])
export class AuditRuleLawLink extends BaseEntity {
  @ApiProperty({ description: '所属规则ID' })
  @Column({ name: 'rule_id', type: 'bigint', unsigned: true, comment: '所属规则ID' })
  ruleId: number;

  @ApiProperty({ description: '关联法规ID' })
  @Column({ name: 'law_document_id', type: 'bigint', unsigned: true, nullable: true, comment: '关联法规ID' })
  lawDocumentId: number;

  @ApiProperty({ description: '关联条款ID' })
  @Column({ name: 'law_clause_id', type: 'bigint', unsigned: true, nullable: true, comment: '关联条款ID' })
  lawClauseId: number;

  @ApiProperty({ description: '法规编号（冗余存储）' })
  @Column({ name: 'law_code', type: 'varchar', length: 50, nullable: true, comment: '法规编号（冗余存储）' })
  lawCode: string;

  @ApiProperty({ description: '法规名称（冗余）' })
  @Column({ name: 'law_name', type: 'varchar', length: 200, nullable: true, comment: '法规名称（冗余）' })
  lawName: string;

  @ApiProperty({ description: '条款编号（冗余）' })
  @Column({ name: 'clause_no', type: 'varchar', length: 50, nullable: true, comment: '条款编号（冗余）' })
  clauseNo: string;

  @ApiProperty({ description: '引用说明' })
  @Column({ name: 'reference_description', type: 'text', nullable: true, comment: '引用说明' })
  referenceDescription: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ManyToOne(() => AuditRule, (rule) => rule.lawLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  auditRule: AuditRule;

  @ManyToOne(() => LawDocument, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'law_document_id' })
  lawDocument: LawDocument;

  @ManyToOne(() => LawClause, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'law_clause_id' })
  lawClause: LawClause;
}


