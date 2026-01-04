import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AuditRule } from '../../audit-rule/entities/audit-rule.entity';

@Entity('audit_rule_example')
@Index(['ruleId'])
export class AuditRuleExample extends BaseEntity {
  @ApiProperty({ description: '所属规则ID' })
  @Column({ name: 'rule_id', type: 'bigint', unsigned: true, comment: '所属规则ID' })
  ruleId: number;

  @ApiProperty({ description: '案例名称' })
  @Column({ name: 'example_name', type: 'varchar', length: 200, comment: '案例名称' })
  exampleName: string;

  @ApiProperty({ description: '案例背景简述' })
  @Column({ type: 'text', nullable: true, comment: '案例背景简述' })
  background: string;

  @ApiProperty({ description: '输入关键字段示例' })
  @Column({ name: 'input_example', type: 'text', nullable: true, comment: '输入关键字段示例（可JSON文本）' })
  inputExample: string;

  @ApiProperty({ description: '审计结论示例' })
  @Column({ name: 'conclusion_example', type: 'text', nullable: true, comment: '审计结论示例' })
  conclusionExample: string;

  @ApiProperty({ description: '经验说明/注意事项' })
  @Column({ type: 'text', nullable: true, comment: '经验说明/注意事项' })
  experience: string;

  @ManyToOne(() => AuditRule, (rule) => rule.examples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  auditRule: AuditRule;
}


