import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  ObjectLiteral,
  SelectQueryBuilder,
  DeepPartial,
} from 'typeorm';
import {
  PaginatedResult,
  BatchOperationResult,
  ResourceConfig,
  BaseQueryParams,
  ImportResult,
  ImportOptions,
  ImportMode,
} from '../interfaces/crud.interface';
import { CodeService, CodePattern } from './code.service';
import * as ExcelJS from 'exceljs';

/**
 * 通用 CRUD 服务基类
 * 提供标准的增删改查、批量操作、自动编码、导入导出功能
 */
export abstract class BaseCrudService<T extends ObjectLiteral> {
  protected abstract readonly repository: Repository<T>;
  protected abstract readonly config: ResourceConfig<T>;

  /**
   * 编码服务（可选注入）
   * 子类需要在构造函数中注入
   */
  protected codeService?: CodeService;

  /**
   * 获取唯一键查询条件
   */
  protected getUniqueKeyWhere(dto: any): FindOptionsWhere<T> | null {
    const { uniqueKey } = this.config;
    if (!uniqueKey) return null;

    const keys = Array.isArray(uniqueKey) ? uniqueKey : [uniqueKey];
    const where: any = {};

    for (const key of keys) {
      if (dto[key] !== undefined && dto[key] !== null) {
        where[key] = dto[key];
      } else {
        return null;
      }
    }

    return where;
  }

  /**
   * 获取备用唯一键查询条件
   */
  protected getSecondaryUniqueKeyWhere(dto: any): FindOptionsWhere<T> | null {
    const { secondaryUniqueKey } = this.config;
    if (!secondaryUniqueKey?.length) return null;

    const where: any = {};
    for (const key of secondaryUniqueKey) {
      if (dto[key] !== undefined && dto[key] !== null) {
        where[key] = dto[key];
      } else {
        return null;
      }
    }

    return where;
  }

  /**
   * 生成自动编码
   */
  protected async generateCode(dto: any): Promise<string | null> {
    if (!this.codeService || !this.config.supportsAutoCode) {
      return null;
    }

    const codeField = this.config.codeField || 'code';
    
    // 如果已有编码，不生成
    if (dto[codeField]) {
      return dto[codeField];
    }

    // 判断是否为子资源
    const parentCodeField = this.config.parentCodeField;
    if (parentCodeField && dto[parentCodeField]) {
      // 子资源编码格式
      return this.codeService.next(
        this.config.resourceType,
        'PARENT-PREFIX-SEQ4',
        dto[parentCodeField],
      );
    } else {
      // 主资源编码格式
      return this.codeService.next(this.config.resourceType, 'PREFIX-YYYYMM-SEQ6');
    }
  }

  /**
   * 创建记录（支持自动编码）
   */
  async create(createDto: DeepPartial<T>): Promise<T> {
    const dto = { ...createDto } as any;
    const codeField = this.config.codeField || 'code';

    // 生成自动编码
    if (this.config.supportsAutoCode && !dto[codeField]) {
      const code = await this.generateCode(dto);
      if (code) {
        dto[codeField] = code;
      }
    }

    // 检查编码唯一性
    if (dto[codeField]) {
      const existing = await this.repository.findOne({
        where: { [codeField]: dto[codeField] } as any,
      });
      if (existing) {
        throw new ConflictException(`编码 ${dto[codeField]} 已存在`);
      }
    }

    // 检查其他唯一键冲突
    const uniqueWhere = this.getUniqueKeyWhere(dto);
    if (uniqueWhere) {
      const existing = await this.repository.findOne({ where: uniqueWhere });
      if (existing) {
        const keyStr = JSON.stringify(uniqueWhere);
        throw new ConflictException(`${this.config.resourceName}已存在：${keyStr}`);
      }
    }

    const entity = this.repository.create(dto as any);
    return this.repository.save(entity as any);
  }

  /**
   * 查询列表（分页）
   */
  async findAll(query: BaseQueryParams & Record<string, any>): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      status,
      sortBy,
      sortOrder,
      ...filters
    } = query;

    const limitedPageSize = Math.min(pageSize, 100);
    const qb = this.repository.createQueryBuilder('entity');

    // 状态筛选
    if (status !== undefined && status !== null) {
      qb.andWhere('entity.status = :status', { status: Number(status) });
    }

    // 关键字搜索
    if (keyword && this.config.searchFields?.length) {
      const searchConditions = this.config.searchFields
        .map((field, i) => `entity.${String(field)} LIKE :keyword${i}`)
        .join(' OR ');
      const params: any = {};
      this.config.searchFields.forEach((_, i) => {
        params[`keyword${i}`] = `%${keyword}%`;
      });
      qb.andWhere(`(${searchConditions})`, params);
    }

    // 应用额外的筛选条件
    this.applyFilters(qb, filters);

    // 排序
    const finalSortBy = sortBy || this.config.defaultSortField || 'createdAt';
    const finalSortOrder = sortOrder || this.config.defaultSortOrder || 'DESC';
    qb.orderBy(`entity.${String(finalSortBy)}`, finalSortOrder);

    // 分页
    qb.skip((page - 1) * limitedPageSize).take(limitedPageSize);

    const [list, total] = await qb.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize: limitedPageSize,
      totalPages: Math.ceil(total / limitedPageSize),
    };
  }

  /**
   * 子类可重写此方法添加自定义筛选逻辑
   */
  protected applyFilters(
    qb: SelectQueryBuilder<T>,
    filters: Record<string, any>,
  ): void {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    }
  }

  /**
   * 获取单条记录
   */
  async findOne(id: number, relations?: string[]): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`${this.config.resourceName} ID ${id} 不存在`);
    }

    return entity;
  }

  /**
   * 根据编码获取记录
   */
  async findByCode(code: string, relations?: string[]): Promise<T> {
    const codeField = this.config.codeField || 'code';
    const entity = await this.repository.findOne({
      where: { [codeField]: code } as any,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`${this.config.resourceName} 编码 ${code} 不存在`);
    }

    return entity;
  }

  /**
   * 更新记录（支持乐观锁）
   */
  async update(id: number, updateDto: DeepPartial<T> & { rowVersion?: number }): Promise<T> {
    const entity = await this.findOne(id);
    const dto = { ...updateDto } as any;
    const codeField = this.config.codeField || 'code';

    // 乐观锁检查
    if (dto.rowVersion !== undefined && (entity as any).rowVersion !== undefined) {
      if (dto.rowVersion !== (entity as any).rowVersion) {
        throw new ConflictException('数据已被他人更新，请刷新后重试');
      }
    }

    // 不允许修改编码
    if (dto[codeField] && dto[codeField] !== (entity as any)[codeField]) {
      throw new BadRequestException('编码不允许修改');
    }

    // 检查唯一键冲突（排除自身）
    const uniqueWhere = this.getUniqueKeyWhere(dto);
    if (uniqueWhere) {
      const existing = await this.repository.findOne({ where: uniqueWhere });
      if (existing && (existing as any).id !== id) {
        const keyStr = JSON.stringify(uniqueWhere);
        throw new ConflictException(`${this.config.resourceName}已存在：${keyStr}`);
      }
    }

    // 移除 rowVersion，让 TypeORM 的 @VersionColumn 自动处理
    delete dto.rowVersion;

    Object.assign(entity, dto);
    return this.repository.save(entity as any);
  }

  /**
   * 删除记录
   */
  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity as any);
  }

  /**
   * 批量启用
   */
  async batchEnable(ids: number[]): Promise<BatchOperationResult> {
    if (!ids?.length) {
      throw new BadRequestException('请选择要启用的记录');
    }

    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ status: 1 } as any)
      .whereInIds(ids)
      .execute();

    return { affected: result.affected || 0 };
  }

  /**
   * 批量停用
   */
  async batchDisable(ids: number[]): Promise<BatchOperationResult> {
    if (!ids?.length) {
      throw new BadRequestException('请选择要停用的记录');
    }

    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ status: 0 } as any)
      .whereInIds(ids)
      .execute();

    return { affected: result.affected || 0 };
  }

  /**
   * 批量删除
   */
  async batchDelete(ids: number[]): Promise<BatchOperationResult> {
    if (!ids?.length) {
      throw new BadRequestException('请选择要删除的记录');
    }

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(ids)
      .execute();

    return { affected: result.affected || 0 };
  }

  /**
   * 获取 Excel 导入模板
   */
  async getExcelTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(this.config.resourceName);

    if (!this.config.excelColumns?.length) {
      throw new BadRequestException('未配置 Excel 列');
    }

    // 第一行：列名
    sheet.columns = this.config.excelColumns.map((col) => ({
      header: col.required ? `${col.header}*` : col.header,
      key: String(col.key),
      width: col.width || 20,
    }));

    // 第二行：列说明
    const descRow = sheet.getRow(2);
    this.config.excelColumns.forEach((col, i) => {
      const description = col.description || '';
      const codeHint = String(col.key) === 'code' ? '（留空自动生成）' : '';
      descRow.getCell(i + 1).value = description + codeHint;
    });
    descRow.font = { italic: true, color: { argb: 'FF666666' } };

    // 设置表头样式
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    return workbook;
  }

  /**
   * 从 Excel 导入（支持 upsert 和 dryRun）
   */
  async importFromExcel(
    buffer: Buffer,
    options: ImportOptions = { mode: 'upsert', dryRun: false },
  ): Promise<ImportResult> {
    if (!this.config.excelColumns?.length) {
      throw new BadRequestException('未配置 Excel 列');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new BadRequestException('Excel 文件格式错误');
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      duplicateRows: [],
    };

    // 解析所有行
    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];
    const parsedRows: Array<{ rowNum: number; data: any }> = [];
    const uniqueKeyMap = new Map<string, number>(); // 用于检测文件内重复

    for (const row of rows) {
      const rowNum = row.number;
      try {
        const dto: any = {};
        let hasData = false;

        for (let i = 0; i < this.config.excelColumns.length; i++) {
          const col = this.config.excelColumns[i];
          let value = row.getCell(i + 1).text?.trim();

          if (value) {
            hasData = true;
            if (col.transform) {
              value = col.transform(value);
            }
            dto[col.key] = value;
          } else if (col.required && String(col.key) !== 'code') {
            throw new Error(`${col.header}为必填项`);
          }
        }

        if (!hasData) continue;

        // 检查文件内重复
        const uniqueKey = this.buildUniqueKeyString(dto);
        if (uniqueKey && uniqueKeyMap.has(uniqueKey)) {
          result.duplicateRows!.push({
            row: rowNum,
            duplicateOf: uniqueKeyMap.get(uniqueKey)!,
            uniqueKey,
          });
          result.failed++;
          continue;
        }
        if (uniqueKey) {
          uniqueKeyMap.set(uniqueKey, rowNum);
        }

        parsedRows.push({ rowNum, data: dto });
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          message: error.message,
        });
      }
    }

    // 如果是 dryRun，不落库
    if (options.dryRun) {
      // 模拟检查每条记录
      for (const { rowNum, data } of parsedRows) {
        const existing = await this.findExistingByUniqueKey(data);
        if (existing) {
          if (options.mode === 'insertOnly') {
            result.failed++;
            result.errors.push({ row: rowNum, message: '记录已存在（insertOnly 模式）' });
          } else {
            result.updated++;
            result.success++;
          }
        } else {
          if (options.mode === 'updateOnly') {
            result.failed++;
            result.errors.push({ row: rowNum, message: '记录不存在（updateOnly 模式）' });
          } else {
            result.created++;
            result.success++;
          }
        }
      }
      return { ...result, isDryRun: true } as any;
    }

    // 实际导入
    for (const { rowNum, data } of parsedRows) {
      try {
        await this.upsertRow(data, options.mode, result, rowNum);
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          message: error.message,
        });
      }
    }

    return result;
  }

  /**
   * 构建唯一键字符串（用于文件内去重）
   */
  protected buildUniqueKeyString(dto: any): string | null {
    const codeField = this.config.codeField || 'code';
    if (dto[codeField]) {
      return `${String(codeField)}=${dto[codeField]}`;
    }

    const { uniqueKey, secondaryUniqueKey } = this.config;
    const keys = uniqueKey
      ? Array.isArray(uniqueKey) ? uniqueKey : [uniqueKey]
      : secondaryUniqueKey || [];

    if (!keys.length) return null;

    const parts: string[] = [];
    for (const key of keys) {
      if (dto[key] !== undefined && dto[key] !== null) {
        parts.push(`${String(key)}=${dto[key]}`);
      } else {
        return null;
      }
    }
    return parts.join(',');
  }

  /**
   * 根据唯一键查找已存在的记录
   */
  protected async findExistingByUniqueKey(dto: any): Promise<T | null> {
    const codeField = this.config.codeField || 'code';

    // 优先用编码查找
    if (dto[codeField]) {
      const byCode = await this.repository.findOne({
        where: { [codeField]: dto[codeField] } as any,
      });
      if (byCode) return byCode;
    }

    // 用主唯一键查找
    const uniqueWhere = this.getUniqueKeyWhere(dto);
    if (uniqueWhere) {
      const byUnique = await this.repository.findOne({ where: uniqueWhere });
      if (byUnique) return byUnique;
    }

    // 用备用唯一键查找
    const secondaryWhere = this.getSecondaryUniqueKeyWhere(dto);
    if (secondaryWhere) {
      const bySecondary = await this.repository.findOne({ where: secondaryWhere });
      if (bySecondary) return bySecondary;
    }

    return null;
  }

  /**
   * Upsert 单行数据
   */
  protected async upsertRow(
    dto: any,
    mode: ImportMode,
    result: ImportResult,
    rowNum: number,
  ): Promise<void> {
    const codeField = this.config.codeField || 'code';
    const existing = await this.findExistingByUniqueKey(dto);

    if (existing) {
      // 记录已存在
      if (mode === 'insertOnly') {
        throw new Error('记录已存在（insertOnly 模式）');
      }

      // 更新
      Object.assign(existing, dto);
      await this.repository.save(existing as any);
      result.updated++;
      result.success++;
    } else {
      // 记录不存在
      if (mode === 'updateOnly') {
        throw new Error('记录不存在（updateOnly 模式）');
      }

      // 生成编码
      if (this.config.supportsAutoCode && !dto[codeField]) {
        const code = await this.generateCode(dto);
        if (code) {
          dto[codeField] = code;
        }
      }

      // 新增
      const entity = this.repository.create(dto as any);
      await this.repository.save(entity as any);
      result.created++;
      result.success++;
    }
  }

  /**
   * 导出为 Excel
   */
  async exportToExcel(query?: any): Promise<ExcelJS.Workbook> {
    if (!this.config.excelColumns?.length) {
      throw new BadRequestException('未配置 Excel 列');
    }

    const { list } = await this.findAll({ ...query, page: 1, pageSize: 10000 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(this.config.resourceName);

    sheet.columns = this.config.excelColumns.map((col) => ({
      header: col.header,
      key: String(col.key),
      width: col.width || 20,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const item of list) {
      const rowData: any = {};
      for (const col of this.config.excelColumns) {
        let value = (item as any)[col.key];
        if (col.format) {
          value = col.format(value);
        }
        rowData[String(col.key)] = value;
      }
      sheet.addRow(rowData);
    }

    return workbook;
  }
}
