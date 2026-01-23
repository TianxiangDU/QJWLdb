import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DocFieldDef } from './entities/doc-field-def.entity';
import { DocType } from '../doc-type/entities/doc-type.entity';
import { CreateDocFieldDefDto } from './dto/create-doc-field-def.dto';
import { UpdateDocFieldDefDto } from './dto/update-doc-field-def.dto';
import { QueryDocFieldDefDto } from './dto/query-doc-field-def.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocFieldDefService {
  constructor(
    @InjectRepository(DocFieldDef)
    private readonly repository: Repository<DocFieldDef>,
    @InjectRepository(DocType)
    private readonly docTypeRepository: Repository<DocType>,
  ) {}

  async create(createDto: CreateDocFieldDefDto): Promise<DocFieldDef> {
    // 如果没有提供 fieldCode，自动生成
    let fieldCode = createDto.fieldCode;
    if (!fieldCode) {
      fieldCode = await this.generateFieldCode(createDto.docTypeId);
    } else {
      // 检查同一文件类型下字段编码唯一性
      const existing = await this.repository.findOne({
        where: {
          docTypeId: createDto.docTypeId,
          fieldCode: fieldCode,
        },
      });
      if (existing) {
        throw new ConflictException(
          `该文件类型下字段编码 ${fieldCode} 已存在`,
        );
      }
    }

    const entity = this.repository.create({
      ...createDto,
      fieldCode,
      processMethod: createDto.processMethod || 'default',
    });
    return this.repository.save(entity);
  }

  /**
   * 生成字段编码
   * 格式：{文件类型编码}-{序号3位}
   * 例如：QQTZ0101001-001
   */
  private async generateFieldCode(docTypeId: number): Promise<string> {
    // 获取文件类型编码
    const docType = await this.docTypeRepository.findOne({ where: { id: docTypeId } });
    if (!docType) {
      throw new NotFoundException(`文件类型 ID ${docTypeId} 不存在`);
    }

    const prefix = docType.code || `DT${docTypeId}`;

    // 获取该文件类型下的最大序号
    const maxField = await this.repository
      .createQueryBuilder('df')
      .select('df.fieldCode')
      .where('df.docTypeId = :docTypeId', { docTypeId })
      .andWhere('df.fieldCode LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('df.fieldCode', 'DESC')
      .getOne();

    let seq = 1;
    if (maxField && maxField.fieldCode) {
      const parts = maxField.fieldCode.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}-${String(seq).padStart(3, '0')}`;
  }

  async findAll(query: QueryDocFieldDefDto): Promise<PaginationResultDto<DocFieldDef>> {
    const { page = 1, pageSize = 10, keyword, status, docTypeIds, fieldCode, fieldCategory } = query;

    const queryBuilder = this.repository.createQueryBuilder('df')
      .leftJoinAndSelect('df.docType', 'docType');

    if (status !== undefined) {
      queryBuilder.andWhere('df.status = :status', { status });
    }
    if (docTypeIds && docTypeIds.length > 0) {
      queryBuilder.andWhere('df.docTypeId IN (:...docTypeIds)', { docTypeIds });
    }
    if (fieldCode) {
      queryBuilder.andWhere('df.fieldCode LIKE :fieldCode', { fieldCode: `%${fieldCode}%` });
    }
    if (fieldCategory) {
      queryBuilder.andWhere('df.fieldCategory = :fieldCategory', { fieldCategory });
    }
    if (keyword) {
      queryBuilder.andWhere(
        '(df.fieldName LIKE :keyword OR df.fieldDescription LIKE :keyword OR docType.name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy('docType.code', 'ASC')
      .addOrderBy('df.createdAt', 'DESC')
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

  async findOne(id: number): Promise<DocFieldDef> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['docType'],
    });
    if (!entity) {
      throw new NotFoundException(`关键信息字段 ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateDocFieldDefDto): Promise<DocFieldDef> {
    const entity = await this.findOne(id);

    // 如果要更新字段编码，检查唯一性
    if (updateDto.fieldCode && updateDto.fieldCode !== entity.fieldCode) {
      const docTypeId = updateDto.docTypeId || entity.docTypeId;
      const existing = await this.repository.findOne({
        where: {
          docTypeId,
          fieldCode: updateDto.fieldCode,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `该文件类型下字段编码 ${updateDto.fieldCode} 已存在`,
        );
      }
    }

    Object.assign(entity, updateDto);
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
    const sheet = workbook.addWorksheet('关键信息字段');

    sheet.columns = [
      { header: '文件类型ID*', key: 'docTypeId', width: 15 },
      { header: '字段编码（留空自动生成）', key: 'fieldCode', width: 25 },
      { header: '字段名称*', key: 'fieldName', width: 20 },
      { header: '字段类别', key: 'fieldCategory', width: 15 },
      { header: '是否必填(1/0)', key: 'requiredFlag', width: 15 },
      { header: '取值方式', key: 'valueSource', width: 25 },
      { header: '定位词（空格分隔）', key: 'anchorWord', width: 30 },
      { header: '枚举值（空格分隔）', key: 'enumOptions', width: 30 },
      { header: '示例数据', key: 'exampleValue', width: 25 },
      { header: '字段说明', key: 'fieldDescription', width: 40 },
      { header: '处理方式', key: 'processMethod', width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 添加说明行
    const noteRow = sheet.addRow({
      docTypeId: '填写文件类型的ID',
      fieldCode: '留空则自动生成',
      fieldName: '必填',
      fieldCategory: '文字/日期/金额/数量/枚举/其他',
      requiredFlag: '1=必填，0=非必填',
      valueSource: '如：封面、正文第X条',
      anchorWord: '多个用空格分隔',
      enumOptions: '字段类别为枚举时填写',
      exampleValue: '如：100000.00',
      fieldDescription: '字段用途说明',
      processMethod: '默认default',
    });
    noteRow.font = { italic: true, color: { argb: 'FF888888' } };

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
        const docTypeId = parseInt(row.getCell(1).text);
        let fieldCode = row.getCell(2).text?.trim();
        const fieldName = row.getCell(3).text?.trim();

        // 跳过说明行或空行
        if (row.getCell(1).text?.includes('说明') || row.getCell(1).text?.includes('填写')) continue;
        
        if (!docTypeId || !fieldName) {
          if (docTypeId || fieldCode || fieldName) {
            errors.push(`第${row.number}行：文件类型ID和字段名称为必填项`);
            failed++;
          }
          continue;
        }

        // 如果字段编码为空，自动生成
        if (!fieldCode) {
          const maxCode = await this.repository
            .createQueryBuilder('df')
            .select('MAX(df.fieldCode)', 'max')
            .where('df.docTypeId = :docTypeId', { docTypeId })
            .getRawOne();
          
          const lastNum = maxCode?.max ? parseInt(maxCode.max.split('-').pop() || '0') : 0;
          const docType = await this.docTypeRepository.findOne({ where: { id: docTypeId } });
          if (!docType) {
            errors.push(`第${row.number}行：文件类型ID ${docTypeId} 不存在`);
            failed++;
            continue;
          }
          fieldCode = `${docType.code}-${String(lastNum + 1).padStart(3, '0')}`;
        }

        const dto: CreateDocFieldDefDto = {
          docTypeId,
          fieldCode,
          fieldName,
          fieldCategory: row.getCell(4).text?.trim() || undefined,
          requiredFlag: parseInt(row.getCell(5).text) || 0,
          valueSource: row.getCell(6).text?.trim() || undefined,
          anchorWord: row.getCell(7).text?.trim() || undefined,
          enumOptions: row.getCell(8).text?.trim() || undefined,
          exampleValue: row.getCell(9).text?.trim() || undefined,
          fieldDescription: row.getCell(10).text?.trim() || undefined,
          processMethod: row.getCell(11).text?.trim() || 'default',
        };

        const existing = await this.repository.findOne({
          where: { docTypeId, fieldCode },
        });

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

  async findByDocTypeId(docTypeId: number): Promise<DocFieldDef[]> {
    return this.repository.find({
      where: { docTypeId, status: 1 },
      order: { fieldCode: 'ASC' },
    });
  }
}
