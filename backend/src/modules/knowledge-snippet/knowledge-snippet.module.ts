import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeSnippet } from './entities/knowledge-snippet.entity';
import { KnowledgeSnippetController } from './knowledge-snippet.controller';
import { KnowledgeSnippetService } from './knowledge-snippet.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeSnippet])],
  controllers: [KnowledgeSnippetController],
  providers: [KnowledgeSnippetService],
  exports: [KnowledgeSnippetService],
})
export class KnowledgeSnippetModule {}


