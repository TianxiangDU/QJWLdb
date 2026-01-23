import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/crud.interface';

/**
 * 统一响应格式拦截器
 * 将响应包装为 { data, meta } 格式
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果响应已经是流（如文件下载），不处理
        const response = context.switchToHttp().getResponse();
        if (response.headersSent) {
          return data;
        }

        // 如果数据已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data;
        }

        // 如果是分页结果格式
        if (data && typeof data === 'object' && 'list' in data && 'total' in data) {
          return {
            data: data.list,
            meta: {
              page: data.page,
              pageSize: data.pageSize,
              total: data.total,
              totalPages: data.totalPages,
            },
          };
        }

        // 其他情况，包装为标准格式
        return {
          data,
          meta: {},
        };
      }),
    );
  }
}
