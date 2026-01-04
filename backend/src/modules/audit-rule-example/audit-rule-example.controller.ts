import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditRuleExampleService } from './audit-rule-example.service';
import { AuditRuleExample } from './entities/audit-rule-example.entity';

@ApiTags('audit-rule-example')
@Controller('audit-rule-examples')
export class AuditRuleExampleController {
  constructor(private readonly service: AuditRuleExampleService) {}

  @Post()
  @ApiOperation({ summary: '创建规则案例' })
  create(@Body() data: Partial<AuditRuleExample>) {
    return this.service.create(data);
  }

  @Get('by-rule/:ruleId')
  @ApiOperation({ summary: '根据规则ID获取案例' })
  findByRuleId(@Param('ruleId', ParseIntPipe) ruleId: number) {
    return this.service.findByRuleId(ruleId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取案例详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新案例' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<AuditRuleExample>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除案例' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}


