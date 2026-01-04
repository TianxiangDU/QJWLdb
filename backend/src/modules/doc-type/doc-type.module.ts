import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocType } from './entities/doc-type.entity';
import { DocTypeController } from './doc-type.controller';
import { DocTypeService } from './doc-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocType]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [DocTypeController],
  providers: [DocTypeService],
  exports: [DocTypeService],
})
export class DocTypeModule {}


