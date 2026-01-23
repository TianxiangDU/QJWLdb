import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';

/**
 * 表信息
 */
export interface TableInfo {
  tableName: string;
  tableComment: string;
  estimatedRows: number;
  createTime: string;
  updateTime: string;
}

/**
 * 列信息
 */
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  comment: string;
  key: string;
  extra: string;
}

/**
 * 索引信息
 */
export interface IndexInfo {
  indexName: string;
  columnName: string;
  nonUnique: boolean;
  indexType: string;
}

/**
 * 外键信息
 */
export interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

/**
 * 表详情
 */
export interface TableDetail {
  tableName: string;
  tableComment: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

/**
 * 数据库元数据服务
 * 通过查询 information_schema 获取数据库结构信息
 */
@Injectable()
export class MetaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取当前数据库名
   */
  private async getDatabaseName(): Promise<string> {
    const result = await this.dataSource.query('SELECT DATABASE() as db');
    return result[0].db;
  }

  /**
   * 获取所有表信息
   */
  async getTables(): Promise<TableInfo[]> {
    const dbName = await this.getDatabaseName();

    const sql = `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_COMMENT as tableComment,
        TABLE_ROWS as estimatedRows,
        CREATE_TIME as createTime,
        UPDATE_TIME as updateTime
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;

    const result = await this.dataSource.query(sql, [dbName]);

    // 获取精确行数（对小表使用 COUNT）
    const tables = await Promise.all(
      result.map(async (row: any) => {
        let exactRows = Number(row.estimatedRows) || 0;
        // 对估计行数小于 10000 的表获取精确行数
        if (exactRows < 10000) {
          try {
            const countResult = await this.dataSource.query(
              `SELECT COUNT(*) as cnt FROM \`${row.tableName}\``
            );
            exactRows = Number(countResult[0]?.cnt) || 0;
          } catch {
            // 忽略错误，使用估计值
          }
        }
        return {
          tableName: row.tableName,
          tableComment: row.tableComment || '',
          estimatedRows: exactRows,
          createTime: row.createTime?.toISOString?.() || '',
          updateTime: row.updateTime?.toISOString?.() || '',
        };
      })
    );

    return tables;
  }

  /**
   * 获取表详情（字段、索引、外键）
   */
  async getTableDetail(tableName: string): Promise<TableDetail> {
    const dbName = await this.getDatabaseName();

    // 检查表是否存在
    const tableExists = await this.dataSource.query(
      `SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [dbName, tableName],
    );

    if (!tableExists.length) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 获取表注释
    const tableInfo = await this.dataSource.query(
      `SELECT TABLE_COMMENT as tableComment FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [dbName, tableName],
    );

    // 获取列信息
    const columns = await this.getColumns(dbName, tableName);

    // 获取索引信息
    const indexes = await this.getIndexes(dbName, tableName);

    // 获取外键信息
    const foreignKeys = await this.getForeignKeys(dbName, tableName);

    return {
      tableName,
      tableComment: tableInfo[0]?.tableComment || '',
      columns,
      indexes,
      foreignKeys,
    };
  }

  /**
   * 获取表的列信息
   */
  private async getColumns(dbName: string, tableName: string): Promise<ColumnInfo[]> {
    const sql = `
      SELECT 
        COLUMN_NAME as name,
        COLUMN_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_COMMENT as comment,
        COLUMN_KEY as \`key\`,
        EXTRA as extra
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;

    const result = await this.dataSource.query(sql, [dbName, tableName]);

    return result.map((row: any) => ({
      name: row.name,
      type: row.type,
      nullable: row.nullable === 'YES',
      defaultValue: row.defaultValue,
      comment: row.comment || '',
      key: row.key || '',
      extra: row.extra || '',
    }));
  }

  /**
   * 获取表的索引信息
   */
  private async getIndexes(dbName: string, tableName: string): Promise<IndexInfo[]> {
    const sql = `
      SELECT 
        INDEX_NAME as indexName,
        COLUMN_NAME as columnName,
        NON_UNIQUE as nonUnique,
        INDEX_TYPE as indexType
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `;

    const result = await this.dataSource.query(sql, [dbName, tableName]);

    return result.map((row: any) => ({
      indexName: row.indexName,
      columnName: row.columnName,
      nonUnique: row.nonUnique === 1,
      indexType: row.indexType,
    }));
  }

  /**
   * 获取表的外键信息
   */
  private async getForeignKeys(dbName: string, tableName: string): Promise<ForeignKeyInfo[]> {
    const sql = `
      SELECT 
        CONSTRAINT_NAME as constraintName,
        COLUMN_NAME as columnName,
        REFERENCED_TABLE_NAME as referencedTable,
        REFERENCED_COLUMN_NAME as referencedColumn
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY CONSTRAINT_NAME, ORDINAL_POSITION
    `;

    const result = await this.dataSource.query(sql, [dbName, tableName]);

    return result.map((row: any) => ({
      constraintName: row.constraintName,
      columnName: row.columnName,
      referencedTable: row.referencedTable,
      referencedColumn: row.referencedColumn,
    }));
  }

  /**
   * 导出数据字典 Excel
   */
  async exportDataDict(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QJWLdb';
    workbook.created = new Date();

    // 获取所有表
    const tables = await this.getTables();

    // 创建目录页
    const indexSheet = workbook.addWorksheet('目录');
    indexSheet.columns = [
      { header: '序号', key: 'index', width: 8 },
      { header: '表名', key: 'tableName', width: 30 },
      { header: '表说明', key: 'tableComment', width: 40 },
      { header: '预估行数', key: 'estimatedRows', width: 15 },
    ];

    this.styleHeaderRow(indexSheet);

    tables.forEach((table, i) => {
      indexSheet.addRow({
        index: i + 1,
        tableName: table.tableName,
        tableComment: table.tableComment,
        estimatedRows: table.estimatedRows,
      });
    });

    // 为每个表创建详情页
    for (const table of tables) {
      const detail = await this.getTableDetail(table.tableName);
      
      // 表名可能太长，截取前 31 个字符（Excel 工作表名限制）
      const sheetName = table.tableName.slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      // 表信息
      sheet.addRow(['表名', table.tableName]);
      sheet.addRow(['表说明', table.tableComment]);
      sheet.addRow([]);

      // 字段信息
      sheet.addRow(['字段列表']);
      const columnsHeaderRow = sheet.addRow(['字段名', '类型', '可空', '默认值', '键', '说明']);
      columnsHeaderRow.font = { bold: true };
      columnsHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      columnsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

      for (const col of detail.columns) {
        sheet.addRow([
          col.name,
          col.type,
          col.nullable ? 'YES' : 'NO',
          col.defaultValue || '',
          col.key,
          col.comment,
        ]);
      }

      // 索引信息
      if (detail.indexes.length > 0) {
        sheet.addRow([]);
        sheet.addRow(['索引列表']);
        const indexHeaderRow = sheet.addRow(['索引名', '字段', '是否唯一', '索引类型']);
        indexHeaderRow.font = { bold: true };
        indexHeaderRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF70AD47' },
        };
        indexHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        for (const idx of detail.indexes) {
          sheet.addRow([
            idx.indexName,
            idx.columnName,
            idx.nonUnique ? '否' : '是',
            idx.indexType,
          ]);
        }
      }

      // 外键信息
      if (detail.foreignKeys.length > 0) {
        sheet.addRow([]);
        sheet.addRow(['外键列表']);
        const fkHeaderRow = sheet.addRow(['约束名', '字段', '关联表', '关联字段']);
        fkHeaderRow.font = { bold: true };
        fkHeaderRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFED7D31' },
        };
        fkHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        for (const fk of detail.foreignKeys) {
          sheet.addRow([
            fk.constraintName,
            fk.columnName,
            fk.referencedTable,
            fk.referencedColumn,
          ]);
        }
      }

      // 设置列宽
      sheet.columns = [
        { width: 25 },
        { width: 25 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 40 },
      ];
    }

    return workbook;
  }

  /**
   * 设置表头行样式
   */
  private styleHeaderRow(sheet: ExcelJS.Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
  }
}
