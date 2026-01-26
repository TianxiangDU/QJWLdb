import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FileAssetService, UploadResult } from '../../common/services/file-asset.service';
import { existsSync, createReadStream } from 'fs';
import { lookup } from 'mime-types';

@ApiTags('文件资产')
@ApiBearerAuth()
@Controller('files')
export class FileAssetController {
  constructor(private readonly fileAssetService: FileAssetService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件（自动去重）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        subDir: {
          type: 'string',
          description: '子目录（可选）',
          example: 'templates',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('subDir') subDir?: string,
  ): Promise<{
    id: number;
    sha256: string;
    storagePath: string;
    originalName: string;
    size: number;
    mime: string;
    isExisting: boolean;
    message: string;
    url: string;
  }> {
    const result = await this.fileAssetService.upload(file, subDir || 'general');
    return {
      ...result,
      url: `/static${result.storagePath}`,
      message: result.isExisting ? '文件已存在，已复用' : '上传成功',
    };
  }

  @Get(':id/info')
  @ApiOperation({ summary: '获取文件信息' })
  async getInfo(@Param('id', ParseIntPipe) id: number) {
    return this.fileAssetService.findById(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: '预览文件（PDF/图片用 inline，其他下载）' })
  async preview(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fileAsset = await this.fileAssetService.findById(id);
    const fullPath = this.fileAssetService.getFullPath(fileAsset.storagePath);

    if (!existsSync(fullPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }

    const mimeType = lookup(fullPath) || 'application/octet-stream';
    const isPreviewable = mimeType.startsWith('image/') || mimeType === 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      isPreviewable ? 'inline' : `attachment; filename="${encodeURIComponent(fileAsset.originalName)}"`,
    );

    createReadStream(fullPath).pipe(res);
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载文件' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fileAsset = await this.fileAssetService.findById(id);
    const fullPath = this.fileAssetService.getFullPath(fileAsset.storagePath);

    if (!existsSync(fullPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }

    const mimeType = lookup(fullPath) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileAsset.originalName)}"`,
    );

    createReadStream(fullPath).pipe(res);
  }

  @Get('check/:sha256')
  @ApiOperation({ summary: '检查文件是否已存在' })
  async checkExists(@Param('sha256') sha256: string) {
    const exists = await this.fileAssetService.exists(sha256);
    const fileAsset = exists ? await this.fileAssetService.findBySha256(sha256) : null;
    return {
      exists,
      fileAsset,
    };
  }
}
