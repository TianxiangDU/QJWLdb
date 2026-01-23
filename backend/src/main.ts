import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('工程咨询全业务数据库平台 API')
    .setDescription(`
## 概述
工程咨询全业务数据库平台后端接口文档 v1.0

## 认证
所有接口（除登录、注册、健康检查外）均需要 JWT 认证。
请在请求头中添加：\`Authorization: Bearer <token>\`

## 响应格式
- 成功：\`{ data: T, meta?: { page, pageSize, total, totalPages } }\`
- 失败：\`{ code: string, message: string, traceId: string, details?: any }\`

## 分页
- 默认 page=1, pageSize=10
- 最大 pageSize=100
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '输入 JWT Token 进行认证',
      },
      'JWT',
    )
    .addTag('health', '健康检查')
    .addTag('meta', '数据库结构')
    .addTag('认证', '用户认证')
    .addTag('doc-type', '文件类型')
    .addTag('doc-field-def', '关键信息字段')
    .addTag('doc-template-sample', '文件模板/示例')
    .addTag('audit-rule', '审计规则')
    .addTag('law-document', '法规与标准')
    .addTag('law-clause', '法规条款')
    .addTag('files', '文件上传')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 应用已启动: http://localhost:${port}`);
  logger.log(`📚 Swagger 文档: http://localhost:${port}/api-docs`);
  logger.log(`❤️ 健康检查: http://localhost:${port}/api/v1/healthz`);
  logger.log(`🔐 默认账号: admin / admin123`);
}

bootstrap();
