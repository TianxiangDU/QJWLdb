import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'newuser' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;
}

export class LoginResponseDto {
  @ApiProperty({ 
    description: '访问令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDk4ODg4ODgsImV4cCI6MTcxMDQ5MzY4OH0.xxxxx' 
  })
  accessToken: string;

  @ApiProperty({ 
    description: '用户信息',
    example: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      role: 'admin'
    }
  })
  user: {
    id: number;
    username: string;
    nickname: string;
    role: string;
  };
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: 'newpassword123' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  newPassword: string;
}


