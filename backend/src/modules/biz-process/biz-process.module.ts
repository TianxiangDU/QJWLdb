import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BizProcess } from './entities/biz-process.entity';
import { BizProcessController } from './biz-process.controller';
import { BizProcessService } from './biz-process.service';

@Module({
  imports: [TypeOrmModule.forFeature([BizProcess])],
  controllers: [BizProcessController],
  providers: [BizProcessService],
  exports: [BizProcessService],
})
export class BizProcessModule {}


