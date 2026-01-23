import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求日志中间件
 * - 为每个请求生成 traceId
 * - 记录请求开始和结束
 * - 标记慢查询（> 3s）
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly SLOW_QUERY_THRESHOLD = 3000; // 3 秒

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const traceId = uuidv4();
    const startTime = Date.now();

    // 将 traceId 附加到请求对象
    (req as any).traceId = traceId;

    // 设置响应头
    res.setHeader('X-Trace-Id', traceId);

    // 请求日志
    this.logger.log(
      `[${traceId}] --> ${method} ${originalUrl} - IP: ${ip}`,
    );

    // 响应完成时记录
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logMessage = `[${traceId}] <-- ${method} ${originalUrl} - ${statusCode} - ${duration}ms`;

      if (duration > this.SLOW_QUERY_THRESHOLD) {
        this.logger.warn(`${logMessage} [SLOW QUERY]`);
      } else if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
