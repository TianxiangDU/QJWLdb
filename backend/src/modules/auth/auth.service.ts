import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
import { OperationLogService } from '../../common/services/operation-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly operationLogService: OperationLogService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username, status: 1 } });
    if (user && await user.validatePassword(password)) {
      return user;
    }
    return null;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(dto.username, dto.password);
    if (!user) {
      // 记录登录失败日志
      await this.operationLogService.log({
        username: dto.username,
        module: 'auth',
        action: 'login',
        description: `用户 ${dto.username} 登录失败`,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: '用户名或密码错误',
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间和IP
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress || undefined;
    await this.userRepository.save(user);

    // 记录登录成功日志
    await this.operationLogService.log({
      userId: user.id,
      username: user.username,
      module: 'auth',
      action: 'login',
      description: `用户 ${user.username} 登录成功`,
      ipAddress,
      userAgent,
      success: true,
    });

    const payload = { sub: user.id, username: user.username, role: user.role, roleId: user.roleId };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        roleId: user.roleId,
        avatar: user.avatar,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    return { message: '注册成功', userId: user.id };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['roleEntity'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      roleId: user.roleId,
      roleName: user.roleEntity?.name,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, data: { nickname?: string; email?: string; phone?: string; avatar?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (data.nickname !== undefined) user.nickname = data.nickname;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await this.userRepository.save(user);

    return { message: '个人信息更新成功' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isValid = await user.validatePassword(dto.oldPassword);
    if (!isValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    user.password = dto.newPassword;
    await this.userRepository.save(user);

    return { message: '密码修改成功' };
  }

  async initAdmin() {
    const admin = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const user = this.userRepository.create({
        username: 'admin',
        password: 'admin123',
        nickname: '管理员',
        role: 'admin',
        status: 1,
      });
      await this.userRepository.save(user);
      console.log('✅ 初始管理员账号创建成功: admin / admin123');
    } else {
      // 确保管理员账号处于启用状态
      if (admin.status !== 1) {
        admin.status = 1;
        await this.userRepository.save(admin);
        console.log('✅ 管理员账号已启用');
      }
      console.log('✅ 管理员账号已存在');
    }
  }

  // 重置管理员密码（用于紧急恢复）
  async resetAdminPassword() {
    const admin = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (admin) {
      admin.password = 'admin123';
      admin.status = 1;
      await this.userRepository.save(admin);
      console.log('✅ 管理员密码已重置为: admin123');
      return { message: '管理员密码已重置' };
    }
    return { message: '管理员账号不存在' };
  }
}
