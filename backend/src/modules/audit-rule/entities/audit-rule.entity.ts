import { Entity, Column, Index, VersionColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AuditRuleFieldLink } from '../../audit-rule-field-link/entities/audit-rule-field-link.entity';
import { AuditRuleLawLink } from '../../audit-rule-law-link/entities/audit-rule-law-link.entity';
import { AuditRuleExample } from '../../audit-rule-example/entities/audit-rule-example.entity';

@Entity('audit_rule')
@Index(['auditType', 'phase', 'verifySection'])
export class AuditRule extends BaseEntity {
  @ApiProperty({ description: '规则编码（自动生成：AABBCC0000）' })
  @Column({ name: 'rule_code', type: 'varchar', length: 50, unique: true, comment: '规则编码' })
  ruleCode: string;

  @ApiProperty({ description: '规则名称' })
  @Column({ name: 'rule_name', type: 'varchar', length: 200, comment: '规则名称' })
  ruleName: string;

  // ===== 三个枚举字段（用于自动编码） =====
  @ApiProperty({ description: '审计类型' })
  @Column({ name: 'audit_type', type: 'varchar', length: 50, nullable: true, comment: '审计类型' })
  auditType: string;

  @ApiProperty({ description: '阶段' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '阶段' })
  phase: string;

  @ApiProperty({ description: '查证板块' })
  @Column({ name: 'verify_section', type: 'varchar', length: 50, nullable: true, comment: '查证板块' })
  verifySection: string;

  // ===== 字符串字段 =====
  @ApiProperty({ description: '问题描述' })
  @Column({ name: 'problem_desc', type: 'text', nullable: true, comment: '问题描述' })
  problemDesc: string;

  @ApiProperty({ description: '比对方式' })
  @Column({ name: 'compare_method', type: 'text', nullable: true, comment: '比对方式' })
  compareMethod: string;

  @ApiProperty({ description: '比对方式-LLM用' })
  @Column({ name: 'compare_method_llm', type: 'text', nullable: true, comment: '比对方式-LLM用' })
  compareMethodLlm: string;

  @ApiProperty({ description: '审计依据内容' })
  @Column({ name: 'audit_basis', type: 'text', nullable: true, comment: '审计依据内容' })
  auditBasis: string;

  // ===== 5个数据源（关联关键信息字段） =====
  @ApiProperty({ description: '数据源1编码' })
  @Column({ name: 'source1_code', type: 'varchar', length: 50, nullable: true, comment: '数据源1编码（关键信息字段编码）' })
  source1Code: string;

  @ApiProperty({ description: '数据源1名称' })
  @Column({ name: 'source1_name', type: 'varchar', length: 200, nullable: true, comment: '数据源1名称' })
  source1Name: string;

  @ApiProperty({ description: '数据源2编码' })
  @Column({ name: 'source2_code', type: 'varchar', length: 50, nullable: true, comment: '数据源2编码' })
  source2Code: string;

  @ApiProperty({ description: '数据源2名称' })
  @Column({ name: 'source2_name', type: 'varchar', length: 200, nullable: true, comment: '数据源2名称' })
  source2Name: string;

  @ApiProperty({ description: '数据源3编码' })
  @Column({ name: 'source3_code', type: 'varchar', length: 50, nullable: true, comment: '数据源3编码' })
  source3Code: string;

  @ApiProperty({ description: '数据源3名称' })
  @Column({ name: 'source3_name', type: 'varchar', length: 200, nullable: true, comment: '数据源3名称' })
  source3Name: string;

  @ApiProperty({ description: '数据源4编码' })
  @Column({ name: 'source4_code', type: 'varchar', length: 50, nullable: true, comment: '数据源4编码' })
  source4Code: string;

  @ApiProperty({ description: '数据源4名称' })
  @Column({ name: 'source4_name', type: 'varchar', length: 200, nullable: true, comment: '数据源4名称' })
  source4Name: string;

  @ApiProperty({ description: '数据源5编码' })
  @Column({ name: 'source5_code', type: 'varchar', length: 50, nullable: true, comment: '数据源5编码' })
  source5Code: string;

  @ApiProperty({ description: '数据源5名称' })
  @Column({ name: 'source5_name', type: 'varchar', length: 200, nullable: true, comment: '数据源5名称' })
  source5Name: string;

  // ===== 法规关联 =====
  @ApiProperty({ description: '法条编码' })
  @Column({ name: 'law_clause_code', type: 'varchar', length: 50, nullable: true, comment: '法条编码（法规条款编码）' })
  lawClauseCode: string;

  // ===== 其他字段 =====
  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ApiProperty({ description: '数据版本号（乐观锁）', example: 1 })
  @VersionColumn({ name: 'row_version', default: 1 })
  rowVersion: number;

  // ===== 关联关系（保留兼容） =====
  @OneToMany(() => AuditRuleFieldLink, (link) => link.auditRule)
  fieldLinks: AuditRuleFieldLink[];

  @OneToMany(() => AuditRuleLawLink, (link) => link.auditRule)
  lawLinks: AuditRuleLawLink[];

  @OneToMany(() => AuditRuleExample, (example) => example.auditRule)
  examples: AuditRuleExample[];
}
