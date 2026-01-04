import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AuditRule } from './entities/audit-rule.entity';
import { CreateAuditRuleDto } from './dto/create-audit-rule.dto';
import { UpdateAuditRuleDto } from './dto/update-audit-rule.dto';
import { QueryAuditRuleDto } from './dto/query-audit-rule.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AuditRuleService {
  constructor(
    @InjectRepository(AuditRule)
    private readonly repository: Repository<AuditRule>,
  ) {}

  async create(createDto: CreateAuditRuleDto): Promise<AuditRule> {
    const existing = await this.repository.findOne({
      where: { ruleCode: createDto.ruleCode },
    });
    if (existing) {
      throw new ConflictException(`规则编码 ${createDto.ruleCode} 已存在`);
    }

    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(query: QueryAuditRuleDto): Promise<PaginationResultDto<AuditRule>> {
    const { page = 1, pageSize = 10, keyword, status, ruleCode, ruleCategory, riskLevel, projectPhase } = query;

    const queryBuilder = this.repository.createQueryBuilder('ar');

    if (status !== undefined) {
      queryBuilder.andWhere('ar.status = :status', { status });
    }
    if (ruleCode) {
      queryBuilder.andWhere('ar.ruleCode LIKE :ruleCode', { ruleCode: `%${ruleCode}%` });
    }
    if (ruleCategory) {
      queryBuilder.andWhere('ar.ruleCategory = :ruleCategory', { ruleCategory });
    }
    if (riskLevel) {
      queryBuilder.andWhere('ar.riskLevel = :riskLevel', { riskLevel });
    }
    if (projectPhase) {
      queryBuilder.andWhere('ar.projectPhase LIKE :projectPhase', { projectPhase: `%${projectPhase}%` });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(ar.ruleName LIKE :keyword OR ar.bizDescription LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('ar.createdAt', 'DESC')
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
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['fieldLinks', 'fieldLinks.docType', 'fieldLinks.docField', 'lawLinks', 'lawLinks.lawDocument', 'lawLinks.lawClause', 'examples'],
    });
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
      { header: '规则编码*', key: 'ruleCode', width: 20 },
      { header: '规则名称*', key: 'ruleName', width: 30 },
      { header: '规则分类', key: 'ruleCategory', width: 15 },
      { header: '业务说明', key: 'bizDescription', width: 40 },
      { header: '比对方法', key: 'compareMethod', width: 30 },
      { header: '风险等级', key: 'riskLevel', width: 12 },
      { header: '适用阶段', key: 'projectPhase', width: 20 },
      { header: '适用类型', key: 'projectType', width: 20 },
      { header: '适用地区', key: 'region', width: 15 },
      { header: '适用业主', key: 'ownerOrg', width: 20 },
      { header: '版本号', key: 'version', width: 10 },
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
        const ruleCode = row.getCell(1).text?.trim();
        const ruleName = row.getCell(2).text?.trim();

        if (!ruleCode || !ruleName) {
          if (ruleCode || ruleName) {
            errors.push(`第${row.number}行：规则编码和名称为必填项`);
            failed++;
          }
          continue;
        }

        const dto: CreateAuditRuleDto = {
          ruleCode,
          ruleName,
          ruleCategory: row.getCell(3).text?.trim() || undefined,
          bizDescription: row.getCell(4).text?.trim() || undefined,
          compareMethod: row.getCell(5).text?.trim() || undefined,
          riskLevel: row.getCell(6).text?.trim() || undefined,
          projectPhase: row.getCell(7).text?.trim() || undefined,
          projectType: row.getCell(8).text?.trim() || undefined,
          region: row.getCell(9).text?.trim() || undefined,
          ownerOrg: row.getCell(10).text?.trim() || undefined,
          version: parseInt(row.getCell(11).text) || 1,
          remark: row.getCell(12).text?.trim() || undefined,
        };

        const existing = await this.repository.findOne({ where: { ruleCode } });
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

  async findAllActive(): Promise<AuditRule[]> {
    return this.repository.find({
      where: { status: 1 },
      order: { ruleCode: 'ASC' },
    });
  }
}

