import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from '../interfaces/crud.interface';

/**
 * 全局异常过滤器
 * 统一错误响应格式：{ code, message, traceId, details }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = (request as any).traceId || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || message;
        
        // 处理 class-validator 的验证错误
        if (Array.isArray(resp.message)) {
          message = resp.message[0];
          details = resp.message;
        }
      }

      // 根据状态码设置错误代码
      code = this.getErrorCode(status);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        `TraceId: ${traceId}`,
      );
    }

    const errorResponse: ErrorResponse = {
      code,
      message,
      traceId,
      details,
    };

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      `TraceId: ${traceId}`,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
