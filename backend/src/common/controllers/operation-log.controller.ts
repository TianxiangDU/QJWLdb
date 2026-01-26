import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { OperationLogService } from '../services/operation-log.service';

@ApiTags('操作日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operation-logs')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get('list')
  @ApiOperation({ summary: '查询操作日志列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'module', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('userId') userId?: number,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.operationLogService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      userId: userId ? Number(userId) : undefined,
      module,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
