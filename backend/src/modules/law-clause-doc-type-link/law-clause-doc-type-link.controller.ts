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
import { LawClauseDocTypeLinkService } from './law-clause-doc-type-link.service';
import { LawClauseDocTypeLink } from './entities/law-clause-doc-type-link.entity';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';

@ApiTags('law-clause-doc-type-link')
@Controller('law-clause-doc-type-links')
export class LawClauseDocTypeLinkController {
  constructor(private readonly service: LawClauseDocTypeLinkService) {}

  @Post()
  @ApiOperation({ summary: '创建条款与文件类型关联' })
  create(@Body() data: Partial<LawClauseDocTypeLink>) {
    return this.service.create(data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取关联列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取关联详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新关联' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LawClauseDocTypeLink>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除关联' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('batch/enable')
  @ApiOperation({ summary: '批量启用关联' })
  batchEnable(@Body() { ids }: BatchIdsDto) {
    return this.service.batchUpdateStatus(ids, 1);
  }

  @Post('batch/disable')
  @ApiOperation({ summary: '批量停用关联' })
  batchDisable(@Body() { ids }: BatchIdsDto) {
    return this.service.batchUpdateStatus(ids, 0);
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除关联' })
  batchDelete(@Body() { ids }: BatchIdsDto) {
    return this.service.batchRemove(ids);
  }
}

