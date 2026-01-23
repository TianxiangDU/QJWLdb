import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeSequence } from './entities/code-sequence.entity';
import { FileAsset } from './entities/file-asset.entity';
import { EnumOption } from './entities/enum-option.entity';
import { CodeService } from './services/code.service';
import { FileAssetService } from './services/file-asset.service';
import { EnumOptionService } from './services/enum-option.service';
import { EnumOptionController } from './controllers/enum-option.controller';

/**
 * 通用模块
 * 提供编码生成、文件资产管理、枚举选项等通用服务
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CodeSequence, FileAsset, EnumOption]),
  ],
  controllers: [EnumOptionController],
  providers: [CodeService, FileAssetService, EnumOptionService],
  exports: [CodeService, FileAssetService, EnumOptionService, TypeOrmModule],
})
export class CommonModule {}
