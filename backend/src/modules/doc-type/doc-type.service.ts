import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { DocType } from './entities/doc-type.entity';
import { CreateDocTypeDto } from './dto/create-doc-type.dto';
import { UpdateDocTypeDto } from './dto/update-doc-type.dto';
import { QueryDocTypeDto } from './dto/query-doc-type.dto';
import { PaginationResultDto } from '../../common/dto/pagination.dto';
import { CodeService } from '../../common/services/code.service';
import { EnumOptionService, ENUM_CATEGORIES } from '../../common/services/enum-option.service';
import { ImportResult, ImportMode } from '../../common/interfaces/crud.interface';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocTypeService {
  constructor(
    @InjectRepository(DocType)
    private readonly docTypeRepository: Repository<DocType>,
    private readonly codeService: CodeService,
    private readonly enumOptionService: EnumOptionService,
  ) {}

  async create(createDto: CreateDocTypeDto): Promise<DocType> {
    const dto = { ...createDto };

    // 自动生成编码（如果未提供）
    if (!dto.code) {
      dto.code = await this.codeService.next('docType', 'PREFIX-YYYYMM-SEQ6');
    } else {
      // 检查编码唯一性
      const existing = await this.docTypeRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`文件类型编码 ${dto.code} 已存在`);
      }
    }

    const entity = this.docTypeRepository.create(dto);
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

  async update(id: number, updateDto: UpdateDocTypeDto & { rowVersion?: number }): Promise<DocType> {
    const entity = await this.findOne(id);

    // 乐观锁检查
    if (updateDto.rowVersion !== undefined && entity.rowVersion !== updateDto.rowVersion) {
      throw new ConflictException('数据已被他人更新，请刷新后重试');
    }

    // 不允许修改编码
    if (updateDto.code && updateDto.code !== entity.code) {
      throw new ConflictException('编码不允许修改');
    }

    // 移除 rowVersion，让 TypeORM 自动处理
    const { rowVersion, ...dto } = updateDto;

    Object.assign(entity, dto);
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
      { header: '文件类型编码（留空自动生成）', key: 'code', width: 25 },
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

  async importFromExcel(
    buffer: Buffer,
    options: { mode?: ImportMode; dryRun?: boolean } = {},
  ): Promise<ImportResult> {
    const { mode = 'upsert', dryRun = false } = options;
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      throw new Error('Excel文件格式错误');
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

    const rows = sheet.getRows(2, sheet.rowCount - 1) || [];
    const codeMap = new Map<string, number>(); // 用于文件内去重

    for (const row of rows) {
      const rowNum = row.number;
      try {
        const name = row.getCell(1).text?.trim();
        let code = row.getCell(2).text?.trim();

        if (!name) {
          if (code) {
            result.errors.push({ row: rowNum, field: 'name', message: '名称为必填项' });
            result.failed++;
          }
          continue;
        }

        // 文件内编码去重检查
        if (code && codeMap.has(code)) {
          result.duplicateRows!.push({
            row: rowNum,
            duplicateOf: codeMap.get(code)!,
            uniqueKey: `code=${code}`,
          });
          result.failed++;
          continue;
        }
        if (code) {
          codeMap.set(code, rowNum);
        }

        const dto: CreateDocTypeDto = {
          name,
          code: code || '',
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
        const existing = code
          ? await this.docTypeRepository.findOne({ where: { code } })
          : null;

        if (existing) {
          // 记录已存在
          if (mode === 'insertOnly') {
            result.errors.push({ row: rowNum, message: '记录已存在（insertOnly 模式）' });
            result.failed++;
            continue;
          }

          if (!dryRun) {
            Object.assign(existing, dto);
            await this.docTypeRepository.save(existing);
          }
          result.updated++;
          result.success++;
        } else {
          // 记录不存在
          if (mode === 'updateOnly') {
            result.errors.push({ row: rowNum, message: '记录不存在（updateOnly 模式）' });
            result.failed++;
            continue;
          }

          if (!dryRun) {
            // 自动生成编码
            if (!dto.code) {
              dto.code = await this.codeService.next('docType', 'PREFIX-YYYYMM-SEQ6');
            }
            const entity = this.docTypeRepository.create(dto);
            await this.docTypeRepository.save(entity);
          }
          result.created++;
          result.success++;
        }
      } catch (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.failed++;
      }
    }

    return result;
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

  /**
   * 从现有数据同步枚举选项到 enum_option 表
   */
  async syncEnumOptions(): Promise<{
    projectPhase: number;
    majorCategory: number;
    minorCategory: number;
    region: number;
    ownerOrg: number;
  }> {
    // 获取所有不重复的值
    const data = await this.docTypeRepository
      .createQueryBuilder('dt')
      .select([
        'dt.projectPhase',
        'dt.majorCategory',
        'dt.minorCategory',
        'dt.region',
        'dt.ownerOrg',
      ])
      .getMany();

    // 收集唯一值和大类-小类关系
    const projectPhases = new Set<string>();
    const majorCategories = new Set<string>();
    const minorCategories = new Set<string>();
    const regions = new Set<string>();
    const ownerOrgs = new Set<string>();
    const minorToMajorMap = new Map<string, string>();

    for (const item of data) {
      if (item.projectPhase) projectPhases.add(item.projectPhase);
      if (item.majorCategory) majorCategories.add(item.majorCategory);
      if (item.minorCategory) {
        minorCategories.add(item.minorCategory);
        if (item.majorCategory) {
          minorToMajorMap.set(item.minorCategory, item.majorCategory);
        }
      }
      if (item.region) regions.add(item.region);
      if (item.ownerOrg) ownerOrgs.add(item.ownerOrg);
    }

    // 同步到 enum_option 表
    const result = {
      projectPhase: await this.enumOptionService.syncFromExistingData(
        ENUM_CATEGORIES.PROJECT_PHASE,
        Array.from(projectPhases),
      ),
      majorCategory: await this.enumOptionService.syncFromExistingData(
        ENUM_CATEGORIES.MAJOR_CATEGORY,
        Array.from(majorCategories),
      ),
      minorCategory: await this.enumOptionService.syncFromExistingData(
        ENUM_CATEGORIES.MINOR_CATEGORY,
        Array.from(minorCategories),
        minorToMajorMap,
      ),
      region: await this.enumOptionService.syncFromExistingData(
        ENUM_CATEGORIES.REGION,
        Array.from(regions),
      ),
      ownerOrg: await this.enumOptionService.syncFromExistingData(
        ENUM_CATEGORIES.OWNER_ORG,
        Array.from(ownerOrgs),
      ),
    };

    return result;
  }
}
