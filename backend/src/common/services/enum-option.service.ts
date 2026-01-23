import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnumOption } from '../entities/enum-option.entity';

/**
 * 枚举分类常量
 */
export const ENUM_CATEGORIES = {
  PROJECT_PHASE: 'projectPhase',      // 项目阶段
  MAJOR_CATEGORY: 'majorCategory',    // 大类
  MINOR_CATEGORY: 'minorCategory',    // 小类
  REGION: 'region',                   // 适用地区
  OWNER_ORG: 'ownerOrg',              // 适用业主
} as const;

export type EnumCategory = typeof ENUM_CATEGORIES[keyof typeof ENUM_CATEGORIES];

@Injectable()
export class EnumOptionService {
  constructor(
    @InjectRepository(EnumOption)
    private readonly enumOptionRepo: Repository<EnumOption>,
  ) {}

  /**
   * 获取某个分类的所有选项
   */
  async getOptions(
    category: string,
    parentValue?: string,
  ): Promise<EnumOption[]> {
    const query = this.enumOptionRepo
      .createQueryBuilder('eo')
      .where('eo.category = :category', { category })
      .andWhere('eo.status = 1');

    if (parentValue !== undefined) {
      query.andWhere('eo.parentValue = :parentValue', { parentValue });
    }

    return query.orderBy('eo.sortOrder', 'ASC').addOrderBy('eo.value', 'ASC').getMany();
  }

  /**
   * 新增枚举选项
   */
  async addOption(
    category: string,
    value: string,
    parentValue?: string,
    label?: string,
  ): Promise<EnumOption> {
    // 检查是否已存在
    const existing = await this.enumOptionRepo.findOne({
      where: { category, value },
    });

    if (existing) {
      if (existing.status === 0) {
        // 重新启用
        existing.status = 1;
        existing.parentValue = parentValue || existing.parentValue;
        return this.enumOptionRepo.save(existing);
      }
      throw new ConflictException(`选项 "${value}" 已存在`);
    }

    // 获取最大排序号
    const maxSort = await this.enumOptionRepo
      .createQueryBuilder('eo')
      .select('MAX(eo.sortOrder)', 'max')
      .where('eo.category = :category', { category })
      .getRawOne();

    const newOption = this.enumOptionRepo.create({
      category,
      value,
      label: label || value,
      parentValue,
      sortOrder: (maxSort?.max || 0) + 1,
      status: 1,
    });

    return this.enumOptionRepo.save(newOption);
  }

  /**
   * 从现有数据同步枚举选项
   * 用于初始化或更新枚举表
   */
  async syncFromExistingData(
    category: string,
    values: string[],
    parentValueMap?: Map<string, string>,
  ): Promise<number> {
    let count = 0;
    for (const value of values) {
      if (!value || value.trim() === '') continue;

      const trimmedValue = value.trim();
      const existing = await this.enumOptionRepo.findOne({
        where: { category, value: trimmedValue },
      });

      if (!existing) {
        await this.enumOptionRepo.save({
          category,
          value: trimmedValue,
          label: trimmedValue,
          parentValue: parentValueMap?.get(trimmedValue),
          sortOrder: count,
          status: 1,
        });
        count++;
      }
    }
    return count;
  }

  /**
   * 获取多个分类的选项（批量）
   */
  async getMultipleOptions(
    categories: string[],
  ): Promise<Record<string, EnumOption[]>> {
    const result: Record<string, EnumOption[]> = {};

    for (const category of categories) {
      result[category] = await this.getOptions(category);
    }

    return result;
  }

  /**
   * 删除选项（软删除）
   */
  async disableOption(category: string, value: string): Promise<void> {
    await this.enumOptionRepo.update(
      { category, value },
      { status: 0 },
    );
  }

  /**
   * 更新选项
   */
  async updateOption(
    id: number,
    updates: { label?: string; sortOrder?: number; parentValue?: string },
  ): Promise<EnumOption> {
    const option = await this.enumOptionRepo.findOne({ where: { id } });
    if (!option) {
      throw new Error('选项不存在');
    }
    Object.assign(option, updates);
    return this.enumOptionRepo.save(option);
  }
}
