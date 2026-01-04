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
import { LawDocumentService } from './law-document.service';
import { CreateLawDocumentDto } from './dto/create-law-document.dto';
import { UpdateLawDocumentDto } from './dto/update-law-document.dto';
import { QueryLawDocumentDto } from './dto/query-law-document.dto';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('law-document')
@Controller('law-documents')
export class LawDocumentController {
  constructor(private readonly service: LawDocumentService) {}

  @Post()
  @ApiOperation({ summary: '创建法规与标准' })
  create(@Body() createDto: CreateLawDocumentDto) {
    return this.service.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取法规与标准列表' })
  findAll(@Query() query: QueryLawDocumentDto) {
    return this.service.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有启用的法规与标准' })
  findAllActive() {
    return this.service.findAllActive();
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
    res.setHeader('Content-Disposition', 'attachment; filename=law-document-template.xlsx');
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
    return this.service.importFromExcel(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取法规与标准详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新法规与标准' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLawDocumentDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用法规与标准' })
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
