import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get('UPLOAD_DIR', 'uploads');
        const uploadPath = join(process.cwd(), uploadDir);
        
        // 确保上传目录存在
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              const subDir = req.query.subDir as string || 'general';
              const fullPath = join(uploadPath, subDir);
              if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true });
              }
              cb(null, fullPath);
            },
            filename: (req, file, cb) => {
              const uniqueSuffix = uuidv4();
              const ext = extname(file.originalname);
              cb(null, `${uniqueSuffix}${ext}`);
            },
          }),
          limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
          },
          fileFilter: (req, file, cb) => {
            // 允许的文件类型
            const allowedMimes = [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/webp',
            ];
            if (allowedMimes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(new Error('不支持的文件类型'), false);
            }
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}


