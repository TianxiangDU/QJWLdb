import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { MetaService } from './meta.service';

/**
 * 数据库元数据控制器
 * 提供数据库结构探索 API
 */
@ApiTags('meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('tables')
  @ApiOperation({ summary: '获取所有表信息' })
  async getTables() {
    return this.metaService.getTables();
  }

  @Get('tables/:tableName')
  @ApiOperation({ summary: '获取表详情（字段、索引、外键）' })
  @ApiParam({ name: 'tableName', description: '表名' })
  async getTableDetail(@Param('tableName') tableName: string) {
    return this.metaService.getTableDetail(tableName);
  }

  @Get('dict.xlsx')
  @ApiOperation({ summary: '导出数据字典 Excel' })
  async exportDataDict(@Res() res: Response) {
    const workbook = await this.metaService.exportDataDict();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=data-dict-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    
    await workbook.xlsx.write(res);
    res.end();
  }
}
