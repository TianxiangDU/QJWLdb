import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeSnippet } from './entities/knowledge-snippet.entity';
import { PaginationResultDto } from '../../common/dto/pagination.dto';

@Injectable()
export class KnowledgeSnippetService {
  constructor(
    @InjectRepository(KnowledgeSnippet)
    private readonly repository: Repository<KnowledgeSnippet>,
  ) {}

  async create(data: Partial<KnowledgeSnippet>): Promise<KnowledgeSnippet> {
    const existing = await this.repository.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ConflictException(`编码 ${data.code} 已存在`);
    }
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(query: any): Promise<PaginationResultDto<KnowledgeSnippet>> {
    const { page = 1, pageSize = 10, keyword, status } = query;

    const queryBuilder = this.repository.createQueryBuilder('e');

    if (status !== undefined) {
      queryBuilder.andWhere('e.status = :status', { status });
    }
    if (keyword) {
      queryBuilder.andWhere('(e.name LIKE :keyword OR e.description LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder
      .orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number): Promise<KnowledgeSnippet> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`记录 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, data: Partial<KnowledgeSnippet>): Promise<KnowledgeSnippet> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  // 批量启用
  async batchEnable(ids: number[]): Promise<{ affected: number }> {
    const result = await this.repository.createQueryBuilder().update().set({ status: 1 }).whereInIds(ids).execute();
    return { affected: result.affected || 0 };
  }

  // 批量停用
  async batchDisable(ids: number[]): Promise<{ affected: number }> {
    const result = await this.repository.createQueryBuilder().update().set({ status: 0 }).whereInIds(ids).execute();
    return { affected: result.affected || 0 };
  }

  // 批量删除
  async batchDelete(ids: number[]): Promise<{ affected: number }> {
    const result = await this.repository.createQueryBuilder().delete().whereInIds(ids).execute();
    return { affected: result.affected || 0 };
  }
}

