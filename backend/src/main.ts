import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    }),
  );

  // 启用 CORS - 允许局域网访问
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('工程咨询全业务数据库平台 API')
    .setDescription('工程咨询全业务数据库平台后端接口文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '输入JWT Token进行认证',
      },
      'JWT',
    )
    .addTag('认证', '用户认证相关接口')
    .addTag('doc-type', '文件类型管理')
    .addTag('关键信息字段', '关键信息字段管理')
    .addTag('doc-template-sample', '文件模板/示例')
    .addTag('audit-rule', '审计规则')
    .addTag('law-document', '法规与标准')
    .addTag('law-clause', '法规条款')
    .addTag('files', '文件上传')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 应用已启动: http://localhost:${port}`);
  console.log(`🌐 局域网访问: http://10.9.17.159:${port}`);
  console.log(`📚 Swagger 文档: http://10.9.17.159:${port}/api-docs`);
  console.log(`🔐 默认管理员账号: admin / admin123`);
}
bootstrap();
