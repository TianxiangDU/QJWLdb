import { Controller, Post, Get, Put, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, LoginResponseDto, UpdateProfileDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: '用户登录' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ): Promise<LoginResponseDto> {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人信息' })
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('reset-admin')
  @Public()
  @ApiOperation({ summary: '重置管理员密码（紧急恢复用）' })
  async resetAdminPassword() {
    return this.authService.resetAdminPassword();
  }
}
