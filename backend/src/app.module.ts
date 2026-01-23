import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

// 通用模块
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// 认证模块
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// 系统模块
import { HealthModule } from './modules/health/health.module';
import { MetaModule } from './modules/meta/meta.module';

// 业务模块
import { DocTypeModule } from './modules/doc-type/doc-type.module';
import { DocFieldDefModule } from './modules/doc-field-def/doc-field-def.module';
import { DocTemplateSampleModule } from './modules/doc-template-sample/doc-template-sample.module';
import { AuditRuleModule } from './modules/audit-rule/audit-rule.module';
import { AuditRuleFieldLinkModule } from './modules/audit-rule-field-link/audit-rule-field-link.module';
import { AuditRuleLawLinkModule } from './modules/audit-rule-law-link/audit-rule-law-link.module';
import { AuditRuleExampleModule } from './modules/audit-rule-example/audit-rule-example.module';
import { LawDocumentModule } from './modules/law-document/law-document.module';
import { LawClauseModule } from './modules/law-clause/law-clause.module';
import { LawClauseDocTypeLinkModule } from './modules/law-clause-doc-type-link/law-clause-doc-type-link.module';
import { CostRuleModule } from './modules/cost-rule/cost-rule.module';
import { BizProcessModule } from './modules/biz-process/biz-process.module';
import { CaseLibraryModule } from './modules/case-library/case-library.module';
import { KnowledgeSnippetModule } from './modules/knowledge-snippet/knowledge-snippet.module';
import { MonitorMetricModule } from './modules/monitor-metric/monitor-metric.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 数据库连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'qjwl_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', 'true') === 'true',
        charset: 'utf8mb4',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),
    // 静态文件服务 - 从 project/uploads 目录提供文件
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [{
        rootPath: join(process.cwd(), configService.get('UPLOAD_DIR', '../project/uploads')),
        serveRoot: '/static',
      }],
      inject: [ConfigService],
    }),
    // 系统模块
    HealthModule,
    MetaModule,
    // 认证模块
    AuthModule,
    // 业务模块
    DocTypeModule,
    DocFieldDefModule,
    DocTemplateSampleModule,
    AuditRuleModule,
    AuditRuleFieldLinkModule,
    AuditRuleLawLinkModule,
    AuditRuleExampleModule,
    LawDocumentModule,
    LawClauseModule,
    LawClauseDocTypeLinkModule,
    CostRuleModule,
    BizProcessModule,
    CaseLibraryModule,
    KnowledgeSnippetModule,
    MonitorMetricModule,
    FileUploadModule,
  ],
  providers: [
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // 全局响应拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 全局启用 JWT 鉴权守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
