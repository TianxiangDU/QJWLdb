import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { DocFieldDefService } from './doc-field-def.service';
import { CreateDocFieldDefDto } from './dto/create-doc-field-def.dto';
import { UpdateDocFieldDefDto } from './dto/update-doc-field-def.dto';
import { QueryDocFieldDefDto } from './dto/query-doc-field-def.dto';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('关键信息字段')
@Controller('doc-field-defs')
export class DocFieldDefController {
  constructor(private readonly service: DocFieldDefService) {}

  @Post()
  @ApiOperation({ summary: '创建关键信息字段' })
  create(@Body() createDto: CreateDocFieldDefDto) {
    return this.service.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取关键信息字段列表' })
  findAll(@Query() query: QueryDocFieldDefDto) {
    return this.service.findAll(query);
  }

  @Get('by-doc-type/:docTypeId')
  @ApiOperation({ summary: '根据文件类型ID获取字段列表' })
  findByDocType(@Param('docTypeId', ParseIntPipe) docTypeId: number) {
    return this.service.findByDocTypeId(docTypeId);
  }

  @Get('template')
  @Public()
  @ApiOperation({ summary: '下载Excel导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const workbook = await this.service.getExcelTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=key-field-template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('export')
  @ApiOperation({ summary: '导出数据到Excel' })
  async exportExcel(@Query() query: QueryDocFieldDefDto, @Res() res: Response) {
    const workbook = await this.service.exportToExcel(query);
    const filename = `doc-field-defs_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @ApiOperation({ summary: 'Excel批量导入' })
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
    if (!file) {
      throw new BadRequestException('请选择要导入的Excel文件');
    }
    if (!file.buffer) {
      throw new BadRequestException('文件内容为空');
    }
    // 检查文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(file.mimetype) && !file.originalname?.endsWith('.xlsx') && !file.originalname?.endsWith('.xls')) {
      throw new BadRequestException('请上传Excel文件（.xlsx或.xls格式）');
    }
    return this.service.importFromExcel(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取关键信息字段详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新关键信息字段' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocFieldDefDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用关键信息字段' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('batch/enable')
  @ApiOperation({ summary: '批量启用' })
  batchEnable(@Body() dto: BatchIdsDto) {
    return this.service.batchEnable(dto.ids);
  }

  @Post('batch/disable')
  @ApiOperation({ summary: '批量停用' })
  batchDisable(@Body() dto: BatchIdsDto) {
    return this.service.batchDisable(dto.ids);
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除' })
  batchDelete(@Body() dto: BatchIdsDto) {
    return this.service.batchDelete(dto.ids);
  }
}
