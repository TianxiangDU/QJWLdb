import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocTemplateSample } from './entities/doc-template-sample.entity';
import { DocType } from '../doc-type/entities/doc-type.entity';
import { DocTemplateSampleController } from './doc-template-sample.controller';
import { DocTemplateSampleService } from './doc-template-sample.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocTemplateSample, DocType])],
  controllers: [DocTemplateSampleController],
  providers: [DocTemplateSampleService],
  exports: [DocTemplateSampleService],
})
export class DocTemplateSampleModule {}


