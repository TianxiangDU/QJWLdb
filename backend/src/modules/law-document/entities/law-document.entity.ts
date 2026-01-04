import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LawClause } from '../../law-clause/entities/law-clause.entity';

@Entity('law_document')
export class LawDocument extends BaseEntity {
  @ApiProperty({ description: '法规编号' })
  @Column({ name: 'law_code', type: 'varchar', length: 50, unique: true, comment: '法规编号' })
  lawCode: string;

  @ApiProperty({ description: '法规名称' })
  @Column({ name: 'law_name', type: 'varchar', length: 300, comment: '法规名称' })
  lawName: string;

  @ApiProperty({ description: '文种类别' })
  @Column({ name: 'law_category', type: 'varchar', length: 50, nullable: true, comment: '文种类别' })
  lawCategory: string;

  @ApiProperty({ description: '发布单位' })
  @Column({ name: 'issue_org', type: 'varchar', length: 200, nullable: true, comment: '发布单位' })
  issueOrg: string;

  @ApiProperty({ description: '发布日期' })
  @Column({ name: 'issue_date', type: 'date', nullable: true, comment: '发布日期' })
  issueDate: Date;

  @ApiProperty({ description: '实施日期' })
  @Column({ name: 'effective_date', type: 'date', nullable: true, comment: '实施日期' })
  effectiveDate: Date;

  @ApiProperty({ description: '失效日期' })
  @Column({ name: 'expiry_date', type: 'date', nullable: true, comment: '失效日期' })
  expiryDate: Date;

  @ApiProperty({ description: '适用地区范围' })
  @Column({ name: 'region_scope', type: 'varchar', length: 200, nullable: true, comment: '适用地区范围' })
  regionScope: string;

  @ApiProperty({ description: '适用行业范围' })
  @Column({ name: 'industry_scope', type: 'varchar', length: 200, nullable: true, comment: '适用行业范围' })
  industryScope: string;

  @ApiProperty({ description: '当前状态' })
  @Column({ name: 'law_status', type: 'varchar', length: 20, default: '有效', comment: '当前状态' })
  lawStatus: string;

  @ApiProperty({ description: '原文文件位置' })
  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true, comment: '原文文件位置' })
  filePath: string;

  @ApiProperty({ description: '摘要/要点说明' })
  @Column({ type: 'text', nullable: true, comment: '摘要/要点说明' })
  summary: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => LawClause, (clause) => clause.lawDocument)
  clauses: LawClause[];
}


