import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeSequence } from './entities/code-sequence.entity';
import { FileAsset } from './entities/file-asset.entity';
import { EnumOption } from './entities/enum-option.entity';
import { OperationLog } from './entities/operation-log.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { CodeService } from './services/code.service';
import { FileAssetService } from './services/file-asset.service';
import { EnumOptionService } from './services/enum-option.service';
import { OperationLogService } from './services/operation-log.service';
import { PermissionService } from './services/permission.service';
import { EnumOptionController } from './controllers/enum-option.controller';
import { OperationLogController } from './controllers/operation-log.controller';
import { PermissionController } from './controllers/permission.controller';

/**
 * 通用模块
 * 提供编码生成、文件资产管理、枚举选项、操作日志、权限管理等通用服务
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CodeSequence, 
      FileAsset, 
      EnumOption,
      OperationLog,
      Permission,
      Role,
    ]),
  ],
  controllers: [
    EnumOptionController,
    OperationLogController,
    PermissionController,
  ],
  providers: [
    CodeService, 
    FileAssetService, 
    EnumOptionService,
    OperationLogService,
    PermissionService,
  ],
  exports: [
    CodeService, 
    FileAssetService, 
    EnumOptionService,
    OperationLogService,
    PermissionService,
    TypeOrmModule,
  ],
})
export class CommonModule {}
