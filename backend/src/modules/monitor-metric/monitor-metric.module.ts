import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorMetric } from './entities/monitor-metric.entity';
import { MonitorMetricController } from './monitor-metric.controller';
import { MonitorMetricService } from './monitor-metric.service';

@Module({
  imports: [TypeOrmModule.forFeature([MonitorMetric])],
  controllers: [MonitorMetricController],
  providers: [MonitorMetricService],
  exports: [MonitorMetricService],
})
export class MonitorMetricModule {}


