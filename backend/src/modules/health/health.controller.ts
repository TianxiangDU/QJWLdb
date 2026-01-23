import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

/**
 * 健康检查控制器
 */
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('healthz')
  @Public()
  @ApiOperation({ summary: '健康检查' })
  async healthCheck() {
    const checks: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // 检查数据库连接
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = { status: 'ok' };
    } catch (error) {
      checks.database = { status: 'error', message: error.message };
      checks.status = 'degraded';
    }

    return checks;
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: '就绪检查' })
  async readyCheck() {
    // 检查数据库连接
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ready' };
    } catch (error) {
      return { status: 'not_ready', message: error.message };
    }
  }
}
