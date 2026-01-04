import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LawClause } from './entities/law-clause.entity';
import { LawClauseController } from './law-clause.controller';
import { LawClauseService } from './law-clause.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LawClause]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [LawClauseController],
  providers: [LawClauseService],
  exports: [LawClauseService],
})
export class LawClauseModule {}


