import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuditRule } from './entities/audit-rule.entity';
import { AuditRuleController } from './audit-rule.controller';
import { AuditRuleService } from './audit-rule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditRule]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AuditRuleController],
  providers: [AuditRuleService],
  exports: [AuditRuleService],
})
export class AuditRuleModule {}


