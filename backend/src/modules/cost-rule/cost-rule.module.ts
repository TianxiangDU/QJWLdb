import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostRule } from './entities/cost-rule.entity';
import { CostRuleController } from './cost-rule.controller';
import { CostRuleService } from './cost-rule.service';

@Module({
  imports: [TypeOrmModule.forFeature([CostRule])],
  controllers: [CostRuleController],
  providers: [CostRuleService],
  exports: [CostRuleService],
})
export class CostRuleModule {}


