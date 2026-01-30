import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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
      dto.code = await this.generateDocTypeCode(dto);
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

  /**
   * 生成文件类型编码
   * 格式：{阶段缩写}{大类缩写}{小类序号}{地区序号}{业主序号}{序号}
   * 示例：QQTZ0101001
   */
  private async generateDocTypeCode(dto: Partial<CreateDocTypeDto>): Promise<string> {
    const { projectPhase, majorCategory, minorCategory, region, ownerOrg } = dto;

    // 获取阶段缩写
    let phaseCode = 'XX';
    if (projectPhase) {
      const phaseOption = await this.enumOptionService.getOptionByValue('projectPhase', projectPhase);
      phaseCode = phaseOption?.shortCode || 'XX';
    }

    // 获取大类缩写
    let majorCode = 'XX';
    if (majorCategory) {
      const majorOption = await this.enumOptionService.getOptionByValue('majorCategory', majorCategory);
      majorCode = majorOption?.shortCode || 'XX';
    }

    // 获取小类序号（2位）
    let minorSeq = '00';
    if (minorCategory) {
      const minorOption = await this.enumOptionService.getOptionByValue('minorCategory', minorCategory);
      minorSeq = String(minorOption?.sortOrder || 0).padStart(2, '0');
    }

    // 获取地区序号（2位）
    let regionSeq = '00';
    if (region) {
      const regionOption = await this.enumOptionService.getOptionByValue('region', region);
      regionSeq = String(regionOption?.sortOrder || 0).padStart(2, '0');
    }

    // 获取业主序号（2位）
    let ownerSeq = '00';
    if (ownerOrg) {
      const ownerOption = await this.enumOptionService.getOptionByValue('ownerOrg', ownerOrg);
      ownerSeq = String(ownerOption?.sortOrder || 0).padStart(2, '0');
    }

    // 生成前缀（无分隔符）
    const prefix = `${phaseCode}${majorCode}${minorSeq}${regionSeq}${ownerSeq}`;

    // 获取该前缀下的序号
    const seq = await this.getNextSeqForPrefix(prefix);

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  /**
   * 获取指定前缀下的下一个序号
   */
  private async getNextSeqForPrefix(prefix: string): Promise<number> {
    // 查找以该前缀开头的最大编码
    const result = await this.docTypeRepository
      .createQueryBuilder('dt')
      .select('dt.code')
      .where('dt.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('dt.code', 'DESC')
      .getOne();

    if (!result) return 1;

    // 提取最后3位作为序号
    const code = result.code;
    const seqStr = code.slice(-3);
    const lastSeq = parseInt(seqStr, 10);
    return isNaN(lastSeq) ? 1 : lastSeq + 1;
  }

  /**
   * 重新生成所有文件类型的编码
   */
  async regenerateAllCodes(): Promise<{ updated: number; errors: string[] }> {
    const allDocTypes = await this.docTypeRepository.find();
    let updated = 0;
    const errors: string[] = [];

    for (const docType of allDocTypes) {
      try {
        const newCode = await this.generateDocTypeCode({
          projectPhase: docType.projectPhase,
          majorCategory: docType.majorCategory,
          minorCategory: docType.minorCategory,
          region: docType.region,
          ownerOrg: docType.ownerOrg,
        });
        
        if (docType.code !== newCode) {
          docType.code = newCode;
          await this.docTypeRepository.save(docType);
          updated++;
        }
      } catch (err) {
        errors.push(`ID ${docType.id}: ${err.message}`);
      }
    }

    return { updated, errors };
  }

  async findAll(query: QueryDocTypeDto): Promise<PaginationResultDto<DocType>> {
    const { page = 1, pageSize = 10, keyword, status, code, projectPhase, majorCategory, minorCategory, projectType } = query;

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
    if (majorCategory) {
      queryBuilder.andWhere('dt.majorCategory = :majorCategory', { majorCategory });
    }
    if (minorCategory) {
      queryBuilder.andWhere('dt.minorCategory = :minorCategory', { minorCategory });
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
        code: t.code,
        name: t.name,
        fileName: t.fileName,
        filePath: t.filePath,
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

    // 列顺序与前端表格一致
    sheet.columns = [
      { header: '编码（留空自动生成）', key: 'code', width: 25 },
      { header: '名称*', key: 'name', width: 30 },
      { header: '项目阶段*', key: 'projectPhase', width: 15 },
      { header: '大类*', key: 'majorCategory', width: 15 },
      { header: '小类*', key: 'minorCategory', width: 18 },
      { header: '文件特征', key: 'fileFeature', width: 30 },
      { header: '项目类型', key: 'projectType', width: 12 },
      { header: '适用地区', key: 'region', width: 12 },
      { header: '适用业主', key: 'ownerOrg', width: 15 },
      { header: '业务说明', key: 'bizDescription', width: 40 },
      { header: '备注', key: 'remark', width: 25 },
    ];

    // 设置表头样式
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 添加说明行
    const noteRow = sheet.addRow({
      code: '留空则自动生成',
      name: '必填，文件类型的名称',
      projectPhase: '如：招投标阶段',
      majorCategory: '如：投标文件',
      minorCategory: '如：投标函',
      fileFeature: 'LLM识别的文件特征',
      projectType: '如：通用',
      region: '如：通用',
      ownerOrg: '如：通用',
      bizDescription: '描述该文件类型的使用场景',
      remark: '其他备注信息',
    });
    noteRow.font = { italic: true, color: { argb: 'FF888888' } };

    return workbook;
  }

  async importFromExcel(
    buffer: Buffer,
    options: { mode?: ImportMode; dryRun?: boolean } = {},
  ): Promise<ImportResult> {
    const { mode = 'upsert', dryRun = false } = options;
    
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
        // 列顺序：编码、名称、阶段、大类、小类...
        let code = row.getCell(1).text?.trim();
        const name = row.getCell(2).text?.trim();

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

        // 列顺序：编码、名称、阶段、大类、小类、文件特征、项目类型、地区、业主、业务说明、备注
        const dto: CreateDocTypeDto = {
          code: code || '',
          name,
          projectPhase: row.getCell(3).text?.trim() || undefined,
          majorCategory: row.getCell(4).text?.trim() || undefined,
          minorCategory: row.getCell(5).text?.trim() || undefined,
          fileFeature: row.getCell(6).text?.trim() || undefined,
          projectType: row.getCell(7).text?.trim() || undefined,
          region: row.getCell(8).text?.trim() || undefined,
          ownerOrg: row.getCell(9).text?.trim() || undefined,
          bizDescription: row.getCell(10).text?.trim() || undefined,
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
            // 自动生成编码（使用与create方法相同的逻辑）
            if (!dto.code) {
              dto.code = await this.generateDocTypeCode(dto);
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

  /**
   * 导出数据到 Excel
   */
  async exportToExcel(query: QueryDocTypeDto): Promise<ExcelJS.Workbook> {
    // 获取所有符合条件的数据（不分页）
    const queryBuilder = this.docTypeRepository.createQueryBuilder('dt');
    
    if (query.status !== undefined) {
      queryBuilder.andWhere('dt.status = :status', { status: query.status });
    }
    if (query.keyword) {
      queryBuilder.andWhere(
        '(dt.name LIKE :keyword OR dt.code LIKE :keyword OR dt.bizDescription LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }
    if (query.projectPhase) {
      queryBuilder.andWhere('dt.projectPhase = :projectPhase', { projectPhase: query.projectPhase });
    }
    if (query.majorCategory) {
      queryBuilder.andWhere('dt.majorCategory = :majorCategory', { majorCategory: query.majorCategory });
    }

    queryBuilder.orderBy('dt.code', 'ASC');
    const data = await queryBuilder.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('文件类型');

    // 导出列顺序与模板和前端一致
    sheet.columns = [
      { header: '编码', key: 'code', width: 25 },
      { header: '名称', key: 'name', width: 30 },
      { header: '项目阶段', key: 'projectPhase', width: 15 },
      { header: '大类', key: 'majorCategory', width: 15 },
      { header: '小类', key: 'minorCategory', width: 18 },
      { header: '文件特征', key: 'fileFeature', width: 30 },
      { header: '项目类型', key: 'projectType', width: 12 },
      { header: '适用地区', key: 'region', width: 12 },
      { header: '适用业主', key: 'ownerOrg', width: 15 },
      { header: '业务说明', key: 'bizDescription', width: 40 },
      { header: '备注', key: 'remark', width: 25 },
      { header: '状态', key: 'status', width: 8 },
    ];

    // 设置表头样式
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 添加数据
    for (const item of data) {
      sheet.addRow({
        code: item.code,
        name: item.name,
        projectPhase: item.projectPhase || '',
        majorCategory: item.majorCategory || '',
        minorCategory: item.minorCategory || '',
        fileFeature: item.fileFeature || '',
        projectType: item.projectType || '',
        region: item.region || '',
        ownerOrg: item.ownerOrg || '',
        bizDescription: item.bizDescription || '',
        remark: item.remark || '',
        status: item.status === 1 ? '启用' : '停用',
      });
    }

    return workbook;
  }
}
