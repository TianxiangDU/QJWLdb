import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeSequence } from './entities/code-sequence.entity';
import { FileAsset } from './entities/file-asset.entity';
import { CodeService } from './services/code.service';
import { FileAssetService } from './services/file-asset.service';

/**
 * 通用模块
 * 提供编码生成、文件资产管理等通用服务
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CodeSequence, FileAsset]),
  ],
  providers: [CodeService, FileAssetService],
  exports: [CodeService, FileAssetService, TypeOrmModule],
})
export class CommonModule {}
