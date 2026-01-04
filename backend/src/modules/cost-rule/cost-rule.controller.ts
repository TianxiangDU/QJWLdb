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
import { CostRuleService } from './cost-rule.service';
import { BatchIdsDto } from '../../common/dto/batch-operation.dto';
import { CostRule } from './entities/cost-rule.entity';

@ApiTags('cost-rule')
@Controller('cost-rules')
export class CostRuleController {
  constructor(private readonly service: CostRuleService) {}

  @Post()
  @ApiOperation({ summary: '创建工程造价规则' })
  create(@Body() data: Partial<CostRule>) {
    return this.service.create(data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取工程造价规则列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工程造价规则详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工程造价规则' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<CostRule>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/停用工程造价规则' })
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


