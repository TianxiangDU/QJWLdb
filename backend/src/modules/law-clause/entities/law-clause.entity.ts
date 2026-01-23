import { Entity, Column, ManyToOne, JoinColumn, Index, VersionColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LawDocument } from '../../law-document/entities/law-document.entity';

@Entity('law_clause')
@Index(['lawCode', 'clauseNo'])
@Index(['lawDocumentId'])
export class LawClause extends BaseEntity {
  @ApiProperty({ description: '所属法规ID' })
  @Column({ name: 'law_document_id', type: 'bigint', unsigned: true, comment: '所属法规ID' })
  lawDocumentId: number;

  @ApiProperty({ description: '所属法规编号（冗余）' })
  @Column({ name: 'law_code', type: 'varchar', length: 50, nullable: true, comment: '所属法规编号（冗余）' })
  lawCode: string;

  @ApiProperty({ description: '所属法规名称（冗余）' })
  @Column({ name: 'law_name', type: 'varchar', length: 300, nullable: true, comment: '所属法规名称（冗余）' })
  lawName: string;

  @ApiProperty({ description: '条款编号' })
  @Column({ name: 'clause_no', type: 'varchar', length: 50, comment: '条款编号' })
  clauseNo: string;

  @ApiProperty({ description: '条款标题' })
  @Column({ name: 'clause_title', type: 'varchar', length: 300, nullable: true, comment: '条款标题' })
  clauseTitle: string;

  @ApiProperty({ description: '条款内容全文' })
  @Column({ name: 'clause_text', type: 'longtext', nullable: true, comment: '条款内容全文' })
  clauseText: string;

  @ApiProperty({ description: '条款要点提炼' })
  @Column({ name: 'clause_summary', type: 'text', nullable: true, comment: '条款要点提炼' })
  clauseSummary: string;

  @ApiProperty({ description: '层级' })
  @Column({ name: 'level_label', type: 'varchar', length: 20, nullable: true, comment: '层级（章/节/条/款）' })
  levelLabel: string;

  @ApiProperty({ description: '上级条款编号' })
  @Column({ name: 'parent_clause_no', type: 'varchar', length: 50, nullable: true, comment: '上级条款编号' })
  parentClauseNo: string;

  @ApiProperty({ description: '关键词' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '关键词（字符串）' })
  keywords: string;

  @ApiProperty({ description: '主题标签' })
  @Column({ name: 'topic_tags', type: 'varchar', length: 500, nullable: true, comment: '主题标签' })
  topicTags: string;

  @ApiProperty({ description: '适用地区范围' })
  @Column({ name: 'region_scope', type: 'varchar', length: 200, nullable: true, comment: '适用地区范围' })
  regionScope: string;

  @ApiProperty({ description: '适用行业范围' })
  @Column({ name: 'industry_scope', type: 'varchar', length: 200, nullable: true, comment: '适用行业范围' })
  industryScope: string;

  @ApiProperty({ description: '重要程度' })
  @Column({ name: 'importance_level', type: 'varchar', length: 20, nullable: true, comment: '重要程度' })
  importanceLevel: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ApiProperty({ description: '数据版本号（乐观锁）', example: 1 })
  @VersionColumn({ name: 'row_version', default: 1 })
  rowVersion: number;

  @ManyToOne(() => LawDocument, (doc) => doc.clauses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'law_document_id' })
  lawDocument: LawDocument;
}
