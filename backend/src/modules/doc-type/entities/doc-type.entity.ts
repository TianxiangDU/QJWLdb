import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DocFieldDef } from '../../doc-field-def/entities/doc-field-def.entity';
import { DocTemplateSample } from '../../doc-template-sample/entities/doc-template-sample.entity';

@Entity('doc_type')
@Index(['projectPhase', 'projectType'])
export class DocType extends BaseEntity {
  @ApiProperty({ description: '文件类型编码' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '文件类型编码' })
  code: string;

  @ApiProperty({ description: '文件类型名称' })
  @Column({ type: 'varchar', length: 100, comment: '文件类型名称' })
  name: string;

  @ApiProperty({ description: '所属项目阶段' })
  @Column({ name: 'project_phase', type: 'varchar', length: 50, nullable: true, comment: '所属项目阶段' })
  projectPhase: string;

  @ApiProperty({ description: '所属大类' })
  @Column({ name: 'major_category', type: 'varchar', length: 100, nullable: true, comment: '所属大类' })
  majorCategory: string;

  @ApiProperty({ description: '所属小类' })
  @Column({ name: 'minor_category', type: 'varchar', length: 100, nullable: true, comment: '所属小类' })
  minorCategory: string;

  @ApiProperty({ description: '文件特征信息（用于LLM识别）' })
  @Column({ name: 'file_feature', type: 'text', nullable: true, comment: '文件特征信息，用于LLM识别' })
  fileFeature: string;

  @ApiProperty({ description: '适用项目类型' })
  @Column({ name: 'project_type', type: 'varchar', length: 200, nullable: true, comment: '适用项目类型（逗号分隔）' })
  projectType: string;

  @ApiProperty({ description: '适用地区' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '适用地区' })
  region: string;

  @ApiProperty({ description: '适用业主' })
  @Column({ name: 'owner_org', type: 'varchar', length: 200, nullable: true, comment: '适用业主' })
  ownerOrg: string;

  @ApiProperty({ description: '业务说明/使用场景' })
  @Column({ name: 'biz_description', type: 'text', nullable: true, comment: '业务说明/使用场景' })
  bizDescription: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => DocFieldDef, (field) => field.docType)
  fields: DocFieldDef[];

  @OneToMany(() => DocTemplateSample, (template) => template.docType)
  templates: DocTemplateSample[];
}
