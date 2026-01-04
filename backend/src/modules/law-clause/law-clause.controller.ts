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
import { LawClauseService } from './law-clause.service';
import { LawClause } from './entities/law-clause.entity';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('law-clause')
@Controller('law-clauses')
export class LawClauseController {
  constructor(private readonly service: LawClauseService) {}

  @Post()
  @ApiOperation({ summary: '创建法规条款' })
  create(@Body() data: Partial<LawClause>) {
    return this.service.create(data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取法规条款列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有启用的法规条款' })
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get('by-law/:lawDocumentId')
  @ApiOperation({ summary: '根据法规ID获取条款列表' })
  findByLawDocument(@Param('lawDocumentId', ParseIntPipe) lawDocumentId: number) {
    return this.service.findByLawDocumentId(lawDocumentId);
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
    res.setHeader('Content-Disposition', 'attachment; filename=law-clause-template.xlsx');
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
  @ApiOperation({ summary: '获取法规条款详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新法规条款' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LawClause>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用法规条款' })
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

