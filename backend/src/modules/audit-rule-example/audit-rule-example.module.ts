import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRuleExample } from './entities/audit-rule-example.entity';
import { AuditRuleExampleController } from './audit-rule-example.controller';
import { AuditRuleExampleService } from './audit-rule-example.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditRuleExample])],
  controllers: [AuditRuleExampleController],
  providers: [AuditRuleExampleService],
  exports: [AuditRuleExampleService],
})
export class AuditRuleExampleModule {}


