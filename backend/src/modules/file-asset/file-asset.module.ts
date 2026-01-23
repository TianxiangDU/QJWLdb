import { Module } from '@nestjs/common';
import { FileAssetController } from './file-asset.controller';

/**
 * 文件资产模块
 * 依赖 CommonModule 提供的 FileAssetService
 */
@Module({
  controllers: [FileAssetController],
})
export class FileAssetModule {}
