import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码哈希' })
  @Exclude()
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '昵称' })
  nickname: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @ApiProperty({ description: '角色', enum: ['admin', 'user'] })
  @Column({ type: 'varchar', length: 20, default: 'user', comment: '角色' })
  role: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}


