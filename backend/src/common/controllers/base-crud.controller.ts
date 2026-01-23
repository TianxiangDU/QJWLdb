import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { BaseCrudService } from '../services/base-crud.service';
import { ObjectLiteral } from 'typeorm';
import { BatchIdsDto } from '../dto/batch-operation.dto';

/**
 * 通用 CRUD 控制器基类
 * 子类需要添加 @Controller 和 @ApiTags 装饰器
 */
export abstract class BaseCrudController<T extends ObjectLiteral> {
  protected abstract readonly service: BaseCrudService<T>;

  /**
   * 资源名称（用于下载文件命名）
   */
  protected abstract readonly resourceName: string;

  @Post()
  @ApiOperation({ summary: '创建' })
  @ApiCreatedResponse({ description: '创建成功' })
  async create(@Body() createDto: any): Promise<T> {
    return this.service.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取列表（分页）' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('template')
  @ApiOperation({ summary: '下载导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const workbook = await this.service.getExcelTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(this.resourceName)}模板.xlsx`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @ApiOperation({ summary: 'Excel 批量导入' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.service.importFromExcel(file.buffer);
  }

  @Get('export')
  @ApiOperation({ summary: '导出 Excel' })
  async exportExcel(@Query() query: any, @Res() res: Response) {
    const workbook = await this.service.exportToExcel(query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(this.resourceName)}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取详情' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
  ): Promise<T> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }

  @Post('batch/enable')
  @ApiOperation({ summary: '批量启用' })
  async batchEnable(@Body() dto: BatchIdsDto) {
    return this.service.batchEnable(dto.ids);
  }

  @Post('batch/disable')
  @ApiOperation({ summary: '批量停用' })
  async batchDisable(@Body() dto: BatchIdsDto) {
    return this.service.batchDisable(dto.ids);
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除' })
  async batchDelete(@Body() dto: BatchIdsDto) {
    return this.service.batchDelete(dto.ids);
  }
}
