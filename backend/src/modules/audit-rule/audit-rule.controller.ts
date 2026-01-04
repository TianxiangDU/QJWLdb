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
import { AuditRuleService } from './audit-rule.service';
import { CreateAuditRuleDto } from './dto/create-audit-rule.dto';
import { UpdateAuditRuleDto } from './dto/update-audit-rule.dto';
import { QueryAuditRuleDto } from './dto/query-audit-rule.dto';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('audit-rule')
@Controller('audit-rules')
export class AuditRuleController {
  constructor(private readonly service: AuditRuleService) {}

  @Post()
  @ApiOperation({ summary: '创建审计规则' })
  create(@Body() createDto: CreateAuditRuleDto) {
    return this.service.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取审计规则列表' })
  findAll(@Query() query: QueryAuditRuleDto) {
    return this.service.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有启用的审计规则' })
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
    res.setHeader('Content-Disposition', 'attachment; filename=audit-rule-template.xlsx');
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
  @ApiOperation({ summary: '获取审计规则详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新审计规则' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAuditRuleDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用审计规则' })
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
