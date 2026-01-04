import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FileUploadService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = configService.get('UPLOAD_DIR', 'uploads');
  }

  handleUpload(file: Express.Multer.File, subDir?: string) {
    const relativePath = subDir
      ? `${subDir}/${file.filename}`
      : `general/${file.filename}`;

    return {
      success: true,
      filePath: relativePath,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/static/${relativePath}`,
    };
  }

  getFilePath(subDir: string, filename: string): string {
    const filePath = join(process.cwd(), this.uploadDir, subDir, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('文件不存在');
    }
    return filePath;
  }
}


