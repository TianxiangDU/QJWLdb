import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { LawDocument } from './entities/law-document.entity';
import { CreateLawDocumentDto } from './dto/create-law-document.dto';
import { UpdateLawDocumentDto } from './dto/update-law-document.dto';
import { QueryLawDocumentDto } from './dto/query-law-document.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LawDocumentService {
  constructor(
    @InjectRepository(LawDocument)
    private readonly repository: Repository<LawDocument>,
  ) {}

  async create(createDto: CreateLawDocumentDto): Promise<LawDocument> {
    const existing = await this.repository.findOne({
      where: { lawCode: createDto.lawCode },
    });
    if (existing) {
      throw new ConflictException(`法规编号 ${createDto.lawCode} 已存在`);
    }

    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(query: QueryLawDocumentDto): Promise<PaginationResultDto<LawDocument>> {
    const { page = 1, pageSize = 10, keyword, status, lawCode, lawCategory, lawStatus } = query;

    const queryBuilder = this.repository.createQueryBuilder('ld');

    if (status !== undefined) {
      queryBuilder.andWhere('ld.status = :status', { status });
    }
    if (lawCode) {
      queryBuilder.andWhere('ld.lawCode LIKE :lawCode', { lawCode: `%${lawCode}%` });
    }
    if (lawCategory) {
      queryBuilder.andWhere('ld.lawCategory = :lawCategory', { lawCategory });
    }
    if (lawStatus) {
      queryBuilder.andWhere('ld.lawStatus = :lawStatus', { lawStatus });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(ld.lawName LIKE :keyword OR ld.summary LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('ld.createdAt', 'DESC')
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

  async findOne(id: number): Promise<LawDocument> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['clauses'],
    });
    if (!entity) {
      throw new NotFoundException(`法规 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateLawDocumentDto): Promise<LawDocument> {
    const entity = await this.findOne(id);

    if (updateDto.lawCode && updateDto.lawCode !== entity.lawCode) {
      const existing = await this.repository.findOne({
        where: { lawCode: updateDto.lawCode },
      });
      if (existing) {
        throw new ConflictException(`法规编号 ${updateDto.lawCode} 已存在`);
      }
    }

    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`法规 ID ${id} 不存在`);
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
    const sheet = workbook.addWorksheet('法规与标准');

    sheet.columns = [
      { header: '法规编号*', key: 'lawCode', width: 20 },
      { header: '法规名称*', key: 'lawName', width: 40 },
      { header: '文种类别', key: 'lawCategory', width: 15 },
      { header: '发布单位', key: 'issueOrg', width: 25 },
      { header: '发布日期', key: 'issueDate', width: 15 },
      { header: '实施日期', key: 'effectiveDate', width: 15 },
      { header: '失效日期', key: 'expiryDate', width: 15 },
      { header: '适用地区', key: 'regionScope', width: 20 },
      { header: '适用行业', key: 'industryScope', width: 20 },
      { header: '当前状态', key: 'lawStatus', width: 12 },
      { header: '摘要', key: 'summary', width: 50 },
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
        const lawCode = row.getCell(1).text?.trim();
        const lawName = row.getCell(2).text?.trim();

        if (!lawCode || !lawName) {
          if (lawCode || lawName) {
            errors.push(`第${row.number}行：法规编号和名称为必填项`);
            failed++;
          }
          continue;
        }

        const dto: CreateLawDocumentDto = {
          lawCode,
          lawName,
          lawCategory: row.getCell(3).text?.trim() || undefined,
          issueOrg: row.getCell(4).text?.trim() || undefined,
          issueDate: row.getCell(5).text?.trim() || undefined,
          effectiveDate: row.getCell(6).text?.trim() || undefined,
          expiryDate: row.getCell(7).text?.trim() || undefined,
          regionScope: row.getCell(8).text?.trim() || undefined,
          industryScope: row.getCell(9).text?.trim() || undefined,
          lawStatus: row.getCell(10).text?.trim() || '有效',
          summary: row.getCell(11).text?.trim() || undefined,
          remark: row.getCell(12).text?.trim() || undefined,
        };

        const existing = await this.repository.findOne({ where: { lawCode } });
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

  async findAllActive(): Promise<LawDocument[]> {
    return this.repository.find({
      where: { status: 1 },
      order: { lawCode: 'ASC' },
    });
  }
}

