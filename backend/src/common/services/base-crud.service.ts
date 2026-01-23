import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  Like,
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
} from '../interfaces/crud.interface';
import * as ExcelJS from 'exceljs';

/**
 * 通用 CRUD 服务基类
 * 提供标准的增删改查、批量操作、导入导出功能
 */
export abstract class BaseCrudService<T extends ObjectLiteral> {
  protected abstract readonly repository: Repository<T>;
  protected abstract readonly config: ResourceConfig<T>;

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
        return null; // 如果缺少任何唯一键字段，返回 null
      }
    }

    return where;
  }

  /**
   * 创建记录
   */
  async create(createDto: DeepPartial<T>): Promise<T> {
    // 检查唯一键冲突
    const uniqueWhere = this.getUniqueKeyWhere(createDto);
    if (uniqueWhere) {
      const existing = await this.repository.findOne({ where: uniqueWhere });
      if (existing) {
        const keyStr = JSON.stringify(uniqueWhere);
        throw new ConflictException(`${this.config.resourceName}已存在：${keyStr}`);
      }
    }

    const entity = this.repository.create(createDto as any);
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

    // 限制分页大小
    const limitedPageSize = Math.min(pageSize, 100);

    const qb = this.repository.createQueryBuilder('entity');

    // 状态筛选
    if (status !== undefined && status !== null && status !== '') {
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
    // 默认实现：精确匹配
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
   * 更新记录
   */
  async update(id: number, updateDto: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);

    // 检查唯一键冲突（排除自身）
    const uniqueWhere = this.getUniqueKeyWhere(updateDto);
    if (uniqueWhere) {
      const existing = await this.repository.findOne({ where: uniqueWhere });
      if (existing && (existing as any).id !== id) {
        const keyStr = JSON.stringify(uniqueWhere);
        throw new ConflictException(`${this.config.resourceName}已存在：${keyStr}`);
      }
    }

    Object.assign(entity, updateDto);
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

    sheet.columns = this.config.excelColumns.map((col) => ({
      header: col.required ? `${col.header}*` : col.header,
      key: String(col.key),
      width: col.width || 20,
    }));

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
   * 从 Excel 导入
   */
  async importFromExcel(buffer: Buffer): Promise<ImportResult> {
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
      errors: [],
    };

    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

    for (const row of rows) {
      try {
        const dto: any = {};
        let hasData = false;

        // 解析每一列
        for (let i = 0; i < this.config.excelColumns.length; i++) {
          const col = this.config.excelColumns[i];
          let value = row.getCell(i + 1).text?.trim();

          if (value) {
            hasData = true;
            if (col.transform) {
              value = col.transform(value);
            }
            dto[col.key] = value;
          } else if (col.required) {
            throw new Error(`${col.header}为必填项`);
          }
        }

        if (!hasData) continue; // 跳过空行

        // 检查是否已存在，存在则更新，不存在则创建
        const uniqueWhere = this.getUniqueKeyWhere(dto);
        if (uniqueWhere) {
          const existing = await this.repository.findOne({ where: uniqueWhere });
          if (existing) {
            Object.assign(existing, dto);
            await this.repository.save(existing as any);
          } else {
            const entity = this.repository.create(dto as any);
            await this.repository.save(entity as any);
          }
        } else {
          const entity = this.repository.create(dto as any);
          await this.repository.save(entity as any);
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: row.number,
          message: error.message,
        });
      }
    }

    return result;
  }

  /**
   * 导出为 Excel
   */
  async exportToExcel(query?: any): Promise<ExcelJS.Workbook> {
    if (!this.config.excelColumns?.length) {
      throw new BadRequestException('未配置 Excel 列');
    }

    // 获取所有数据（不分页）
    const { list } = await this.findAll({ ...query, page: 1, pageSize: 10000 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(this.config.resourceName);

    sheet.columns = this.config.excelColumns.map((col) => ({
      header: col.header,
      key: String(col.key),
      width: col.width || 20,
    }));

    // 设置表头样式
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // 添加数据
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
