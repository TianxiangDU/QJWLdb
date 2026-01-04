import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawClauseDocTypeLink } from './entities/law-clause-doc-type-link.entity';
import { LawClauseDocTypeLinkController } from './law-clause-doc-type-link.controller';
import { LawClauseDocTypeLinkService } from './law-clause-doc-type-link.service';

@Module({
  imports: [TypeOrmModule.forFeature([LawClauseDocTypeLink])],
  controllers: [LawClauseDocTypeLinkController],
  providers: [LawClauseDocTypeLinkService],
  exports: [LawClauseDocTypeLinkService],
})
export class LawClauseDocTypeLinkModule {}


