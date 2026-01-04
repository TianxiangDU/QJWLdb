import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseLibrary } from './entities/case-library.entity';
import { CaseLibraryController } from './case-library.controller';
import { CaseLibraryService } from './case-library.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseLibrary])],
  controllers: [CaseLibraryController],
  providers: [CaseLibraryService],
  exports: [CaseLibraryService],
})
export class CaseLibraryModule {}


