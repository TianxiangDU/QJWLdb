import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocTemplateSampleService } from './doc-template-sample.service';
import { CreateDocTemplateSampleDto } from './dto/create-doc-template-sample.dto';
import { UpdateDocTemplateSampleDto } from './dto/update-doc-template-sample.dto';
import { QueryDocTemplateSampleDto } from './dto/query-doc-template-sample.dto';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';

@ApiTags('doc-template-sample')
@Controller('doc-template-samples')
export class DocTemplateSampleController {
  constructor(private readonly service: DocTemplateSampleService) {}

  @Post()
  @ApiOperation({ summary: '创建文件模板/示例' })
  create(@Body() createDto: CreateDocTemplateSampleDto) {
    return this.service.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取文件模板/示例列表' })
  findAll(@Query() query: QueryDocTemplateSampleDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件模板/示例详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文件模板/示例' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocTemplateSampleDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用文件模板/示例' })
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
