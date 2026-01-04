import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocTemplateSample } from './entities/doc-template-sample.entity';
import { CreateDocTemplateSampleDto } from './dto/create-doc-template-sample.dto';
import { UpdateDocTemplateSampleDto } from './dto/update-doc-template-sample.dto';
import { QueryDocTemplateSampleDto } from './dto/query-doc-template-sample.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DocTemplateSampleService {
  constructor(
    @InjectRepository(DocTemplateSample)
    private readonly repository: Repository<DocTemplateSample>,
  ) {}

  async create(createDto: CreateDocTemplateSampleDto): Promise<DocTemplateSample> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(query: QueryDocTemplateSampleDto): Promise<PaginationResultDto<DocTemplateSample>> {
    const { page = 1, pageSize = 10, keyword, status, docTypeIds } = query;

    const queryBuilder = this.repository.createQueryBuilder('dt')
      .leftJoinAndSelect('dt.docType', 'docType');

    if (status !== undefined) {
      queryBuilder.andWhere('dt.status = :status', { status });
    }
    if (docTypeIds && docTypeIds.length > 0) {
      queryBuilder.andWhere('dt.docTypeId IN (:...docTypeIds)', { docTypeIds });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(dt.fileName LIKE :keyword OR dt.description LIKE :keyword OR docType.name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('docType.code', 'ASC')
      .addOrderBy('dt.createdAt', 'DESC')
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

  async findOne(id: number): Promise<DocTemplateSample> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['docType'],
    });
    if (!entity) {
      throw new NotFoundException(`文件模板/示例 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateDocTemplateSampleDto): Promise<DocTemplateSample> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
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
