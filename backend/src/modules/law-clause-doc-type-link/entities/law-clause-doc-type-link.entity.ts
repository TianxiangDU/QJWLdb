import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LawClause } from '../../law-clause/entities/law-clause.entity';
import { LawDocument } from '../../law-document/entities/law-document.entity';
import { DocType } from '../../doc-type/entities/doc-type.entity';

@Entity('law_clause_doc_type_link')
@Index(['lawClauseId', 'docTypeId'])
export class LawClauseDocTypeLink extends BaseEntity {
  @ApiProperty({ description: '条款ID' })
  @Column({ name: 'law_clause_id', type: 'bigint', unsigned: true, comment: '条款ID' })
  lawClauseId: number;

  @ApiProperty({ description: '法规ID' })
  @Column({ name: 'law_document_id', type: 'bigint', unsigned: true, nullable: true, comment: '法规ID' })
  lawDocumentId: number;

  @ApiProperty({ description: '法规编号（冗余）' })
  @Column({ name: 'law_code', type: 'varchar', length: 50, nullable: true, comment: '法规编号（冗余）' })
  lawCode: string;

  @ApiProperty({ description: '法规名称（冗余）' })
  @Column({ name: 'law_name', type: 'varchar', length: 300, nullable: true, comment: '法规名称（冗余）' })
  lawName: string;

  @ApiProperty({ description: '文件类型ID' })
  @Column({ name: 'doc_type_id', type: 'bigint', unsigned: true, comment: '文件类型ID' })
  docTypeId: number;

  @ApiProperty({ description: '文件类型名称（冗余）' })
  @Column({ name: 'doc_type_name', type: 'varchar', length: 100, nullable: true, comment: '文件类型名称（冗余）' })
  docTypeName: string;

  @ApiProperty({ description: '适用说明' })
  @Column({ name: 'applicability_description', type: 'text', nullable: true, comment: '适用说明' })
  applicabilityDescription: string;

  @ApiProperty({ description: '适用程度' })
  @Column({ name: 'applicability_level', type: 'varchar', length: 20, nullable: true, comment: '适用程度' })
  applicabilityLevel: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ManyToOne(() => LawClause, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'law_clause_id' })
  lawClause: LawClause;

  @ManyToOne(() => LawDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'law_document_id' })
  lawDocument: LawDocument;

  @ManyToOne(() => DocType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_type_id' })
  docType: DocType;
}


