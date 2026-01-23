import { Entity, Column, OneToMany, Index, VersionColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AuditRuleFieldLink } from '../../audit-rule-field-link/entities/audit-rule-field-link.entity';
import { AuditRuleLawLink } from '../../audit-rule-law-link/entities/audit-rule-law-link.entity';
import { AuditRuleExample } from '../../audit-rule-example/entities/audit-rule-example.entity';

@Entity('audit_rule')
@Index(['ruleCategory', 'projectPhase'])
export class AuditRule extends BaseEntity {
  @ApiProperty({ description: '规则编码' })
  @Column({ name: 'rule_code', type: 'varchar', length: 50, unique: true, comment: '规则编码' })
  ruleCode: string;

  @ApiProperty({ description: '规则名称' })
  @Column({ name: 'rule_name', type: 'varchar', length: 200, comment: '规则名称' })
  ruleName: string;

  @ApiProperty({ description: '规则分类' })
  @Column({ name: 'rule_category', type: 'varchar', length: 50, nullable: true, comment: '规则分类' })
  ruleCategory: string;

  @ApiProperty({ description: '规则业务说明' })
  @Column({ name: 'biz_description', type: 'text', nullable: true, comment: '规则业务说明（自然语言）' })
  bizDescription: string;

  @ApiProperty({ description: '比对方法/思路说明' })
  @Column({ name: 'compare_method', type: 'text', nullable: true, comment: '比对方法/思路说明' })
  compareMethod: string;

  @ApiProperty({ description: '风险等级' })
  @Column({ name: 'risk_level', type: 'varchar', length: 20, nullable: true, comment: '风险等级' })
  riskLevel: string;

  @ApiProperty({ description: '适用项目阶段' })
  @Column({ name: 'project_phase', type: 'varchar', length: 200, nullable: true, comment: '适用项目阶段（逗号分隔）' })
  projectPhase: string;

  @ApiProperty({ description: '适用项目类型' })
  @Column({ name: 'project_type', type: 'varchar', length: 200, nullable: true, comment: '适用项目类型' })
  projectType: string;

  @ApiProperty({ description: '适用地区' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '适用地区' })
  region: string;

  @ApiProperty({ description: '适用业主' })
  @Column({ name: 'owner_org', type: 'varchar', length: 200, nullable: true, comment: '适用业主' })
  ownerOrg: string;

  @ApiProperty({ description: '版本号' })
  @Column({ type: 'int', default: 1, comment: '版本号' })
  version: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @ApiProperty({ description: '数据版本号（乐观锁）', example: 1 })
  @VersionColumn({ name: 'row_version', default: 1 })
  rowVersion: number;

  @OneToMany(() => AuditRuleFieldLink, (link) => link.auditRule)
  fieldLinks: AuditRuleFieldLink[];

  @OneToMany(() => AuditRuleLawLink, (link) => link.auditRule)
  lawLinks: AuditRuleLawLink[];

  @OneToMany(() => AuditRuleExample, (example) => example.auditRule)
  examples: AuditRuleExample[];
}


