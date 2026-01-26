import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DocType } from '../../doc-type/entities/doc-type.entity';

@Entity('doc_template_sample')
@Index(['docTypeId'])
export class DocTemplateSample extends BaseEntity {
  @ApiProperty({ description: '编码' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '编码（文件类型编码-A/B/C...）' })
  code: string;

  @ApiProperty({ description: '所属文件类型ID' })
  @Column({ name: 'doc_type_id', type: 'bigint', unsigned: true, comment: '所属文件类型ID' })
  docTypeId: number;

  @ApiProperty({ description: '名称' })
  @Column({ type: 'varchar', length: 200, comment: '名称' })
  name: string;

  @ApiProperty({ description: '示例文件名' })
  @Column({ name: 'file_name', type: 'varchar', length: 200, nullable: true, comment: '示例文件名' })
  fileName: string;

  @ApiProperty({ description: '文件链接' })
  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true, comment: '文件链接/路径' })
  filePath: string;

  @ApiProperty({ description: '说明' })
  @Column({ type: 'text', nullable: true, comment: '说明' })
  description: string;

  @ManyToOne(() => DocType, (docType) => docType.templates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_type_id' })
  docType: DocType;
}
