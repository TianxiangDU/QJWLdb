import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AuditRule } from '../../audit-rule/entities/audit-rule.entity';
import { DocType } from '../../doc-type/entities/doc-type.entity';
import { DocFieldDef } from '../../doc-field-def/entities/doc-field-def.entity';

@Entity('audit_rule_field_link')
@Index(['ruleId', 'docFieldId'], { unique: true })
export class AuditRuleFieldLink extends BaseEntity {
  @ApiProperty({ description: '所属规则ID' })
  @Column({ name: 'rule_id', type: 'bigint', unsigned: true, comment: '所属规则ID' })
  ruleId: number;

  @ApiProperty({ description: '关联文件类型ID' })
  @Column({ name: 'doc_type_id', type: 'bigint', unsigned: true, comment: '关联文件类型ID' })
  docTypeId: number;

  @ApiProperty({ description: '关联字段ID' })
  @Column({ name: 'doc_field_id', type: 'bigint', unsigned: true, comment: '关联字段ID' })
  docFieldId: number;

  @ApiProperty({ description: '是否必需字段' })
  @Column({ name: 'required_flag', type: 'tinyint', default: 0, comment: '是否必需字段：1-是，0-否' })
  requiredFlag: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ManyToOne(() => AuditRule, (rule) => rule.fieldLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  auditRule: AuditRule;

  @ManyToOne(() => DocType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_type_id' })
  docType: DocType;

  @ManyToOne(() => DocFieldDef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_field_id' })
  docField: DocFieldDef;
}


