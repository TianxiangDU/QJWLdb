import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRule } from './entities/audit-rule.entity';
import { DocFieldDef } from '../doc-field-def/entities/doc-field-def.entity';
import { CreateAuditRuleDto } from './dto/create-audit-rule.dto';
import { UpdateAuditRuleDto } from './dto/update-audit-rule.dto';
import { QueryAuditRuleDto } from './dto/query-audit-rule.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinyinLib = require('pinyin');
const pinyin = pinyinLib.default || pinyinLib;

@Injectable()
export class AuditRuleService {
  constructor(
    @InjectRepository(AuditRule)
    private readonly repository: Repository<AuditRule>,
    @InjectRepository(DocFieldDef)
    private readonly docFieldDefRepository: Repository<DocFieldDef>,
  ) {}

  /**
   * 获取拼音首字母（前N位，默认2位）
   * 例如："工程管理" -> "GC", "招投标阶段" -> "ZT"
   */
  private getPinyinInitials(text: string, count: number = 2): string {
    if (!text) return 'XX';
    try {
      // pinyin 返回 [['g'], ['c'], ['g'], ['l']] 这样的数组（每个汉字的拼音首字母）
      const pinyinResult = pinyin(text, { style: pinyin.STYLE_FIRST_LETTER });
      // 取前 count 个汉字的拼音首字母
      const initials = pinyinResult
        .slice(0, count)
        .map((p: string[]) => {
          const letter = p[0] || '';
          // 确保是字母并转大写
          return letter.replace(/[^a-zA-Z]/g, '').toUpperCase();
        })
        .join('');
      
      // 如果不够长度，用 X 补齐
      return initials.padEnd(count, 'X').slice(0, count);
    } catch (error) {
      console.error('拼音转换失败:', error);
      // 如果拼音库失败，尝试取汉字的简单映射
      return 'XX';
    }
  }

  /**
   * 生成审计规则编码
   * 格式：AABBCC0000 (审计类型2位 + 阶段2位 + 查证板块2位 + 4位序号)
   */
  private async generateRuleCode(dto: CreateAuditRuleDto): Promise<string> {
    const aa = this.getPinyinInitials(dto.auditType || '', 2);
    const bb = this.getPinyinInitials(dto.phase || '', 2);
    const cc = this.getPinyinInitials(dto.verifySection || '', 2);
    const prefix = `${aa}${bb}${cc}`;

    // 查找同前缀的最大序号
    const maxRule = await this.repository
      .createQueryBuilder('ar')
      .select('ar.ruleCode')
      .where('ar.ruleCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('ar.ruleCode', 'DESC')
      .getOne();

    let seq = 1;
    if (maxRule && maxRule.ruleCode) {
      const numPart = maxRule.ruleCode.slice(6); // 取后4位
      const lastSeq = parseInt(numPart, 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  /**
   * 根据数据源编码获取名称
   */
  private async getSourceName(sourceCode: string): Promise<string | undefined> {
    if (!sourceCode) return undefined;
    const field = await this.docFieldDefRepository.findOne({
      where: { fieldCode: sourceCode },
    });
    return field?.fieldName;
  }

  /**
   * 填充数据源名称
   */
  private async fillSourceNames(dto: CreateAuditRuleDto): Promise<void> {
    if (dto.source1Code && !dto.source1Name) {
      dto.source1Name = await this.getSourceName(dto.source1Code);
    }
    if (dto.source2Code && !dto.source2Name) {
      dto.source2Name = await this.getSourceName(dto.source2Code);
    }
    if (dto.source3Code && !dto.source3Name) {
      dto.source3Name = await this.getSourceName(dto.source3Code);
    }
    if (dto.source4Code && !dto.source4Name) {
      dto.source4Name = await this.getSourceName(dto.source4Code);
    }
    if (dto.source5Code && !dto.source5Name) {
      dto.source5Name = await this.getSourceName(dto.source5Code);
    }
  }

  async create(createDto: CreateAuditRuleDto): Promise<AuditRule> {
    // 自动生成编码
    if (!createDto.ruleCode) {
      createDto.ruleCode = await this.generateRuleCode(createDto);
    } else {
      // 检查编码唯一性
      const existing = await this.repository.findOne({
        where: { ruleCode: createDto.ruleCode },
      });
      if (existing) {
        throw new ConflictException(`规则编码 ${createDto.ruleCode} 已存在`);
      }
    }

    // 填充数据源名称
    await this.fillSourceNames(createDto);

    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(query: QueryAuditRuleDto): Promise<PaginationResultDto<AuditRule>> {
    const { page = 1, pageSize = 10, keyword, status, auditType, phase, verifySection } = query;

    const queryBuilder = this.repository.createQueryBuilder('ar');

    if (status !== undefined) {
      queryBuilder.andWhere('ar.status = :status', { status });
    }
    if (auditType) {
      queryBuilder.andWhere('ar.auditType = :auditType', { auditType });
    }
    if (phase) {
      queryBuilder.andWhere('ar.phase = :phase', { phase });
    }
    if (verifySection) {
      queryBuilder.andWhere('ar.verifySection = :verifySection', { verifySection });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(ar.ruleName LIKE :keyword OR ar.ruleCode LIKE :keyword OR ar.problemDesc LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('ar.ruleCode', 'ASC')
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

  async findOne(id: number): Promise<AuditRule> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`审计规则 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateAuditRuleDto): Promise<AuditRule> {
    const entity = await this.findOne(id);

    if (updateDto.ruleCode && updateDto.ruleCode !== entity.ruleCode) {
      const existing = await this.repository.findOne({
        where: { ruleCode: updateDto.ruleCode },
      });
      if (existing) {
        throw new ConflictException(`规则编码 ${updateDto.ruleCode} 已存在`);
      }
    }

    // 填充数据源名称
    await this.fillSourceNames(updateDto as CreateAuditRuleDto);

    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`审计规则 ID ${id} 不存在`);
    }
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

  async getExcelTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('审计规则');

    sheet.columns = [
      { header: '规则编码（留空自动生成）', key: 'ruleCode', width: 20 },
      { header: '规则名称*', key: 'ruleName', width: 30 },
      { header: '审计类型', key: 'auditType', width: 15 },
      { header: '阶段', key: 'phase', width: 15 },
      { header: '查证板块', key: 'verifySection', width: 15 },
      { header: '问题描述', key: 'problemDesc', width: 40 },
      { header: '比对方式', key: 'compareMethod', width: 30 },
      { header: '比对方式-LLM用', key: 'compareMethodLlm', width: 30 },
      { header: '审计依据内容', key: 'auditBasis', width: 40 },
      { header: '数据源1编码', key: 'source1Code', width: 20 },
      { header: '数据源2编码', key: 'source2Code', width: 20 },
      { header: '数据源3编码', key: 'source3Code', width: 20 },
      { header: '数据源4编码', key: 'source4Code', width: 20 },
      { header: '数据源5编码', key: 'source5Code', width: 20 },
      { header: '法条编码', key: 'lawClauseCode', width: 20 },
      { header: '备注', key: 'remark', width: 30 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    return workbook;
  }

  async importFromExcel(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new Error('Excel文件格式错误');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

    for (const row of rows) {
      try {
        let ruleCode = row.getCell(1).text?.trim();
        const ruleName = row.getCell(2).text?.trim();

        if (!ruleName) {
          if (ruleCode) {
            errors.push(`第${row.number}行：规则名称为必填项`);
            failed++;
          }
          continue;
        }

        const dto: CreateAuditRuleDto = {
          ruleCode: ruleCode || undefined,
          ruleName,
          auditType: row.getCell(3).text?.trim() || undefined,
          phase: row.getCell(4).text?.trim() || undefined,
          verifySection: row.getCell(5).text?.trim() || undefined,
          problemDesc: row.getCell(6).text?.trim() || undefined,
          compareMethod: row.getCell(7).text?.trim() || undefined,
          compareMethodLlm: row.getCell(8).text?.trim() || undefined,
          auditBasis: row.getCell(9).text?.trim() || undefined,
          source1Code: row.getCell(10).text?.trim() || undefined,
          source2Code: row.getCell(11).text?.trim() || undefined,
          source3Code: row.getCell(12).text?.trim() || undefined,
          source4Code: row.getCell(13).text?.trim() || undefined,
          source5Code: row.getCell(14).text?.trim() || undefined,
          lawClauseCode: row.getCell(15).text?.trim() || undefined,
          remark: row.getCell(16).text?.trim() || undefined,
        };

        // 自动生成编码
        if (!dto.ruleCode) {
          dto.ruleCode = await this.generateRuleCode(dto);
        }

        // 填充数据源名称
        await this.fillSourceNames(dto);

        const existing = await this.repository.findOne({ where: { ruleCode: dto.ruleCode } });
        if (existing) {
          Object.assign(existing, dto);
          await this.repository.save(existing);
        } else {
          const entity = this.repository.create(dto);
          await this.repository.save(entity);
        }
        success++;
      } catch (error) {
        errors.push(`第${row.number}行：${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  async exportToExcel(query: QueryAuditRuleDto): Promise<ExcelJS.Workbook> {
    const queryBuilder = this.repository.createQueryBuilder('ar');
    
    if (query.status !== undefined) {
      queryBuilder.andWhere('ar.status = :status', { status: query.status });
    }
    if (query.keyword) {
      queryBuilder.andWhere(
        '(ar.ruleName LIKE :keyword OR ar.ruleCode LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    queryBuilder.orderBy('ar.ruleCode', 'ASC');
    const data = await queryBuilder.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('审计规则');

    sheet.columns = [
      { header: '编码', key: 'ruleCode', width: 15 },
      { header: '名称', key: 'ruleName', width: 30 },
      { header: '审计类型', key: 'auditType', width: 12 },
      { header: '阶段', key: 'phase', width: 12 },
      { header: '查证板块', key: 'verifySection', width: 12 },
      { header: '问题描述', key: 'problemDesc', width: 40 },
      { header: '比对方式', key: 'compareMethod', width: 30 },
      { header: '比对方式-LLM', key: 'compareMethodLlm', width: 30 },
      { header: '审计依据', key: 'auditBasis', width: 40 },
      { header: '数据源1', key: 'source1', width: 25 },
      { header: '数据源2', key: 'source2', width: 25 },
      { header: '数据源3', key: 'source3', width: 25 },
      { header: '数据源4', key: 'source4', width: 25 },
      { header: '数据源5', key: 'source5', width: 25 },
      { header: '法条编码', key: 'lawClauseCode', width: 15 },
      { header: '状态', key: 'status', width: 8 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    for (const item of data) {
      sheet.addRow({
        ruleCode: item.ruleCode,
        ruleName: item.ruleName,
        auditType: item.auditType || '',
        phase: item.phase || '',
        verifySection: item.verifySection || '',
        problemDesc: item.problemDesc || '',
        compareMethod: item.compareMethod || '',
        compareMethodLlm: item.compareMethodLlm || '',
        auditBasis: item.auditBasis || '',
        source1: item.source1Code ? `${item.source1Code} - ${item.source1Name || ''}` : '',
        source2: item.source2Code ? `${item.source2Code} - ${item.source2Name || ''}` : '',
        source3: item.source3Code ? `${item.source3Code} - ${item.source3Name || ''}` : '',
        source4: item.source4Code ? `${item.source4Code} - ${item.source4Name || ''}` : '',
        source5: item.source5Code ? `${item.source5Code} - ${item.source5Name || ''}` : '',
        lawClauseCode: item.lawClauseCode || '',
        status: item.status === 1 ? '启用' : '停用',
      });
    }

    return workbook;
  }

  async findAllActive(): Promise<AuditRule[]> {
    return this.repository.find({
      where: { status: 1 },
      order: { ruleCode: 'ASC' },
    });
  }

  /**
   * 根据数据源编码获取字段信息（供前端自动填充名称）
   */
  async getFieldByCode(fieldCode: string): Promise<{ fieldCode: string; fieldName: string } | null> {
    const field = await this.docFieldDefRepository.findOne({
      where: { fieldCode },
    });
    if (!field) return null;
    return { fieldCode: field.fieldCode, fieldName: field.fieldName };
  }
}
