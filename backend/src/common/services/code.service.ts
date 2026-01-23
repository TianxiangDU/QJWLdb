import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CodeSequence } from '../entities/code-sequence.entity';

/**
 * 编码格式类型
 */
export type CodePattern = 
  | 'PREFIX-YYYYMM-SEQ6'    // 主资源：DT-202601-000123
  | 'PARENT-PREFIX-SEQ4';   // 子资源：DT-202601-000123-FD-0001

/**
 * 资源编码前缀映射
 */
export const CODE_PREFIX_MAP: Record<string, string> = {
  docType: 'DT',
  docFieldDef: 'FD',
  docTemplateSample: 'TS',
  auditRule: 'AR',
  auditRuleFieldLink: 'FL',
  auditRuleLawLink: 'LL',
  auditRuleExample: 'EX',
  lawDocument: 'LD',
  lawClause: 'LC',
  lawClauseDocTypeLink: 'LT',
  costRule: 'CR',
  bizProcess: 'BP',
  caseLibrary: 'CL',
  knowledgeSnippet: 'KS',
  monitorMetric: 'MM',
};

/**
 * 编码生成服务
 * 提供事务安全的自动编码生成
 */
@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(CodeSequence)
    private readonly codeSequenceRepo: Repository<CodeSequence>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取下一个编码
   * @param resourceType 资源类型（如 docType, auditRule）
   * @param pattern 编码格式
   * @param parentCode 父级编码（子资源时使用）
   * @returns 生成的编码
   */
  async next(
    resourceType: string,
    pattern: CodePattern = 'PREFIX-YYYYMM-SEQ6',
    parentCode?: string,
  ): Promise<string> {
    const prefix = CODE_PREFIX_MAP[resourceType];
    if (!prefix) {
      throw new Error(`未知的资源类型: ${resourceType}`);
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 构建作用域
    let scope: string;
    if (pattern === 'PARENT-PREFIX-SEQ4' && parentCode) {
      scope = `${resourceType}:${parentCode}`;
    } else {
      scope = `${resourceType}:${yearMonth}`;
    }

    // 使用事务确保并发安全
    return await this.dataSource.transaction(async (manager) => {
      // 锁定并获取当前序列
      let sequence = await manager
        .createQueryBuilder(CodeSequence, 'cs')
        .setLock('pessimistic_write')
        .where('cs.scope = :scope', { scope })
        .getOne();

      let seq: number;
      if (sequence) {
        seq = sequence.nextSeq;
        sequence.nextSeq = seq + 1;
        await manager.save(sequence);
      } else {
        // 首次创建
        seq = 1;
        sequence = manager.create(CodeSequence, {
          scope,
          nextSeq: 2,
        });
        await manager.save(sequence);
      }

      // 生成编码
      if (pattern === 'PARENT-PREFIX-SEQ4' && parentCode) {
        // 子资源格式：{PARENT_CODE}-{PREFIX}-{SEQ4}
        return `${parentCode}-${prefix}-${String(seq).padStart(4, '0')}`;
      } else {
        // 主资源格式：{PREFIX}-{YYYYMM}-{SEQ6}
        return `${prefix}-${yearMonth}-${String(seq).padStart(6, '0')}`;
      }
    });
  }

  /**
   * 批量获取编码
   * @param resourceType 资源类型
   * @param count 需要的数量
   * @param pattern 编码格式
   * @param parentCode 父级编码
   * @returns 编码数组
   */
  async nextBatch(
    resourceType: string,
    count: number,
    pattern: CodePattern = 'PREFIX-YYYYMM-SEQ6',
    parentCode?: string,
  ): Promise<string[]> {
    const prefix = CODE_PREFIX_MAP[resourceType];
    if (!prefix) {
      throw new Error(`未知的资源类型: ${resourceType}`);
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    let scope: string;
    if (pattern === 'PARENT-PREFIX-SEQ4' && parentCode) {
      scope = `${resourceType}:${parentCode}`;
    } else {
      scope = `${resourceType}:${yearMonth}`;
    }

    return await this.dataSource.transaction(async (manager) => {
      let sequence = await manager
        .createQueryBuilder(CodeSequence, 'cs')
        .setLock('pessimistic_write')
        .where('cs.scope = :scope', { scope })
        .getOne();

      let startSeq: number;
      if (sequence) {
        startSeq = sequence.nextSeq;
        sequence.nextSeq = startSeq + count;
        await manager.save(sequence);
      } else {
        startSeq = 1;
        sequence = manager.create(CodeSequence, {
          scope,
          nextSeq: 1 + count,
        });
        await manager.save(sequence);
      }

      const codes: string[] = [];
      for (let i = 0; i < count; i++) {
        const seq = startSeq + i;
        if (pattern === 'PARENT-PREFIX-SEQ4' && parentCode) {
          codes.push(`${parentCode}-${prefix}-${String(seq).padStart(4, '0')}`);
        } else {
          codes.push(`${prefix}-${yearMonth}-${String(seq).padStart(6, '0')}`);
        }
      }

      return codes;
    });
  }

  /**
   * 解析编码，提取信息
   */
  parseCode(code: string): {
    prefix: string;
    yearMonth?: string;
    parentCode?: string;
    seq: number;
  } | null {
    // 子资源格式：XX-YYYYMM-NNNNNN-YY-NNNN
    const childMatch = code.match(/^(.+-\d{6}-\d{6})-([A-Z]{2})-(\d{4})$/);
    if (childMatch) {
      return {
        prefix: childMatch[2],
        parentCode: childMatch[1],
        seq: parseInt(childMatch[3], 10),
      };
    }

    // 主资源格式：XX-YYYYMM-NNNNNN
    const mainMatch = code.match(/^([A-Z]{2})-(\d{6})-(\d{6})$/);
    if (mainMatch) {
      return {
        prefix: mainMatch[1],
        yearMonth: mainMatch[2],
        seq: parseInt(mainMatch[3], 10),
      };
    }

    return null;
  }
}
