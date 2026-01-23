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
   * 根据值获取单个选项（包含缩写和序号）
   */
  async getOptionByValue(category: string, value: string): Promise<EnumOption | null> {
    return this.enumOptionRepo.findOne({
      where: { category, value, status: 1 },
    });
  }

  /**
   * 生成唯一缩写（2个大写字母）
   * 基于中文拼音首字母，如果冲突则变换第二个字母
   */
  async generateShortCode(category: string, value: string): Promise<string> {
    // 简单实现：取前两个字的首字母拼音（去重版本）
    // 常用汉字拼音首字母映射（可扩展）
    const pinyinMap: Record<string, string> = {
      '组': 'Z', '织': 'Z', '治': 'Z', '理': 'L', '资': 'Z', '料': 'L',
      '前': 'Q', '期': 'Q', '准': 'Z', '备': 'B', '阶': 'J', '段': 'D',
      '勘': 'K', '察': 'C', '设': 'S', '计': 'J',
      '招': 'Z', '投': 'T', '标': 'B',
      '施': 'S', '工': 'G',
      '竣': 'J', '验': 'Y', '收': 'S',
      '决': 'J', '算': 'S',
      '运': 'Y', '营': 'Y',
      '公': 'G', '司': 'S', '制': 'Z', '度': 'D',
      '经': 'J', '管': 'G',
      '立': 'L', '项': 'X', '文': 'W', '件': 'J',
      '土': 'T', '地': 'D', '获': 'H', '取': 'Q',
      '规': 'G', '划': 'H', '许': 'X', '可': 'K',
      '环': 'H', '境': 'J', '影': 'Y', '响': 'X', '评': 'P', '价': 'J',
      '成': 'C', '本': 'B', '控': 'K',
      '其': 'Q', '他': 'T', '专': 'Z', '审': 'S', '批': 'P',
      '方': 'F', '案': 'A',
      '初': 'C', '步': 'B',
      '图': 'T',
      '采': 'C', '购': 'G', '策': 'C',
      '过': 'G', '程': 'C',
      '格': 'G', '预': 'Y',
      '开': 'K',
      '台': 'T', '账': 'Z',
      '非': 'F',
      '卷': 'J', '目': 'M', '录': 'L',
      '合': 'H', '同': 'T', '补': 'B', '充': 'C', '协': 'X', '议': 'Y',
      '供': 'G', '应': 'Y', '商': 'S',
      '物': 'W',
      '监': 'J', '造': 'Z',
      '技': 'J', '术': 'S',
      '质': 'Z', '量': 'L',
      '进': 'J',
      '安': 'A', '全': 'Q',
      '违': 'W', '法': 'F', '分': 'F', '包': 'B',
      '财': 'C', '务': 'W',
      '后': 'H',
      '试': 'S', '行': 'X',
      '固': 'G', '定': 'D', '产': 'C',
      '通': 'T', '用': 'Y',
      // 新增常用字（去重后）
      '测': 'C', '新': 'X', '增': 'Z', '删': 'S',
      '数': 'S', '据': 'J', '库': 'K',
      '类': 'L', '型': 'X', '名': 'M', '称': 'C',
      '状': 'Z', '态': 'T', '日': 'R',
      '人': 'R', '门': 'M', '单': 'D',
      '区': 'Q', '域': 'Y', '省': 'S',
      '县': 'X', '镇': 'Z', '村': 'C', '街': 'J',
      '号': 'H', '楼': 'L', '层': 'C', '室': 'S', '栋': 'D', '幢': 'Z',
      '内': 'N', '容': 'R', '描': 'M', '述': 'S',
      '附': 'F', '片': 'P', '视': 'S', '频': 'P',
      '链': 'L', '接': 'J', '址': 'Z',
      '电': 'D', '话': 'H', '邮': 'Y', '箱': 'X', '网': 'W', '站': 'Z',
      '登': 'D', '退': 'T', '册': 'C',
      '密': 'M', '修': 'X', '存': 'C',
      '确': 'Q', '认': 'R', '消': 'X',
      '返': 'F', '首': 'S', '页': 'Y', '下': 'X',
      '左': 'Z', '右': 'Y', '底': 'D',
    };

    // 获取前两个字符的拼音首字母，跳过不在映射中的汉字
    let code = '';
    for (let i = 0; i < value.length && code.length < 2; i++) {
      const char = value[i];
      if (pinyinMap[char]) {
        code += pinyinMap[char];
      } else if (/^[A-Za-z0-9]$/.test(char)) {
        // 英文字母或数字直接使用
        code += char.toUpperCase();
      }
      // 跳过不在映射中的汉字，不将其加入编码
    }
    // 如果编码不足2位，用X补齐
    if (code.length < 2) code = code.padEnd(2, 'X');
    code = code.substring(0, 2).toUpperCase();

    // 检查是否冲突
    const existing = await this.enumOptionRepo.findOne({
      where: { category, shortCode: code, status: 1 },
    });

    if (!existing) return code;

    // 冲突则变换第二个字母
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of letters) {
      const newCode = code[0] + letter;
      const conflict = await this.enumOptionRepo.findOne({
        where: { category, shortCode: newCode, status: 1 },
      });
      if (!conflict) return newCode;
    }

    // 极端情况：变换第一个字母
    for (const letter of letters) {
      const newCode = letter + code[1];
      const conflict = await this.enumOptionRepo.findOne({
        where: { category, shortCode: newCode, status: 1 },
      });
      if (!conflict) return newCode;
    }

    return code + Math.random().toString(36).substring(2, 4).toUpperCase();
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

    const sortOrder = (maxSort?.max || 0) + 1;

    // 为阶段和大类生成唯一缩写
    let shortCode: string | undefined;
    if (category === ENUM_CATEGORIES.PROJECT_PHASE || category === ENUM_CATEGORIES.MAJOR_CATEGORY) {
      shortCode = await this.generateShortCode(category, value);
    }

    const newOption = this.enumOptionRepo.create({
      category,
      value,
      label: label || value,
      parentValue,
      sortOrder,
      shortCode,
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
    updates: { value?: string; label?: string; sortOrder?: number; parentValue?: string; shortCode?: string },
  ): Promise<EnumOption> {
    const option = await this.enumOptionRepo.findOne({ where: { id } });
    if (!option) {
      throw new Error('选项不存在');
    }
    Object.assign(option, updates);
    return this.enumOptionRepo.save(option);
  }

  /**
   * 删除选项（软删除，将 status 设为 0）
   */
  async deleteOption(id: number): Promise<void> {
    const option = await this.enumOptionRepo.findOne({ where: { id } });
    if (!option) {
      throw new Error('选项不存在');
    }
    option.status = 0;
    await this.enumOptionRepo.save(option);
  }

  /**
   * 为所有缺少缩写的阶段和大类选项生成缩写
   */
  async generateAllShortCodes(): Promise<{ updated: number }> {
    let updated = 0;

    // 为项目阶段生成缩写
    const phases = await this.enumOptionRepo.find({
      where: { category: ENUM_CATEGORIES.PROJECT_PHASE, status: 1 },
    });
    for (const phase of phases) {
      if (!phase.shortCode) {
        phase.shortCode = await this.generateShortCode(ENUM_CATEGORIES.PROJECT_PHASE, phase.value);
        await this.enumOptionRepo.save(phase);
        updated++;
      }
    }

    // 为大类生成缩写
    const majors = await this.enumOptionRepo.find({
      where: { category: ENUM_CATEGORIES.MAJOR_CATEGORY, status: 1 },
    });
    for (const major of majors) {
      if (!major.shortCode) {
        major.shortCode = await this.generateShortCode(ENUM_CATEGORIES.MAJOR_CATEGORY, major.value);
        await this.enumOptionRepo.save(major);
        updated++;
      }
    }

    return { updated };
  }
}
