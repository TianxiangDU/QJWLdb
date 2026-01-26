import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermissionService } from '../services/permission.service';

@ApiTags('权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('all')
  @ApiOperation({ summary: '获取所有权限（按模块分组）' })
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @Get('roles')
  @ApiOperation({ summary: '获取所有角色' })
  async getAllRoles() {
    return this.permissionService.getAllRoles();
  }
}
