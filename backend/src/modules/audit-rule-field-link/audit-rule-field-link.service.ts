import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRuleFieldLink } from './entities/audit-rule-field-link.entity';

@Injectable()
export class AuditRuleFieldLinkService {
  constructor(
    @InjectRepository(AuditRuleFieldLink)
    private readonly repository: Repository<AuditRuleFieldLink>,
  ) {}

  async create(data: Partial<AuditRuleFieldLink>): Promise<AuditRuleFieldLink> {
    const existing = await this.repository.findOne({
      where: { ruleId: data.ruleId, docFieldId: data.docFieldId },
    });
    if (existing) {
      throw new ConflictException('该规则已关联此字段');
    }
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findByRuleId(ruleId: number): Promise<AuditRuleFieldLink[]> {
    return this.repository.find({
      where: { ruleId, status: 1 },
      relations: ['docType', 'docField'],
    });
  }

  async findOne(id: number): Promise<AuditRuleFieldLink> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['docType', 'docField'],
    });
    if (!entity) {
      throw new NotFoundException(`关联记录 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, data: Partial<AuditRuleFieldLink>): Promise<AuditRuleFieldLink> {
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

