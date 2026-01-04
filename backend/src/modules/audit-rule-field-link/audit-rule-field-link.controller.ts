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
import { AuditRuleFieldLinkService } from './audit-rule-field-link.service';
import { AuditRuleFieldLink } from './entities/audit-rule-field-link.entity';

@ApiTags('audit-rule-field-link')
@Controller('audit-rule-field-links')
export class AuditRuleFieldLinkController {
  constructor(private readonly service: AuditRuleFieldLinkService) {}

  @Post()
  @ApiOperation({ summary: '创建规则字段关联' })
  create(@Body() data: Partial<AuditRuleFieldLink>) {
    return this.service.create(data);
  }

  @Get('by-rule/:ruleId')
  @ApiOperation({ summary: '根据规则ID获取关联字段' })
  findByRuleId(@Param('ruleId', ParseIntPipe) ruleId: number) {
    return this.service.findByRuleId(ruleId);
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
    @Body() data: Partial<AuditRuleFieldLink>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除关联' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}


