import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRuleExample } from './entities/audit-rule-example.entity';

@Injectable()
export class AuditRuleExampleService {
  constructor(
    @InjectRepository(AuditRuleExample)
    private readonly repository: Repository<AuditRuleExample>,
  ) {}

  async create(data: Partial<AuditRuleExample>): Promise<AuditRuleExample> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findByRuleId(ruleId: number): Promise<AuditRuleExample[]> {
    return this.repository.find({
      where: { ruleId, status: 1 },
    });
  }

  async findOne(id: number): Promise<AuditRuleExample> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`案例 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, data: Partial<AuditRuleExample>): Promise<AuditRuleExample> {
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

