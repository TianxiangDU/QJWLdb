import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawClauseDocTypeLink } from './entities/law-clause-doc-type-link.entity';
import { PaginationResultDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LawClauseDocTypeLinkService {
  constructor(
    @InjectRepository(LawClauseDocTypeLink)
    private readonly repository: Repository<LawClauseDocTypeLink>,
  ) {}

  async create(data: Partial<LawClauseDocTypeLink>): Promise<LawClauseDocTypeLink> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(query: any): Promise<PaginationResultDto<LawClauseDocTypeLink>> {
    const { page = 1, pageSize = 10, status, lawClauseId, docTypeId } = query;

    const queryBuilder = this.repository.createQueryBuilder('link')
      .leftJoinAndSelect('link.lawClause', 'lawClause')
      .leftJoinAndSelect('link.lawDocument', 'lawDocument')
      .leftJoinAndSelect('link.docType', 'docType');

    if (status !== undefined) {
      queryBuilder.andWhere('link.status = :status', { status });
    }
    if (lawClauseId) {
      queryBuilder.andWhere('link.lawClauseId = :lawClauseId', { lawClauseId });
    }
    if (docTypeId) {
      queryBuilder.andWhere('link.docTypeId = :docTypeId', { docTypeId });
    }

    queryBuilder
      .orderBy('link.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<LawClauseDocTypeLink> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['lawClause', 'lawDocument', 'docType'],
    });
    if (!entity) {
      throw new NotFoundException(`关联记录 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, data: Partial<LawClauseDocTypeLink>): Promise<LawClauseDocTypeLink> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  async batchUpdateStatus(ids: number[], status: number): Promise<void> {
    await this.repository.createQueryBuilder().update().set({ status }).whereInIds(ids).execute();
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.repository.createQueryBuilder().delete().whereInIds(ids).execute();
  }
}

