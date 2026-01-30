import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawClause } from './entities/law-clause.entity';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LawClauseService {
  constructor(
    @InjectRepository(LawClause)
    private readonly repository: Repository<LawClause>,
  ) {}

  async create(data: Partial<LawClause>): Promise<LawClause> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(query: any): Promise<PaginationResultDto<LawClause>> {
    const { page = 1, pageSize = 10, keyword, status, lawDocumentId, lawCode, importanceLevel } = query;

    const queryBuilder = this.repository.createQueryBuilder('lc')
      .leftJoinAndSelect('lc.lawDocument', 'lawDocument');

    if (status !== undefined) {
      queryBuilder.andWhere('lc.status = :status', { status });
    }
    if (lawDocumentId) {
      queryBuilder.andWhere('lc.lawDocumentId = :lawDocumentId', { lawDocumentId });
    }
    if (lawCode) {
      queryBuilder.andWhere('lc.lawCode LIKE :lawCode', { lawCode: `%${lawCode}%` });
    }
    if (importanceLevel) {
      queryBuilder.andWhere('lc.importanceLevel = :importanceLevel', { importanceLevel });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(lc.clauseTitle LIKE :keyword OR lc.clauseText LIKE :keyword OR lc.clauseSummary LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('lc.lawCode', 'ASC')
      .addOrderBy('lc.clauseNo', 'ASC')
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

  async findOne(id: number): Promise<LawClause> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['lawDocument'],
    });
    if (!entity) {
      throw new NotFoundException(`条款 ID ${id} 不存在`);
    }
    return entity;
  }

  async findByLawDocumentId(lawDocumentId: number): Promise<LawClause[]> {
    return this.repository.find({
      where: { lawDocumentId, status: 1 },
      order: { clauseNo: 'ASC' },
    });
  }

  async update(id: number, data: Partial<LawClause>): Promise<LawClause> {
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

  async getExcelTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('法规条款');

    sheet.columns = [
      { header: '法规ID*', key: 'lawDocumentId', width: 12 },
      { header: '法规编号', key: 'lawCode', width: 20 },
      { header: '法规名称', key: 'lawName', width: 30 },
      { header: '条款编号*', key: 'clauseNo', width: 15 },
      { header: '条款标题', key: 'clauseTitle', width: 30 },
      { header: '条款内容', key: 'clauseText', width: 60 },
      { header: '条款要点', key: 'clauseSummary', width: 40 },
      { header: '层级', key: 'levelLabel', width: 10 },
      { header: '上级条款编号', key: 'parentClauseNo', width: 15 },
      { header: '关键词', key: 'keywords', width: 30 },
      { header: '主题标签', key: 'topicTags', width: 30 },
      { header: '重要程度', key: 'importanceLevel', width: 12 },
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
    
    try {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (error) {
      throw new BadRequestException(`Excel文件解析失败：${error.message}。请确保上传的是有效的xlsx格式文件。`);
    }

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new BadRequestException('Excel文件中没有找到工作表');
    }
    
    if (sheet.rowCount < 2) {
      throw new BadRequestException('Excel文件中没有数据行');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

    for (const row of rows) {
      try {
        const lawDocumentId = parseInt(row.getCell(1).text);
        const clauseNo = row.getCell(4).text?.trim();

        if (!lawDocumentId || !clauseNo) {
          if (lawDocumentId || clauseNo) {
            errors.push(`第${row.number}行：法规ID和条款编号为必填项`);
            failed++;
          }
          continue;
        }

        const data: Partial<LawClause> = {
          lawDocumentId,
          lawCode: row.getCell(2).text?.trim() || undefined,
          lawName: row.getCell(3).text?.trim() || undefined,
          clauseNo,
          clauseTitle: row.getCell(5).text?.trim() || undefined,
          clauseText: row.getCell(6).text?.trim() || undefined,
          clauseSummary: row.getCell(7).text?.trim() || undefined,
          levelLabel: row.getCell(8).text?.trim() || undefined,
          parentClauseNo: row.getCell(9).text?.trim() || undefined,
          keywords: row.getCell(10).text?.trim() || undefined,
          topicTags: row.getCell(11).text?.trim() || undefined,
          importanceLevel: row.getCell(12).text?.trim() || undefined,
          remark: row.getCell(13).text?.trim() || undefined,
        };

        const entity = this.repository.create(data);
        await this.repository.save(entity);
        success++;
      } catch (error) {
        errors.push(`第${row.number}行：${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  async findAllActive(): Promise<LawClause[]> {
    return this.repository.find({
      where: { status: 1 },
      order: { lawCode: 'ASC', clauseNo: 'ASC' },
    });
  }
}

