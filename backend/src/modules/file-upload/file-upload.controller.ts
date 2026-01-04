import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'subDir', required: false, description: '子目录' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('subDir') subDir?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }
    return this.fileUploadService.handleUpload(file, subDir);
  }

  @Get('download/:subDir/:filename')
  @ApiOperation({ summary: '下载文件' })
  async downloadFile(
    @Param('subDir') subDir: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(subDir, filename);
    res.download(filePath);
  }
}

