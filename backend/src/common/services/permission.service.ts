import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

// 系统模块定义
const SYSTEM_MODULES = [
  { code: 'doc-type', name: '文件类型' },
  { code: 'doc-field-def', name: '关键信息字段' },
  { code: 'doc-template-sample', name: '文件模板/示例' },
  { code: 'audit-rule', name: '审计规则' },
  { code: 'law-document', name: '法规与标准' },
  { code: 'law-clause', name: '法规条款' },
  { code: 'user', name: '用户管理' },
  { code: 'role', name: '角色管理' },
  { code: 'system', name: '系统设置' },
];

// 操作类型定义
const ACTIONS = [
  { code: 'view', name: '查看' },
  { code: 'create', name: '新建' },
  { code: 'update', name: '编辑' },
  { code: 'delete', name: '删除' },
  { code: 'import', name: '导入' },
  { code: 'export', name: '导出' },
];

@Injectable()
export class PermissionService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.initPermissions();
    await this.initRoles();
  }

  /**
   * 初始化权限数据
   */
  async initPermissions(): Promise<void> {
    const existingCount = await this.permissionRepository.count();
    if (existingCount > 0) {
      console.log(`✅ 权限数据已存在（${existingCount}条）`);
      return;
    }

    const permissions: Partial<Permission>[] = [];
    let sortOrder = 0;

    for (const module of SYSTEM_MODULES) {
      for (const action of ACTIONS) {
        // 某些模块不需要所有操作
        if (module.code === 'system' && ['create', 'delete', 'import', 'export'].includes(action.code)) {
          continue;
        }

        permissions.push({
          code: `${module.code}:${action.code}`,
          name: `${module.name} - ${action.name}`,
          module: module.code,
          action: action.code,
          description: `${action.name}${module.name}的权限`,
          sortOrder: sortOrder++,
          status: 1,
        });
      }
    }

    await this.permissionRepository.save(permissions);
    console.log(`✅ 初始化权限数据成功（${permissions.length}条）`);
  }

  /**
   * 初始化角色数据
   */
  async initRoles(): Promise<void> {
    // 检查管理员角色是否存在
    const adminRole = await this.roleRepository.findOne({ where: { code: 'admin' } });
    if (!adminRole) {
      // 获取所有权限
      const allPermissions = await this.permissionRepository.find({ where: { status: 1 } });

      const role = this.roleRepository.create({
        code: 'admin',
        name: '管理员',
        description: '系统管理员，拥有所有权限',
        isSystem: 1,
        sortOrder: 0,
        status: 1,
        permissions: allPermissions,
      });
      await this.roleRepository.save(role);
      console.log('✅ 初始化管理员角色成功');
    }

    // 检查普通用户角色是否存在
    const userRole = await this.roleRepository.findOne({ where: { code: 'user' } });
    if (!userRole) {
      // 普通用户只有查看和导出权限
      const viewPermissions = await this.permissionRepository.find({
        where: [
          { action: 'view', status: 1 },
          { action: 'export', status: 1 },
        ],
      });

      const role = this.roleRepository.create({
        code: 'user',
        name: '普通用户',
        description: '普通用户，只有查看和导出权限',
        isSystem: 1,
        sortOrder: 1,
        status: 1,
        permissions: viewPermissions,
      });
      await this.roleRepository.save(role);
      console.log('✅ 初始化普通用户角色成功');
    }

    // 检查只读角色是否存在
    const readonlyRole = await this.roleRepository.findOne({ where: { code: 'readonly' } });
    if (!readonlyRole) {
      const viewPermissions = await this.permissionRepository.find({
        where: { action: 'view', status: 1 },
      });

      const role = this.roleRepository.create({
        code: 'readonly',
        name: '只读用户',
        description: '只读用户，只能查看数据',
        isSystem: 1,
        sortOrder: 2,
        status: 1,
        permissions: viewPermissions,
      });
      await this.roleRepository.save(role);
      console.log('✅ 初始化只读用户角色成功');
    }
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(roleId: number): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, status: 1 },
      relations: ['permissions'],
    });

    if (!role) {
      return [];
    }

    return role.permissions
      .filter((p) => p.status === 1)
      .map((p) => p.code);
  }

  /**
   * 检查用户是否有权限
   */
  async hasPermission(roleId: number, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(roleId);
    return permissions.includes(permissionCode);
  }

  /**
   * 获取所有权限（按模块分组）
   */
  async getAllPermissions(): Promise<{ module: string; moduleName: string; permissions: Permission[] }[]> {
    const permissions = await this.permissionRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC' },
    });

    const grouped = new Map<string, Permission[]>();
    for (const p of permissions) {
      if (!grouped.has(p.module)) {
        grouped.set(p.module, []);
      }
      grouped.get(p.module)!.push(p);
    }

    const result = [];
    for (const module of SYSTEM_MODULES) {
      if (grouped.has(module.code)) {
        result.push({
          module: module.code,
          moduleName: module.name,
          permissions: grouped.get(module.code)!,
        });
      }
    }

    return result;
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { status: 1 },
      relations: ['permissions'],
      order: { sortOrder: 'ASC' },
    });
  }
}
