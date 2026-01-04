import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LawDocument } from './entities/law-document.entity';
import { LawDocumentController } from './law-document.controller';
import { LawDocumentService } from './law-document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LawDocument]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [LawDocumentController],
  providers: [LawDocumentService],
  exports: [LawDocumentService],
})
export class LawDocumentModule {}


