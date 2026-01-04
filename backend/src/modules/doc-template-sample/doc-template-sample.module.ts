import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocTemplateSample } from './entities/doc-template-sample.entity';
import { DocTemplateSampleController } from './doc-template-sample.controller';
import { DocTemplateSampleService } from './doc-template-sample.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocTemplateSample])],
  controllers: [DocTemplateSampleController],
  providers: [DocTemplateSampleService],
  exports: [DocTemplateSampleService],
})
export class DocTemplateSampleModule {}


