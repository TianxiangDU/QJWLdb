import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { DocType } from './entities/doc-type.entity';
import { CreateDocTypeDto } from './dto/create-doc-type.dto';
import { UpdateDocTypeDto } from './dto/update-doc-type.dto';
import { QueryDocTypeDto } from './dto/query-doc-type.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocTypeService {
  constructor(
    @InjectRepository(DocType)
    private readonly docTypeRepository: Repository<DocType>,
  ) {}

  async create(createDto: CreateDocTypeDto): Promise<DocType> {
    // 检查编码唯一性
    const existing = await this.docTypeRepository.findOne({
      where: { code: createDto.code },
    });
    if (existing) {
      throw new ConflictException(`文件类型编码 ${createDto.code} 已存在`);
    }

    const entity = this.docTypeRepository.create(createDto);
    return this.docTypeRepository.save(entity);
  }

  async findAll(query: QueryDocTypeDto): Promise<PaginationResultDto<DocType>> {
    const { page = 1, pageSize = 10, keyword, status, code, projectPhase, projectType } = query;

    const where: FindOptionsWhere<DocType> = {};

    if (status !== undefined) {
      where.status = status;
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (projectPhase) {
      where.projectPhase = projectPhase;
    }
    if (projectType) {
      where.projectType = Like(`%${projectType}%`);
    }

    const queryBuilder = this.docTypeRepository.createQueryBuilder('dt');
    
    if (status !== undefined) {
      queryBuilder.andWhere('dt.status = :status', { status });
    }
    if (code) {
      queryBuilder.andWhere('dt.code LIKE :code', { code: `%${code}%` });
    }
    if (projectPhase) {
      queryBuilder.andWhere('dt.projectPhase = :projectPhase', { projectPhase });
    }
    if (projectType) {
      queryBuilder.andWhere('dt.projectType LIKE :projectType', { projectType: `%${projectType}%` });
    }
    if (keyword) {
      queryBuilder.andWhere('(dt.name LIKE :keyword OR dt.bizDescription LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder
      .orderBy('dt.createdAt', 'DESC')
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

  async findOne(id: number): Promise<DocType> {
    const entity = await this.docTypeRepository.findOne({
      where: { id },
      relations: ['fields', 'templates'],
    });
    if (!entity) {
      throw new NotFoundException(`文件类型 ID ${id} 不存在`);
    }
    return entity;
  }

  /**
   * 获取文件类型的完整信息，包括关键信息字段和文件模板/示例
   * @param idOrCode 文件类型ID或编码
   */
  async getFullInfo(idOrCode: string): Promise<{
    docType: DocType;
    fields: any[];
    templates: any[];
  }> {
    // 判断是ID还是编码
    const isId = /^\d+$/.test(idOrCode);
    
    let docType: DocType | null;
    if (isId) {
      docType = await this.docTypeRepository.findOne({
        where: { id: parseInt(idOrCode) },
      });
    } else {
      docType = await this.docTypeRepository.findOne({
        where: { code: idOrCode },
      });
    }

    if (!docType) {
      throw new NotFoundException(`文件类型 ${idOrCode} 不存在`);
    }

    // 获取关键信息字段（只返回启用的）
    const fields = await this.docTypeRepository.manager
      .createQueryBuilder('DocFieldDef', 'f')
      .where('f.docTypeId = :docTypeId', { docTypeId: docType.id })
      .andWhere('f.status = 1')
      .orderBy('f.fieldCode', 'ASC')
      .getMany();

    // 获取文件模板/示例（只返回启用的）
    const templates = await this.docTypeRepository.manager
      .createQueryBuilder('DocTemplateSample', 't')
      .where('t.docTypeId = :docTypeId', { docTypeId: docType.id })
      .andWhere('t.status = 1')
      .orderBy('t.fileName', 'ASC')
      .getMany();

    return {
      docType: {
        id: docType.id,
        code: docType.code,
        name: docType.name,
        projectPhase: docType.projectPhase,
        majorCategory: docType.majorCategory,
        minorCategory: docType.minorCategory,
        fileFeature: docType.fileFeature,
        projectType: docType.projectType,
        region: docType.region,
        ownerOrg: docType.ownerOrg,
        bizDescription: docType.bizDescription,
        remark: docType.remark,
        status: docType.status,
        createdAt: docType.createdAt,
        updatedAt: docType.updatedAt,
      } as DocType,
      fields: fields.map((f: any) => ({
        id: f.id,
        fieldCode: f.fieldCode,
        fieldName: f.fieldName,
        fieldCategory: f.fieldCategory,
        requiredFlag: f.requiredFlag,
        valueSource: f.valueSource,
        enumOptions: f.enumOptions,
        exampleValue: f.exampleValue,
        fieldDescription: f.fieldDescription,
      })),
      templates: templates.map((t: any) => ({
        id: t.id,
        fileName: t.fileName,
        description: t.description,
      })),
    };
  }

  async update(id: number, updateDto: UpdateDocTypeDto): Promise<DocType> {
    const entity = await this.findOne(id);

    // 如果要更新编码，检查唯一性
    if (updateDto.code && updateDto.code !== entity.code) {
      const existing = await this.docTypeRepository.findOne({
        where: { code: updateDto.code },
      });
      if (existing) {
        throw new ConflictException(`文件类型编码 ${updateDto.code} 已存在`);
      }
    }

    Object.assign(entity, updateDto);
    return this.docTypeRepository.save(entity);
  }

  // 真正的物理删除
  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.docTypeRepository.remove(entity);
  }

  // 批量启用
  async batchEnable(ids: number[]): Promise<{ affected: number }> {
    const result = await this.docTypeRepository
      .createQueryBuilder()
      .update()
      .set({ status: 1 })
      .whereInIds(ids)
      .execute();
    return { affected: result.affected || 0 };
  }

  // 批量停用
  async batchDisable(ids: number[]): Promise<{ affected: number }> {
    const result = await this.docTypeRepository
      .createQueryBuilder()
      .update()
      .set({ status: 0 })
      .whereInIds(ids)
      .execute();
    return { affected: result.affected || 0 };
  }

  // 批量删除
  async batchDelete(ids: number[]): Promise<{ affected: number }> {
    const result = await this.docTypeRepository
      .createQueryBuilder()
      .delete()
      .whereInIds(ids)
      .execute();
    return { affected: result.affected || 0 };
  }

  async getExcelTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('文件类型');

    sheet.columns = [
      { header: '文件类型名称*', key: 'name', width: 25 },
      { header: '文件类型编码*', key: 'code', width: 20 },
      { header: '所属项目阶段', key: 'projectPhase', width: 15 },
      { header: '所属大类', key: 'majorCategory', width: 15 },
      { header: '所属小类', key: 'minorCategory', width: 15 },
      { header: '适用项目类型', key: 'projectType', width: 20 },
      { header: '适用地区', key: 'region', width: 15 },
      { header: '适用业主', key: 'ownerOrg', width: 20 },
      { header: '业务说明/使用场景', key: 'bizDescription', width: 40 },
      { header: '文件特征信息（LLM识别）', key: 'fileFeature', width: 40 },
      { header: '备注', key: 'remark', width: 30 },
    ];

    // 设置表头样式
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
        const name = row.getCell(1).text?.trim();
        const code = row.getCell(2).text?.trim();

        if (!code || !name) {
          if (code || name) {
            errors.push(`第${row.number}行：编码和名称为必填项`);
            failed++;
          }
          continue;
        }

        const dto: CreateDocTypeDto = {
          name,
          code,
          projectPhase: row.getCell(3).text?.trim() || undefined,
          majorCategory: row.getCell(4).text?.trim() || undefined,
          minorCategory: row.getCell(5).text?.trim() || undefined,
          projectType: row.getCell(6).text?.trim() || undefined,
          region: row.getCell(7).text?.trim() || undefined,
          ownerOrg: row.getCell(8).text?.trim() || undefined,
          bizDescription: row.getCell(9).text?.trim() || undefined,
          fileFeature: row.getCell(10).text?.trim() || undefined,
          remark: row.getCell(11).text?.trim() || undefined,
        };

        // 检查是否已存在
        const existing = await this.docTypeRepository.findOne({ where: { code } });
        if (existing) {
          Object.assign(existing, dto);
          await this.docTypeRepository.save(existing);
        } else {
          const entity = this.docTypeRepository.create(dto);
          await this.docTypeRepository.save(entity);
        }
        success++;
      } catch (error) {
        errors.push(`第${row.number}行：${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  async findAllActive(): Promise<DocType[]> {
    return this.docTypeRepository.find({
      where: { status: 1 },
      order: { code: 'ASC' },
    });
  }

  /**
   * 获取所有筛选选项（从数据库中获取不重复的值）
   */
  async getFilterOptions(): Promise<{
    projectPhases: string[];
    majorCategories: string[];
    minorCategories: string[];
  }> {
    const projectPhases = await this.docTypeRepository
      .createQueryBuilder('dt')
      .select('DISTINCT dt.projectPhase', 'value')
      .where('dt.projectPhase IS NOT NULL AND dt.projectPhase != ""')
      .orderBy('dt.projectPhase', 'ASC')
      .getRawMany();

    const majorCategories = await this.docTypeRepository
      .createQueryBuilder('dt')
      .select('DISTINCT dt.majorCategory', 'value')
      .where('dt.majorCategory IS NOT NULL AND dt.majorCategory != ""')
      .orderBy('dt.majorCategory', 'ASC')
      .getRawMany();

    const minorCategories = await this.docTypeRepository
      .createQueryBuilder('dt')
      .select('DISTINCT dt.minorCategory', 'value')
      .where('dt.minorCategory IS NOT NULL AND dt.minorCategory != ""')
      .orderBy('dt.minorCategory', 'ASC')
      .getRawMany();

    return {
      projectPhases: projectPhases.map(r => r.value).filter(Boolean),
      majorCategories: majorCategories.map(r => r.value).filter(Boolean),
      minorCategories: minorCategories.map(r => r.value).filter(Boolean),
    };
  }
}
