import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DocType } from '../../doc-type/entities/doc-type.entity';

@Entity('doc_field_def')
@Index(['docTypeId', 'fieldCode'], { unique: true })
@Index(['docTypeId'])
export class DocFieldDef extends BaseEntity {
  @ApiProperty({ description: '所属文件类型ID' })
  @Column({ name: 'doc_type_id', type: 'bigint', unsigned: true, comment: '所属文件类型ID' })
  docTypeId: number;

  @ApiProperty({ description: '字段编码' })
  @Column({ name: 'field_code', type: 'varchar', length: 50, comment: '字段编码' })
  fieldCode: string;

  @ApiProperty({ description: '字段名称' })
  @Column({ name: 'field_name', type: 'varchar', length: 100, comment: '字段名称' })
  fieldName: string;

  @ApiProperty({ description: '字段类别' })
  @Column({ name: 'field_category', type: 'varchar', length: 50, nullable: true, comment: '字段类别' })
  fieldCategory: string;

  @ApiProperty({ description: '是否必填' })
  @Column({ name: 'required_flag', type: 'tinyint', default: 0, comment: '是否必填：1-是，0-否' })
  requiredFlag: number;

  @ApiProperty({ description: '取值方式（在文件中的位置）' })
  @Column({ name: 'value_source', type: 'varchar', length: 200, nullable: true, comment: '取值方式（在文件中的位置）' })
  valueSource: string;

  @ApiProperty({ description: '枚举值（当字段类别为枚举时填写）' })
  @Column({ name: 'enum_options', type: 'text', nullable: true, comment: '枚举值（当字段类别为枚举时填写，多个值用逗号分隔）' })
  enumOptions: string;

  @ApiProperty({ description: '示例数据' })
  @Column({ name: 'example_value', type: 'varchar', length: 500, nullable: true, comment: '示例数据' })
  exampleValue: string;

  @ApiProperty({ description: '字段说明' })
  @Column({ name: 'field_description', type: 'text', nullable: true, comment: '字段说明' })
  fieldDescription: string;

  @ApiProperty({ description: '定位词' })
  @Column({ name: 'anchor_word', type: 'varchar', length: 500, nullable: true, comment: '定位词（用于在文件中定位该字段）' })
  anchorWord: string;

  @ManyToOne(() => DocType, (docType) => docType.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_type_id' })
  docType: DocType;
}
