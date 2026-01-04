import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRuleLawLink } from './entities/audit-rule-law-link.entity';
import { AuditRuleLawLinkController } from './audit-rule-law-link.controller';
import { AuditRuleLawLinkService } from './audit-rule-law-link.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditRuleLawLink])],
  controllers: [AuditRuleLawLinkController],
  providers: [AuditRuleLawLinkService],
  exports: [AuditRuleLawLinkService],
})
export class AuditRuleLawLinkModule {}


