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
      { header: '文件类型（ID或编码）*', key: 'docTypeId', width: 20 },
      { header: '字段编码（留空自动生成）', key: 'fieldCode', width: 25 },
      { header: '字段名称*', key: 'fieldName', width: 20 },
      { header: '字段类别', key: 'fieldCategory', width: 15 },
      { header: '是否必填(1/0)', key: 'requiredFlag', width: 15 },
      { header: '取值方式', key: 'valueSource', width: 25 },
      { header: '定位词（空格分隔）', key: 'anchorWord', width: 30 },
      { header: '枚举值（空格分隔）', key: 'enumOptions', width: 30 },
      { header: '示例数据', key: 'exampleValue', width: 25 },
      { header: '字段说明', key: 'fieldDescription', width: 40 },
      { header: '输出格式', key: 'outputFormat', width: 20 },
      { header: '提取方法', key: 'extractMethod', width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 添加说明行
    const noteRow = sheet.addRow({
      docTypeId: '填写ID(数字)或编码(如DT001)',
      fieldCode: '留空则自动生成',
      fieldName: '必填',
      fieldCategory: '文字/日期/金额/数量/枚举/其他',
      requiredFlag: '1=必填，0=非必填',
      valueSource: '如：封面、正文第X条',
      anchorWord: '多个用空格分隔',
      enumOptions: '字段类别为枚举时填写',
      exampleValue: '如：100000.00',
      fieldDescription: '字段用途说明',
      outputFormat: '如：金额（元）',
      extractMethod: '如：正则匹配',
    });
    noteRow.font = { italic: true, color: { argb: 'FF888888' } };

    return workbook;
  }

  async importFromExcel(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    
    try {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (error) {
      throw new Error(`Excel文件解析失败：${error.message}。请确保上传的是有效的xlsx格式文件。`);
    }

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new Error('Excel文件中没有找到工作表');
    }
    
    if (sheet.rowCount < 2) {
      throw new Error('Excel文件中没有数据行');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // 读取表头，建立列名到列号的映射
    const headerRow = sheet.getRow(1);
    const columnMap: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      const headerText = cell.text?.trim().toLowerCase() || '';
      // 根据表头关键字匹配列
      if (headerText.includes('文件类型') && headerText.includes('id')) {
        columnMap['docTypeId'] = colNumber;
      } else if (headerText.includes('字段编码') || headerText.includes('编码')) {
        columnMap['fieldCode'] = colNumber;
      } else if (headerText.includes('字段名称') || headerText.includes('名称')) {
        columnMap['fieldName'] = colNumber;
      } else if (headerText.includes('字段类别') || headerText.includes('类别')) {
        columnMap['fieldCategory'] = colNumber;
      } else if (headerText.includes('必填')) {
        columnMap['requiredFlag'] = colNumber;
      } else if (headerText.includes('取值') || headerText.includes('位置')) {
        columnMap['valueSource'] = colNumber;
      } else if (headerText.includes('定位词')) {
        columnMap['anchorWord'] = colNumber;
      } else if (headerText.includes('枚举')) {
        columnMap['enumOptions'] = colNumber;
      } else if (headerText.includes('示例')) {
        columnMap['exampleValue'] = colNumber;
      } else if (headerText.includes('说明') || headerText.includes('描述')) {
        columnMap['fieldDescription'] = colNumber;
      } else if (headerText.includes('输出格式')) {
        columnMap['outputFormat'] = colNumber;
      } else if (headerText.includes('提取方法')) {
        columnMap['extractMethod'] = colNumber;
      }
    });

    // 如果没有找到关键列，使用默认列序
    if (!columnMap['docTypeId']) columnMap['docTypeId'] = 1;
    if (!columnMap['fieldCode']) columnMap['fieldCode'] = 2;
    if (!columnMap['fieldName']) columnMap['fieldName'] = 3;
    if (!columnMap['fieldCategory']) columnMap['fieldCategory'] = 4;
    if (!columnMap['requiredFlag']) columnMap['requiredFlag'] = 5;
    if (!columnMap['valueSource']) columnMap['valueSource'] = 6;
    if (!columnMap['anchorWord']) columnMap['anchorWord'] = 7;
    if (!columnMap['enumOptions']) columnMap['enumOptions'] = 8;
    if (!columnMap['exampleValue']) columnMap['exampleValue'] = 9;
    if (!columnMap['fieldDescription']) columnMap['fieldDescription'] = 10;
    if (!columnMap['outputFormat']) columnMap['outputFormat'] = 11;
    if (!columnMap['extractMethod']) columnMap['extractMethod'] = 12;

    // 辅助函数：获取单元格文本
    const getCellText = (row: ExcelJS.Row, key: string): string => {
      const colNum = columnMap[key];
      if (!colNum) return '';
      return row.getCell(colNum).text?.trim() || '';
    };

    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

    for (const row of rows) {
      try {
        const docTypeIdText = getCellText(row, 'docTypeId');
        let fieldCode = getCellText(row, 'fieldCode');
        const fieldName = getCellText(row, 'fieldName');

        // 跳过说明行或空行
        if (docTypeIdText.includes('说明') || docTypeIdText.includes('填写') || docTypeIdText.includes('ID')) continue;
        
        // 检查是否为空行
        if (!docTypeIdText && !fieldCode && !fieldName) {
          continue;
        }

        // 验证字段名称
        if (!fieldName) {
          errors.push(`第${row.number}行：字段名称为必填项`);
          failed++;
          continue;
        }

        // 查找文件类型：支持ID或编码
        let docType: DocType | null = null;
        
        const parsedId = parseInt(docTypeIdText);
        if (!isNaN(parsedId)) {
          // 如果是数字，按ID查找
          docType = await this.docTypeRepository.findOne({ where: { id: parsedId } });
        } else {
          // 如果不是数字，按编码查找
          docType = await this.docTypeRepository.findOne({ where: { code: docTypeIdText } });
        }
        
        if (!docType) {
          errors.push(`第${row.number}行：文件类型 "${docTypeIdText}" 不存在（可填ID或编码）`);
          failed++;
          continue;
        }
        
        const docTypeId = docType.id;

        // 如果字段编码为空，自动生成
        if (!fieldCode) {
          const maxCode = await this.repository
            .createQueryBuilder('df')
            .select('MAX(df.fieldCode)', 'max')
            .where('df.docTypeId = :docTypeId', { docTypeId })
            .getRawOne();
          
          const lastNum = maxCode?.max ? parseInt(maxCode.max.split('-').pop() || '0') : 0;
          fieldCode = `${docType.code}-${String(lastNum + 1).padStart(3, '0')}`;
        }

        // 解析是否必填
        const requiredFlagText = getCellText(row, 'requiredFlag');
        let requiredFlag = 0;
        if (requiredFlagText === '1' || requiredFlagText === '是' || requiredFlagText.toLowerCase() === 'yes') {
          requiredFlag = 1;
        }

        const dto: CreateDocFieldDefDto = {
          docTypeId,
          fieldCode,
          fieldName,
          fieldCategory: getCellText(row, 'fieldCategory') || undefined,
          requiredFlag,
          valueSource: getCellText(row, 'valueSource') || undefined,
          anchorWord: getCellText(row, 'anchorWord') || undefined,
          enumOptions: getCellText(row, 'enumOptions') || undefined,
          exampleValue: getCellText(row, 'exampleValue') || undefined,
          fieldDescription: getCellText(row, 'fieldDescription') || undefined,
          outputFormat: getCellText(row, 'outputFormat') || undefined,
          extractMethod: getCellText(row, 'extractMethod') || undefined,
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

  /**
   * 导出数据到 Excel
   */
  async exportToExcel(query: QueryDocFieldDefDto): Promise<ExcelJS.Workbook> {
    const queryBuilder = this.repository.createQueryBuilder('df')
      .leftJoinAndSelect('df.docType', 'docType');
    
    if (query.status !== undefined) {
      queryBuilder.andWhere('df.status = :status', { status: query.status });
    }
    if (query.docTypeIds && query.docTypeIds.length > 0) {
      queryBuilder.andWhere('df.docTypeId IN (:...docTypeIds)', { docTypeIds: query.docTypeIds });
    }
    if (query.keyword) {
      queryBuilder.andWhere(
        '(df.fieldName LIKE :keyword OR df.fieldCode LIKE :keyword OR df.fieldDescription LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    queryBuilder.orderBy('docType.code', 'ASC').addOrderBy('df.fieldCode', 'ASC');
    const data = await queryBuilder.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('关键信息字段');

    sheet.columns = [
      { header: '文件类型编码', key: 'docTypeCode', width: 20 },
      { header: '文件类型名称', key: 'docTypeName', width: 25 },
      { header: '字段编码', key: 'fieldCode', width: 25 },
      { header: '字段名称', key: 'fieldName', width: 20 },
      { header: '字段类别', key: 'fieldCategory', width: 12 },
      { header: '是否必填', key: 'requiredFlag', width: 10 },
      { header: '取值方式', key: 'valueSource', width: 30 },
      { header: '定位词', key: 'anchorWord', width: 30 },
      { header: '枚举值', key: 'enumOptions', width: 30 },
      { header: '示例数据', key: 'exampleValue', width: 25 },
      { header: '字段说明', key: 'fieldDescription', width: 40 },
      { header: '输出格式', key: 'outputFormat', width: 20 },
      { header: '提取方法', key: 'extractMethod', width: 15 },
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
        docTypeCode: item.docType?.code || '',
        docTypeName: item.docType?.name || '',
        fieldCode: item.fieldCode,
        fieldName: item.fieldName,
        fieldCategory: item.fieldCategory || '',
        requiredFlag: item.requiredFlag === 1 ? '是' : '否',
        valueSource: item.valueSource || '',
        anchorWord: item.anchorWord || '',
        enumOptions: item.enumOptions || '',
        exampleValue: item.exampleValue || '',
        fieldDescription: item.fieldDescription || '',
        outputFormat: item.outputFormat || '',
        extractMethod: item.extractMethod || '',
        status: item.status === 1 ? '启用' : '停用',
      });
    }

    return workbook;
  }
}
