import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRuleFieldLink } from './entities/audit-rule-field-link.entity';
import { AuditRuleFieldLinkController } from './audit-rule-field-link.controller';
import { AuditRuleFieldLinkService } from './audit-rule-field-link.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditRuleFieldLink])],
  controllers: [AuditRuleFieldLinkController],
  providers: [AuditRuleFieldLinkService],
  exports: [AuditRuleFieldLinkService],
})
export class AuditRuleFieldLinkModule {}


