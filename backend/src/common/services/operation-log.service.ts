import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';

export interface LogOperationParams {
  userId?: number;
  username?: string;
  module: string;
  action: string;
  targetId?: number;
  targetName?: string;
  description?: string;
  requestData?: any;
  responseData?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly repository: Repository<OperationLog>,
  ) {}

  /**
   * 记录操作日志
   */
  async log(params: LogOperationParams): Promise<OperationLog> {
    const logEntity = new OperationLog();
    logEntity.userId = params.userId;
    logEntity.username = params.username;
    logEntity.module = params.module;
    logEntity.action = params.action;
    logEntity.targetId = params.targetId;
    logEntity.targetName = params.targetName;
    logEntity.description = params.description;
    logEntity.requestData = params.requestData ? JSON.stringify(params.requestData) : undefined;
    logEntity.responseData = params.responseData ? JSON.stringify(params.responseData) : undefined;
    logEntity.ipAddress = params.ipAddress;
    logEntity.userAgent = params.userAgent;
    logEntity.success = params.success !== false ? 1 : 0;
    logEntity.errorMessage = params.errorMessage;
    return this.repository.save(logEntity);
  }

  /**
   * 查询操作日志
   */
  async findAll(query: {
    page?: number;
    pageSize?: number;
    userId?: number;
    module?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, pageSize = 20, userId, module, action, startDate, endDate } = query;

    const queryBuilder = this.repository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }
    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }
    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }
    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 清理过期日志（默认保留90天）
   */
  async cleanOldLogs(days: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.repository.delete({
      createdAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}
