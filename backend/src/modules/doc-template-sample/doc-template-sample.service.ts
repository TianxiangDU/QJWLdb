import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocTemplateSample } from './entities/doc-template-sample.entity';
import { CreateDocTemplateSampleDto } from './dto/create-doc-template-sample.dto';
import { UpdateDocTemplateSampleDto } from './dto/update-doc-template-sample.dto';
import { QueryDocTemplateSampleDto } from './dto/query-doc-template-sample.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import { DocType } from '../doc-type/entities/doc-type.entity';

@Injectable()
export class DocTemplateSampleService {
  constructor(
    @InjectRepository(DocTemplateSample)
    private readonly repository: Repository<DocTemplateSample>,
    @InjectRepository(DocType)
    private readonly docTypeRepository: Repository<DocType>,
  ) {}

  /**
   * 生成编码：文件类型编码-A/B/C...
   */
  private async generateCode(docTypeId: number): Promise<string> {
    // 获取文件类型
    const docType = await this.docTypeRepository.findOne({ where: { id: docTypeId } });
    if (!docType) {
      throw new NotFoundException(`文件类型 ID ${docTypeId} 不存在`);
    }

    // 查找该文件类型下已有的模板数量
    const count = await this.repository.count({ where: { docTypeId } });
    
    // 生成字母后缀：A, B, C, ... Z, AA, AB, ...
    const suffix = this.numberToLetters(count);
    
    return `${docType.code}-${suffix}`;
  }

  /**
   * 数字转字母：0->A, 1->B, ..., 25->Z, 26->AA, 27->AB, ...
   */
  private numberToLetters(num: number): string {
    let result = '';
    let n = num;
    do {
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return result;
  }

  async create(createDto: CreateDocTemplateSampleDto): Promise<DocTemplateSample> {
    // 自动生成编码
    if (!createDto.code) {
      createDto.code = await this.generateCode(createDto.docTypeId);
    }
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
        '(dt.code LIKE :keyword OR dt.name LIKE :keyword OR dt.description LIKE :keyword OR docType.name LIKE :keyword)',
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
