import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocFieldDef } from './entities/doc-field-def.entity';
import { DocType } from '../doc-type/entities/doc-type.entity';
import { DocFieldDefController } from './doc-field-def.controller';
import { DocFieldDefService } from './doc-field-def.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocFieldDef, DocType]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [DocFieldDefController],
  providers: [DocFieldDefService],
  exports: [DocFieldDefService],
})
export class DocFieldDefModule {}


