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
import { AuditRuleLawLinkService } from './audit-rule-law-link.service';
import { AuditRuleLawLink } from './entities/audit-rule-law-link.entity';

@ApiTags('audit-rule-law-link')
@Controller('audit-rule-law-links')
export class AuditRuleLawLinkController {
  constructor(private readonly service: AuditRuleLawLinkService) {}

  @Post()
  @ApiOperation({ summary: '创建规则法规关联' })
  create(@Body() data: Partial<AuditRuleLawLink>) {
    return this.service.create(data);
  }

  @Get('by-rule/:ruleId')
  @ApiOperation({ summary: '根据规则ID获取关联法规' })
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
    @Body() data: Partial<AuditRuleLawLink>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除关联' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}


