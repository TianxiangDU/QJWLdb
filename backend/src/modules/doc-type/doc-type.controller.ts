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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { DocTypeService } from './doc-type.service';
import { CreateDocTypeDto } from './dto/create-doc-type.dto';
import { UpdateDocTypeDto } from './dto/update-doc-type.dto';
import { QueryDocTypeDto } from './dto/query-doc-type.dto';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('doc-type')
@Controller('doc-types')
export class DocTypeController {
  constructor(private readonly docTypeService: DocTypeService) {}

  @Post()
  @ApiOperation({ summary: '创建文件类型' })
  create(@Body() createDto: CreateDocTypeDto) {
    return this.docTypeService.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取文件类型列表' })
  findAll(@Query() query: QueryDocTypeDto) {
    return this.docTypeService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有启用的文件类型' })
  findAllActive() {
    return this.docTypeService.findAllActive();
  }

  @Get('filter-options')
  @ApiOperation({ summary: '获取筛选选项（从数据库动态获取）' })
  getFilterOptions() {
    return this.docTypeService.getFilterOptions();
  }

  @Get('template')
  @Public()
  @ApiOperation({ summary: '下载Excel导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const workbook = await this.docTypeService.getExcelTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=doc-type-template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @ApiOperation({ 
    summary: 'Excel批量导入',
    description: '支持 upsert（默认）、insertOnly、updateOnly 三种模式，dryRun=true 时只校验不落库',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        mode: { type: 'string', enum: ['upsert', 'insertOnly', 'updateOnly'], default: 'upsert' },
        dryRun: { type: 'boolean', default: false },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('mode') mode?: 'upsert' | 'insertOnly' | 'updateOnly',
    @Body('dryRun') dryRun?: string,
  ) {
    return this.docTypeService.importFromExcel(file.buffer, {
      mode: mode || 'upsert',
      dryRun: dryRun === 'true',
    });
  }

  @Get('full/:idOrCode')
  @ApiOperation({ 
    summary: '获取文件类型完整信息',
    description: '根据文件类型ID或编码，返回文件类型信息、关键信息字段列表、文件模板/示例列表',
  })
  getFullInfo(@Param('idOrCode') idOrCode: string) {
    return this.docTypeService.getFullInfo(idOrCode);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件类型详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.docTypeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文件类型' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocTypeDto,
  ) {
    return this.docTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用文件类型' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docTypeService.remove(id);
  }

  @Post('batch/enable')
  @ApiOperation({ summary: '批量启用' })
  batchEnable(@Body() dto: BatchIdsDto) {
    return this.docTypeService.batchEnable(dto.ids);
  }

  @Post('batch/disable')
  @ApiOperation({ summary: '批量停用' })
  batchDisable(@Body() dto: BatchIdsDto) {
    return this.docTypeService.batchDisable(dto.ids);
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除' })
  batchDelete(@Body() dto: BatchIdsDto) {
    return this.docTypeService.batchDelete(dto.ids);
  }
}

